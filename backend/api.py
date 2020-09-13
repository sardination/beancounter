from flask import request
from flask_restful import (
    abort,
    Resource,
    Api,
)
from sqlalchemy import exc

import datetime

from app import (
    app,
    db,
)
from enums import TransactionType
from models import (
    BalanceSheetEntry,
    MonthCategory,
    Info,
    MonthInfo,
    PriorIncome,
    Transaction,
    TransactionCategory,
    WeeklyJobTransaction,
)
from schemas import (
    BalanceSheetEntrySchema,
    MonthCategorySchema,
    InfoSchema,
    MonthInfoSchema,
    PriorIncomeSchema,
    TransactionSchema,
    TransactionCategorySchema,
    WeeklyJobTransactionSchema,
)
from utils import (
    get_start_date,
    get_month_info,
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


transactions_schema = TransactionSchema(many=True)
transaction_schema = TransactionSchema()
class TransactionResource(Resource):
    def get(self):
        transactions = Transaction.query.all()
        return transactions_schema.dump(transactions)

    def put(self):
        request_dict = transaction_schema.load(request.json)

        id = request_dict.get('id')
        if id is None:
            return abort(400, description='No id for transaction')
        value = request_dict['value']
        description = request_dict['description']
        date = request_dict['date']
        transaction_type = request_dict['transaction_type']

        category_id = request_dict.get('category_id')

        if value <= 0:
            return abort(400, description='Transaction value must be greater than 0')
        if date > datetime.date.today() or date < get_start_date():
            return abort(400, description='Cannot save future transaction or transaction prior to start date')

        transaction = Transaction.query.filter_by(id=id).first_or_404()
        old_date = transaction.date
        old_type = transaction.transaction_type
        old_value = transaction.value

        # remove old value from month-info for old transaction
        old_month_info = get_month_info(transaction.date.year, transaction.date.month)
        if transaction.transaction_type == TransactionType.income:
            old_month_info.income -= transaction.value
        else:
            old_month_info.expenditure -= transaction.value

        transaction.transaction_type = transaction_type
        transaction.value = value
        transaction.description = description
        transaction.date = date
        if category_id is not None:
            transaction.category_id = category_id

        update_month_info = old_month_info
        # if month and/or year have changed, then update the corresponding monthinfo
        if old_date.month != date.month or old_date.year != date.year:
            new_month_info = get_month_info(date.year, date.month)
            update_month_info = new_month_info

        # add value back to appropriate month-info
        if transaction_type == TransactionType.income:
            update_month_info.income += value
        else:
            update_month_info.expenditure += value

        try:
            db.session.commit()
        except exc.SQLAlchemyError:
            return abort(400, description='Bad model arguments')

        return transaction_schema.dump(transaction)

    def post(self):
        request_dict = transaction_schema.load(request.json)

        transaction_type = request_dict['transaction_type']
        value = request_dict['value']
        description = request_dict['description']
        date = request_dict['date']

        if value <= 0:
            return abort(400, description='Value must be greater than 0.')
        if date > datetime.date.today() or date < get_start_date():
            return abort(400, description='Cannot save future transaction or transaction prior to start date')

        month_info = get_month_info(date.year, date.month)

        new_transaction = Transaction(
            transaction_type=transaction_type,
            value=value,
            description=description,
            date=date
        )
        db.session.add(new_transaction)

        if transaction_type == TransactionType.income:
            month_info.income += value
        else:
            month_info.expenditure += value

        return try_commit(new_transaction, transaction_schema)

    def delete(self):
        id = request.args.get('id')
        if id is None:
            return abort(400, description='No id to delete')
        transaction = Transaction.query.filter_by(id=id).first_or_404()

        month_info = get_month_info(transaction.date.year, transaction.date.month)

        db.session.delete(transaction)

        if transaction.transaction_type == TransactionType.income:
            month_info.income -= transaction.value
        else:
            month_info.expenditure -= transaction.value

        db.session.commit()

        return transaction_schema.dump(transaction)


transaction_categories_schema = TransactionCategorySchema(many=True)
transaction_category_schema = TransactionCategorySchema()
class TransactionCategoryResource(Resource):
    def get(self):
        categories = TransactionCategory.query.all()
        return transaction_categories_schema.dump(categories)

    def post(self):
        request_dict = transaction_category_schema.load(request.json)

        name = request_dict['name']

        if len(name) == 0:
            return abort(400, description='Supplied empty name for new category.')

        new_category = TransactionCategory(name = name)
        db.session.add(new_category)

        return try_commit(new_category, transaction_category_schema)


def year_month_dict_from_request(request_dict):
    if request_dict is None:
        request_dict = {}
    year = request_dict.get('year')
    month = request_dict.get('month')

    filter_kwargs = {}
    try:
        year = int(year)
        filter_kwargs['year'] = year
        month = int(month)
        filter_kwargs['month'] = month
    except (TypeError, ValueError):
        pass

    return filter_kwargs


month_infos_schema = MonthInfoSchema(many=True)
month_info_schema = MonthInfoSchema()
class MonthInfoResource(Resource):
    def get(self):
        filter_kwargs = year_month_dict_from_request(request.args)

        month_infos = MonthInfo.query.filter_by(**filter_kwargs).all()
        return month_infos_schema.dump(month_infos)

    def post(self):
        request_dict = month_info_schema.load(request.json)

        year = request_dict['year']
        month = request_dict['month']
        income = request_dict['income']
        expenditure = request_dict['expenditure']

        new_month_info = MonthInfo(
            year=year,
            month=month,
            income=income,
            expenditure=expenditure
        )
        db.session.add(new_month_info)

        return try_commit(new_month_info, month_info_schema)


month_categories_schema = MonthCategorySchema(many=True)
month_category_schema = MonthCategorySchema()
class MonthCategoryResource(Resource):
    def get(self):
        filter_kwargs = {}
        request_dict = request.args
        month_info_id = request_dict.get('month_info_id')
        try:
            month_info_id = int(month_info_id)
            filter_kwargs['month_info_id'] = month_info_id
        except (TypeError, ValueError):
            pass

        category_id = request_dict.get('category_id')
        try:
            category_id = int(category_id)
            filter_kwargs['category_id'] = category_id
        except (TypeError, ValueError):
            pass

        month_categories = MonthCategory.query.filter_by(**filter_kwargs).all()
        return month_categories_schema.dump(month_categories)

    def post(self):
        request_dict = month_category_schema.load(request.json)

        category_id = request_dict['category_id']
        month_info_id = request_dict['month_info_id']
        fulfilment = request_dict['fulfilment']

        new_month_category = MonthCategory(
            category_id=category_id,
            month_info_id=month_info_id,
            fulfilment=fulfilment
        )
        db.session.add(new_month_category)

        return try_commit(new_month_category, month_category_schema)

    def put(self):
        request_dict = month_category_schema.load(request.json)

        id = request_dict.get('id')
        if id is None:
            return abort(400, description='No id for month-category')
        category_id = request_dict['category_id']
        month_info_id = request_dict['month_info_id']
        fulfilment = request_dict['fulfilment']

        month_category = MonthCategory.query.filter_by(id=id).first_or_404()
        month_category.category_id = category_id
        month_category.month_info_id = month_info_id
        month_category.fulfilment = fulfilment

        try:
            db.session.commit()
        except exc.SQLAlchemyError:
            return abort(400, description='Bad model arguments')

        return month_category_schema.dump(month_category)

api.add_resource(InfoResource, "/info/<title>")
api.add_resource(PriorIncomeResource, "/prior-income")
api.add_resource(BalanceSheetEntryResource, "/balance-sheet")
api.add_resource(WeeklyJobTransactionResource, "/weekly-job-transaction")
api.add_resource(TransactionResource, "/transaction")
api.add_resource(TransactionCategoryResource, "/transaction-category")
api.add_resource(MonthInfoResource, "/month-info")
api.add_resource(MonthCategoryResource, "/month-category")
