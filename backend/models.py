from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from app import db
from enums import BalanceSheetEntryEnum


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
    entry_type = db.Column(db.Enum(BalanceSheetEntryEnum), nullable=False) # type of asset or liability
    value = db.Column(db.Integer, nullable=False) # value (liabilities are stored in positive form here), in cents
    description = db.Column(db.String(512), nullable=False) # description of what the asset/liability is




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


# class Transaction(db.Model):

#     __tablename__ = 'transaction'

#     id = db.Column(db.Integer, primary_key=True)

#     outgoing = db.Column(db.Boolean, nullable=False)
#     transactor = db.Column(db.String(120), nullable=False)
#     description = db.Column(db.String(512))

#     def __repr__(self):
#         source = self.user.username
#         destination = self.transactor
#         if not outgoing:
#             destination = source
#             source = self.transactor
#         return '<Transaction {} -{}-> {}>'.format()



