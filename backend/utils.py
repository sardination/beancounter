from sqlalchemy import extract

from enums import TransactionType
from models import (
    Info,
    MonthInfo,
    Transaction,
)

from db import db

from datetime import datetime
from dateutil import tz
import os
import shutil

def get_start_date():
    start_date_info = Info.query.filter_by(title="start_date").first()
    start_date = datetime.strptime(start_date_info.value, "%Y-%m-%d")
    return start_date.date()


def get_month_info(year, month, commit=False, recalc_totals=False):
    """
    Get MonthInfo from specified year and month, create one if does not
    already exist. If `commit` = True, then commit to db. If `recalc_totals`
    = True, then recalculate sums even if MonthInfo object already exists.
    If MonthInfo did not already exist, then add to session.
    """

    month_info = MonthInfo.query.filter_by(
        year=year,
        month=month
    ).first()
    if month_info is not None and not recalc_totals:
        return month_info

    # TODO: possible to get sum using SA?
    transactions = Transaction.query.filter(
        extract('year', Transaction.date) == year,
        extract('month', Transaction.date) == month
    ).all()
    income = 0
    expenditure = 0
    for t in transactions:
        if t.transaction_type == TransactionType.income:
            income += t.value
        else:
            expenditure += t.value

    # get current real hourly wage to assign to this month
    real_hourly_wage = Info.query.filter_by(title="real_hourly_wage").first()
    if real_hourly_wage is None:
        real_hourly_wage = 0
    else:
        real_hourly_wage = int(real_hourly_wage.value)

    if month_info is not None and recalc_totals:
        month_info.income = income
        month_info.expenditure = expenditure
        if not month_info.completed:
            # keep real hourly wage the same unless the month is still incomplete
            month_info.real_hourly_wage = real_hourly_wage
        return month_info

    month_info = MonthInfo(
        year=year,
        month=month,
        income=income,
        expenditure=expenditure,
        real_hourly_wage=real_hourly_wage
    )
    db.session.add(month_info)

    if commit:
        db.session.commit()

    return month_info


def month_year_between_dates(earliest_date, latest_date, month, year):
    """
    Check if month and year falls in the range of earliest and latest dates
    """
    if year == earliest_date.year:
        return month >= earliest_date.month
    if year == latest_date.year:
        return month <= latest_date.month
    return year > earliest_date.year and year < latest_date.month

def convert_zulu_timestamp_to_datestring(zulu_timestamp):
    """
    Convert a zulu (UTC) timestamp to a simple local time date string
    """
    try:
        date = datetime.strptime(zulu_timestamp, "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=tz.tzutc())
        date = date.astimezone(tz.tzlocal())
        return date.strftime("%Y-%m-%d")
    except:
        pass
    return zulu_timestamp[:10]


### BACKUP HANDLING ###

def get_backup_folder_path(config):
    """
    Returns the backup folder path and creates it if it doesn't exist.
    """

    # Create a backups folder if it doesn't exist already
    backup_folder_path = os.path.join(os.path.dirname(config.db_file_path), "backups")
    if not os.path.isdir(backup_folder_path):
        os.mkdir(backup_folder_path)

    return backup_folder_path

def backup_database(config):
    """
    Create a database backup for the appropriate config (DevConfig or ProdConfig)
    """

    backup_folder_path = get_backup_folder_path(config)

    # Copy database to backup file
    backup_filename = "{}-{}".format(datetime.timestamp(datetime.now()), config.db_name)
    backup_file_path = os.path.join(backup_folder_path, backup_filename)
    shutil.copy(config.db_file_path, backup_file_path)

    # If there are more than 3 files in the backups directory, delete the earliest N-3 files
    MAX_BACKUP_COUNT = 3
    backup_list = os.listdir(backup_folder_path)
    if len(backup_list) > MAX_BACKUP_COUNT:
        timestamp_backup_map = {}
        for backup_filename in backup_list:
            try:
                timestamp = float(backup_filename.split("-")[0])
                timestamp_backup_map[timestamp] = backup_filename
            except:
                continue

        to_delete = len(backup_list) - MAX_BACKUP_COUNT
        timestamp_list = list(timestamp_backup_map.keys())
        timestamp_list.sort()
        for timestamp_key in timestamp_list[:to_delete]:
            file_to_remove = os.path.join(backup_folder_path, timestamp_backup_map[timestamp_key])
            os.remove(file_to_remove)

def maybe_backup_database(config, time_delta):
    """
    Create a database backup, but only if the latest backup was more than `time_delta`
    ago.
    """

    backup_folder_path = get_backup_folder_path(config)
    backup_list = os.listdir(backup_folder_path)

    # If the latest timestamp is more than `time_delta` from now, make another backup
    backup_list = os.listdir(backup_folder_path)
    latest_timestamp = -1
    for backup_filename in backup_list:
        try:
            curr_timestamp = float(backup_filename.split("-")[0])
        except:
            continue
        if curr_timestamp > latest_timestamp:
            latest_timestamp = curr_timestamp
    if latest_timestamp == -1 or (datetime.now() - datetime.fromtimestamp(latest_timestamp)) > time_delta:
        backup_database(config)
