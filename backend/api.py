from flask import request
from flask_restful import (
    abort,
    Resource,
    Api,
)
from sqlalchemy import exc

from app import (
    app,
    db,
)
from models import (
    BalanceSheetEntry,
    Info,
    PriorIncome,
    WeeklyJobTransaction,
)
from schemas import (
    BalanceSheetEntrySchema,
    InfoSchema,
    PriorIncomeSchema,
    WeeklyJobTransactionSchema,
)


api = Api(app)


def try_commit(row, schema):
    try:
        db.session.commit()
    except exc.SQLAlchemyError:
        return abort(400, description='Bad model arguments')

    return schema.dump(row)


info_schema = InfoSchema()
class InfoResource(Resource):
    def get(self, title):
        info = Info.query.filter_by(title=title).first_or_404()
        return info_schema.dump(info)

    def post(self, title):
        value = request.json['value']

        if title not in Info.permitted_titles:
            return abort(400, description="Not a permitted value title")
        info = Info.query.filter_by(title=title).one_or_none()
        if info is None:
            info = Info(title=title, value=value)
            db.session.add(info)
        else:
            info.value = value
        db.session.commit()

        return info_schema.dump(info)


prior_incomes_schema = PriorIncomeSchema(many=True)
prior_income_schema = PriorIncomeSchema()
class PriorIncomeResource(Resource):
    def get(self):
        prior_incomes = PriorIncome.query.all()
        return prior_incomes_schema.dump(prior_incomes)

    def post(self):
        request_dict = prior_income_schema.load(request.json)

        amount = request_dict['amount']
        description = request_dict['description']
        date = request_dict['date']

        if amount <= 0:
            return abort(400, description='Income amount must be greater than 0')

        new_prior_income = PriorIncome(
            amount=amount,
            description=description,
            date=date
        )
        db.session.add(new_prior_income)

        return try_commit(new_prior_income, prior_income_schema)

    def put(self):
        request_dict = prior_income_schema.load(request.json)

        id = request_dict.get('id')
        if id is None:
            return abort(400, description='No id for prior income')
        amount = request_dict['amount']
        description = request_dict['description']
        date = request_dict['date']

        if amount <= 0:
            return abort(400, description='Income amount must be greater than 0')

        prior_income = PriorIncome.query.filter_by(id=id).first_or_404()
        prior_income.amount = amount
        prior_income.description = description
        prior_income.date = date
        try:
            db.session.commit()
        except exc.SQLAlchemyError:
            return abort(400, description='Bad model arguments')

        return prior_income_schema.dump(prior_income)

    def delete(self):
        id = request.args.get('id')
        if id is None:
            return abort(400, description='No id to delete')
        prior_income = PriorIncome.query.filter_by(id=id).first_or_404()
        db.session.delete(prior_income)
        db.session.commit()

        return prior_income_schema.dump(prior_income)


balance_sheet_entries_schema = BalanceSheetEntrySchema(many=True)
balance_sheet_entry_schema = BalanceSheetEntrySchema()
class BalanceSheetEntryResource(Resource):
    def get(self):
        balance_sheet_entries = BalanceSheetEntry.query.all()
        return balance_sheet_entries_schema.dump(balance_sheet_entries)

    def post(self):
        request_dict = balance_sheet_entry_schema.load(request.json)

        entry_type = request_dict['entry_type']
        value = request_dict['value']
        description = request_dict['description']

        if value <= 0:
            return abort(400, description='Value must be greater than 0.')

        new_entry = BalanceSheetEntry(
            entry_type=entry_type,
            value=value,
            description=description
        )
        db.session.add(new_entry)

        return try_commit(new_entry, balance_sheet_entry_schema)

    def delete(self):
        id = request.args.get('id')
        if id is None:
            return abort(400, description='No id to delete')
        entry = BalanceSheetEntry.query.filter_by(id=id).first_or_404()
        db.session.delete(entry)
        db.session.commit()

        return balance_sheet_entry_schema.dump(entry)


weekly_job_transactions_schema = WeeklyJobTransactionSchema(many=True)
weekly_job_transaction_schema = WeeklyJobTransactionSchema()
class WeeklyJobTransactionResource(Resource):
    def get(self):
        weekly_job_transactions = WeeklyJobTransaction.query.all()
        return weekly_job_transactions_schema.dump(weekly_job_transactions)

    def post(self):
        request_dict = weekly_job_transaction_schema.load(request.json)

        transaction_type = request_dict['transaction_type']
        value = request_dict['value']
        hours = request_dict['hours']
        description = request_dict['description']

        if value <= 0 or hours <= 0:
            return abort(400, description='Value and hours must be greater than 0.')

        new_transaction = WeeklyJobTransaction(
            transaction_type=transaction_type,
            value=value,
            hours=hours,
            description=description
        )
        db.session.add(new_transaction)

        return try_commit(new_transaction, weekly_job_transaction_schema)

    def delete(self):
        id = request.args.get('id')
        if id is None:
            return abort(400, description='No id to delete')
        transaction = WeeklyJobTransaction.query.filter_by(id=id).first_or_404()
        db.session.delete(transaction)
        db.session.commit()

        return weekly_job_transaction_schema.dump(transaction)


class Transactions(Resource):
    def get(self):
        return [
            {
                "id": 1,
                "seller": "suriya",
                "buyer": "kaviya",
                "amount": 5.55,
                "item": "pillow"
            },
            {
                "id": 2,
                "seller": "kaviya",
                "buyer": "zuko",
                "amount": 2.00,
                "item": "dental bone"
            }]


api.add_resource(Transactions, "/transactions")
api.add_resource(InfoResource, "/info/<title>")
api.add_resource(PriorIncomeResource, "/prior-income")
api.add_resource(BalanceSheetEntryResource, "/balance-sheet")
api.add_resource(WeeklyJobTransactionResource, "/weekly-job-transaction")
