from sqlalchemy import extract, func

from enums import TransactionType
from models import (
    AssetAccount,
    ExchangeRate,
    Info,
    InvestmentIncome,
    MonthAssetAccountEntry,
    MonthInfo,
    Transaction,
)

from db import db

from datetime import datetime
from dateutil import tz
import decimal
import os
import shutil

def get_start_date():
    start_date_info = Info.query.filter_by(title="start_date").first()
    start_date = datetime.strptime(start_date_info.value, "%Y-%m-%d")
    return start_date.date()

def get_or_create_month_info(year, month):
    """
    Get MonthInfo from specified year and month, or create one and
    add to db session if it does not already exist.
    """

    month_info = MonthInfo.query.filter_by(
        year=year,
        month=month
    ).first()
    if month_info is not None:
        return month_info

    # get current real hourly wage to assign to this month
    real_hourly_wage = Info.query.filter_by(title="real_hourly_wage").first()
    if real_hourly_wage is None:
        real_hourly_wage = 0
    else:
        real_hourly_wage = int(real_hourly_wage.value)

    month_info = MonthInfo(
        year=year,
        month=month,
        income=income,
        expenditure=expenditure,
        real_hourly_wage=real_hourly_wage
    )
    db.session.add(month_info)

    return month_info

def get_exchange_rate_map(month_info):
    exchange_rate_map = {'USD': decimal.Decimal(1.0)}

    exchange_rates = ExchangeRate.query.filter(ExchangeRate.month_info_id == month_info.id).all()
    for exchange_rate in exchange_rates:
        exchange_rate_map[exchange_rate.currency] = decimal.Decimal(exchange_rate.rate)

    return exchange_rate_map

def calculate_month_info_transaction_totals(month_info, update=False):
    """
    Get the total income and expenditures for the given month.
    If `update=True`, then update month_info with the calculated values.
    """

    exchange_rate_map = get_exchange_rate_map(month_info)
    transactions = Transaction.query.filter(
        extract('year', Transaction.date) == month_info.year,
        extract('month', Transaction.date) == month_info.month
    ).all()

    income_total = 0
    expenditure_total = 0
    for transaction in transactions:
        rate = exchange_rate_map.get(transaction.currency)
        if rate is None:
            continue
        if transaction.transaction_type == TransactionType.income:
            income_total += decimal.Decimal(transaction.value) / rate
        elif transaction.transaction_type == TransactionType.expenditure:
            expenditure_total += decimal.Decimal(transaction.value) / rate

    if update:
        decimal.getcontext().rounding = decimal.ROUND_HALF_UP
        month_info.income = round(income_total)
        month_info.expenditure = round(expenditure_total)

    return {'income': income_total, 'expenditure': expenditure_total}

def calculate_month_info_investment_income_total(month_info, update=False):
    """
    Get the total investment income for the given month.
    If `update=True`, then update month_info with the calculated values.
    """

    exchange_rate_map = get_exchange_rate_map(month_info)
    investment_incomes = InvestmentIncome.query.filter_by(month_info_id=month_info.id).all()

    total = 0
    for investment_income in investment_incomes:
        rate = exchange_rate_map.get(investment_income.currency)
        if rate is None:
            continue
        total += decimal.Decimal(investment_income.value) / rate


    if update:
        decimal.getcontext().rounding = decimal.ROUND_HALF_UP
        month_info.investment_income = round(total)

    return total

def calculate_month_info_asset_totals(month_info, update=False):
    """
    Get the total assets and liabilities for the given month.
    If `update=True`, then update month_info with the calculated values.
    """

    exchange_rate_map = get_exchange_rate_map(month_info)
    asset_entries = db.session.query(
        MonthAssetAccountEntry, AssetAccount
    ).filter(
        MonthAssetAccountEntry.month_info_id == month_info.id
    ).filter(
        AssetAccount.id == MonthAssetAccountEntry.asset_account_id
    ).all()

    asset_total = 0
    liability_total = 0
    for asset_entry in asset_entries:
        month_entry = asset_entry[0]
        asset_account = asset_entry[1]
        rate = exchange_rate_map.get(asset_account.currency)
        if rate is None:
            continue
        asset_total += decimal.Decimal(month_entry.asset_value) / rate
        liability_total += decimal.Decimal(month_entry.liability_value) / rate

    if update:
        decimal.getcontext().rounding = decimal.ROUND_HALF_UP
        month_info.assets = round(asset_total)
        month_info.liabilities = round(liability_total)

    return {'assets': asset_total, 'liabilities': liability_total}

def month_year_between_dates(earliest_date, latest_date, month, year):
    """
    Check if month and year falls in the range of earliest and latest dates
    """
    if year == earliest_date.year:
        return month >= earliest_date.month
    if year == latest_date.year:
        return month <= latest_date.month
    return year > earliest_date.year and year < latest_date.year

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
    backup_list = list(filter(lambda x: x[-3:] == ".db", os.listdir(backup_folder_path)))
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
