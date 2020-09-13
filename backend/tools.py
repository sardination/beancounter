# tools for updating database content wholesale
from models import (
    MonthInfo,
    Transaction,
)
from utils import (
    get_start_date,
    get_month_info,
)

from app import db

import datetime

def populate_month_infos():
    transactions = Transaction.query.all()
    start_date = get_start_date()
    todays_date = datetime.date.today()

    all_month_infos = []
    for year in range(start_date.year, todays_date.year + 1):
        start_month = 1
        end_month = 12
        if year == start_date.year:
            start_month = start_date.month
        if year == todays_date.year:
            end_month = todays_date.month
        for month in range(start_month, end_month + 1):
            month_info = get_month_info(year, month, recalc_totals=True)
            all_month_infos.append(month_info)

    db.session.commit()
    return all_month_infos