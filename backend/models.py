from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import  (
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

import datetime

from app import db
from enums import (
    BalanceSheetEntryType,
    FulfilmentType,
    InvestmentIncomeType,
    TransactionType,
)


class Info(db.Model):
    """
    Store individual values that need to be saved but are one-off

    Info that is currently stored:
    * Start date (prior income will be counted up to this date)
    * Real hourly wage
    """

    __tablename__ = 'info'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False, unique=True)
    value = db.Column(db.String(128), nullable=False) # while the value itself might not be a string, it is the most comprehensive

    permitted_titles = [
        'start_date',
        'real_hourly_wage', # stored in cents
        'average_monthly_expense', # stored in cents
        'long_term_interest_rate' # stored as decimal (e.g., 5% stored as 0.05)
    ]


# STEP 1 - how much have you earned in your life and balance sheet of assets + liabilities (up to start point)
class PriorIncome(db.Model):
    """
    Money that you have earned prior to starting this program
    """

    __tablename__ = 'prior_income'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False) # stored in cents
    description = db.Column(db.String(512), nullable=False) # description of earning situation
    date = db.Column(db.Date, nullable=False) # nearest or exact date of earning


class BalanceSheetEntry(db.Model):
    """
    Assets and liabilities
    """

    __tablename__ = 'balance_sheet_entry'

    id = db.Column(db.Integer, primary_key=True)
    entry_type = db.Column(db.Enum(BalanceSheetEntryType), nullable=False) # type of asset or liability
    value = db.Column(db.Integer, nullable=False) # value (liabilities are stored in positive form here), in cents
    description = db.Column(db.String(512), nullable=False) # description of what the asset/liability is


# STEP 2 - real hourly wage and daily transaction tracking
class WeeklyJobTransaction(db.Model):
    """
    Job-related income or expenditure and hours spent every week
    """

    __tablename__ = 'weekly_job_transaction'

    id = db.Column(db.Integer, primary_key=True)
    transaction_type = db.Column(db.Enum(TransactionType), nullable=False) # income or expenditure
    value = db.Column(db.Integer, nullable=False) # positive, cents
    hours = db.Column(db.Integer, nullable=False) # hours spent on this transaction every week
    description = db.Column(db.String(50), nullable=False)


class Transaction(db.Model):
    """
    Any kind of daily transaction (income or expenditure)
    """

    __tablename__ = 'transaction'

    id = db.Column(db.Integer, primary_key=True)
    transaction_type = db.Column(db.Enum(TransactionType), nullable=False) # income or expenditure
    value = db.Column(db.Integer, nullable=False) # positive, cents
    description = db.Column(db.String(512), nullable=False)
    date = db.Column(db.Date, nullable=False)

    # categorize transaction at the end of each month
    category_id = db.Column(db.Integer, ForeignKey('transaction_category.id'))
    category = relationship("TransactionCategory", back_populates="transactions")


# STEP 3 - monthly tabulation and reconciliation
class TransactionCategory(db.Model):
    """
    Income/spending categories to group individual transactions
    into (eventually at the monthly level)
    """

    __tablename__ = 'transaction_category'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), nullable=False)

    # categorized transactions
    transactions = relationship("Transaction", back_populates="category")


class MonthInfo(db.Model):
    """
    Total records for the month:
        - income
        - expenditure
        - investment income
        - assets
        - liabilities
        - net worth (assets - liabilities)
    """

    __tablename__ = 'month_info'

    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, nullable=False)
    month = db.Column(db.Integer, nullable=False) # 1 = January, ..., 12 = December

    income = db.Column(db.Integer, nullable=False, default=0) # in cents
    expenditure = db.Column(db.Integer, nullable=False, default=0) # in cents
    investment_income = db.Column(db.Integer, nullable=False, default=0) # in cents
    assets = db.Column(db.BigInteger, nullable=False, default=0) # in cents
    liabilities = db.Column(db.BigInteger, nullable=False, default=0) # in cents

    real_hourly_wage = db.Column(db.Integer, nullable=False, default=0) # in cents, rwh for this month
    # whether the month has been fully analyzed, should only be true after the month is over
    completed = db.Column(db.Boolean, nullable=False, default=False)

    __table_args__ = (UniqueConstraint('year', 'month', name='_month_info_year_month_uc'),)


class MonthCategory(db.Model):
    """
    Month-category relation and fulfilment association
    """

    __tablename__ = 'category_month'

    id = db.Column(db.Integer, primary_key=True)

    month_info_id = db.Column(db.Integer, ForeignKey('month_info.id'), nullable=False)
    month_info = relationship("MonthInfo")

    category_id = db.Column(db.Integer, ForeignKey('transaction_category.id'), nullable=False)
    category = relationship("TransactionCategory")

    fulfilment = db.Column(db.Enum(FulfilmentType), nullable=False, default=FulfilmentType.neutral)

    __table_args__ = (UniqueConstraint('month_info_id', 'category_id', name='_month_category_uc'),)


# Step 9 - investment income
class InvestmentIncome(db.Model):
    """
    Individual investment income (or out-go) associated with one investment
    for a given month
    """

    __tablename__ = 'investment_income'

    id = db.Column(db.Integer, primary_key=True)

    month_info_id = db.Column(db.Integer, ForeignKey('month_info.id'), nullable=False)
    month_info = relationship("MonthInfo")

    investment_income_type = db.Column(db.Enum(InvestmentIncomeType), nullable=False) # type of investment change
    value = db.Column(db.Integer, nullable=False) # can be negative or positive, cents
    description = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=True) # optional date field


class MonthReflection(db.Model):
    """
    Monthly satisfaction and fulfilment evaluation
    """

    __tablename__ = 'month_reflection'

    id = db.Column(db.Integer, primary_key=True)

    month_info_id = db.Column(db.Integer, ForeignKey('month_info.id'), nullable=False, unique=True)
    month_info = relationship("MonthInfo")

    q_living_dying = db.Column(db.String(1024))
    q_employment_purpose = db.Column(db.String(1024))
    q_spending_evaluation = db.Column(db.String(1024))


class AssetAccount(db.Model):
    """
    Account for categorized asset and liability tracking (i.e. a single savings
    account or a single real estate holding)

    equity = asset_value - liability_value
    networth = sum(AssetAccount.asset_value - AssetAccount.liability_value)
    """

    __tablename__ = 'asset_account'

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(256), nullable=False)


class MonthAssetAccountEntry(db.Model):
    """
    Value associations for an asset account on a given month
    """

    __tablename__ = 'month_asset_account_entry'

    id = db.Column(db.Integer, primary_key=True)

    month_info_id = db.Column(db.Integer, ForeignKey('month_info.id'), nullable=False)
    month_info = relationship("MonthInfo")

    asset_account_id = db.Column(db.Integer, ForeignKey('asset_account.id'), nullable=False)
    asset_account = relationship("AssetAccount")

    asset_value = db.Column(db.BigInteger, nullable=False, default=0) # must be positive, cents
    liability_value = db.Column(db.BigInteger, nullable=False, default=0) # must be positive, cents

    __table_args__ = (UniqueConstraint('month_info_id', 'asset_account_id', name='_month_assetaccount_uc'),)


# DON'T NEED USER MODEL BECAUSE THIS IS JUST FOR PERSONAL USE (at least for now!)
# class User(db.Model):

#     __tablename__ = 'user'

#     id = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String(80), unique=True, nullable=False)
#     email = db.Column(db.String(120), unique=True, nullable=False)
#     first_name = db.Column(db.String(30))
#     last_name = db.Column(db.String(30))

#     def __repr__(self):
#         return '<User {}>'.format(self.username)

