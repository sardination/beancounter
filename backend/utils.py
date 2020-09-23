from sqlalchemy import extract

from enums import TransactionType
from models import (
    Info,
    MonthInfo,
    Transaction,
)

from app import db

import datetime

def get_start_date():
    start_date_info = Info.query.filter_by(title="start_date").first()
    start_date = datetime.datetime.strptime(start_date_info.value, "%Y-%m-%d")
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
            # keep real hourly wage the same unless the month is still uncompleted
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

