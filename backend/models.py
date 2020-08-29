from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

from app import db
from enums import (
    BalanceSheetEntryType,
    TransactionType,
)


class Info(db.Model):
    """
    Store individual values that need to be saved but are one-off

    Info that is currently stored:
    * Start date (prior income will be counted up to this date)
    """

    __tablename__ = 'info'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False, unique=True)
    value = db.Column(db.String(128), nullable=False) # while the value itself might not be a string, it is the most comprehensive

    permitted_titles = [
        'start_date'
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

