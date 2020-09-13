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
    return start_date


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

    if month_info is not None and recalc_totals:
        month_info.income = income
        month_info.expenditure = expenditure
        return month_info

    month_info = MonthInfo(
        year=year,
        month=month,
        income=income,
        expenditure=expenditure
    )
    db.session.add(month_info)

    if commit:
        db.session.commit()

    return month_info