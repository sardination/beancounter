from flask import request
from flask_restful import (
    abort,
    Resource,
    Api,
)
from sqlalchemy import (
    desc,
    exc,
    or_,
)

import datetime

from db import db
from enums import TransactionType
from models import (
    AssetAccount,
    BalanceSheetEntry,
    Info,
    InvestmentIncome,
    MonthAssetAccountEntry,
    MonthCategory,
    MonthInfo,
    MonthReflection,
    PriorIncome,
    Transaction,
    TransactionCategory,
    WeeklyJobTransaction,
)
from schemas import (
    AssetAccountSchema,
    BalanceSheetEntrySchema,
    InfoSchema,
    InvestmentIncomeSchema,
    MonthAssetAccountEntrySchema,
    MonthCategorySchema,
    MonthInfoSchema,
    MonthReflectionSchema,
    PriorIncomeSchema,
    TransactionSchema,
    TransactionCategorySchema,
    WeeklyJobTransactionSchema,
)
from utils import (
    get_start_date,
    get_month_info,
    month_year_between_dates,
)


api = Api()


def try_commit(row, schema):
    try:
        db.session.commit()
    except exc.SQLAlchemyError:
        return abort(400, description='Bad model arguments')

    return schema.dump(row)


info_schema = InfoSchema()
@api.resource("/info/<title>")
class InfoResource(Resource):
    def get(self, title):
        info = Info.query.filter_by(title=title).first()
        if info is None:
            if title in Info.permitted_titles:
                info = Info(title=title, value=Info.default_values.get(title))
            else:
                return abort(404, description='Not a permitted value title')
        return info_schema.dump(info)

    def post(self, title):
        request_dict = info_schema.load(request.json)
        value = request_dict['value']

        if title not in Info.permitted_titles:
            return abort(404, description="Not a permitted value title")
        info = Info.query.filter_by(title=title).one_or_none()
        if info is None:
            info = Info(title=title, value=value)
            db.session.add(info)
        else:
            info.value = value

        # for real hourly wage, update any uncompleted monthly info items to use this wage value
        if title == "real_hourly_wage":
            value_num = int(value)
            uncompleted_month_infos = MonthInfo.query.filter_by(completed=False).all()
            for month_info in uncompleted_month_infos:
                month_info.real_hourly_wage = value_num

        db.session.commit()

        return info_schema.dump(info)


prior_incomes_schema = PriorIncomeSchema(many=True)
prior_income_schema = PriorIncomeSchema()
@api.resource("/prior-income")
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

        if date > get_start_date():
            return abort(400, description='Prior income must be received before start date')

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

        if date > get_start_date():
            return abort(400, description='Prior income must be received before start date')

        prior_income = PriorIncome.query.filter_by(id=id).first_or_404()
        prior_income.amount = amount
        prior_income.description = description
        prior_income.date = date

        return try_commit(prior_income, prior_income_schema)

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
@api.resource("/balance-sheet")
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
@api.resource("/weekly-job-transaction")
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
@api.resource("/transaction")
class TransactionResource(Resource):
    def get(self):
        transactions = Transaction.query.all()
        return transactions_schema.dump(transactions)

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

        return try_commit(transaction, transaction_schema)

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
@api.resource("/transaction-category")
class TransactionCategoryResource(Resource):
    def get(self):
        categories = TransactionCategory.query.all()
        return transaction_categories_schema.dump(categories)

    def post(self):
        request_dict = transaction_category_schema.load(request.json)

        name = request_dict['name']

        if len(name) == 0:
            return abort(400, description='Supplied empty name for new category.')

        new_category = TransactionCategory(name=name)
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
        month = int(month) + 1 # frontend is 0-indexed
        filter_kwargs['month'] = month
    except (TypeError, ValueError):
        pass

    return filter_kwargs


asset_accounts_schema = AssetAccountSchema(many=True)
asset_account_schema = AssetAccountSchema()
@api.resource("/asset-account")
class AssetAccountResource(Resource):
    def get(self):
        request_dict = request.args
        month_info_id = request_dict.get('month_info_id')
        month_info = None
        try:
            month_info_id = int(month_info_id)
            month_info = MonthInfo.query.filter_by(id=month_info_id).first()
        except (TypeError, ValueError):
            pass

        asset_accounts = AssetAccount.query
        if month_info is not None:
            # filter:
            #   (account has not closed OR
            #   account has closed this month or later) AND
            #   account opened in this month or earlier

            if month_info.month == 12:
                latest_open_date = datetime.date(month_info.year + 1, 1, 1)
            else:
                latest_open_date = datetime.date(month_info.year, month_info.month + 1, 1)

            asset_accounts.filter(
                or_(
                    AssetAccount.close_date == None,
                    AssetAccount.close_date >= datetime.date(month_info.year, month_info.month, 1)
                )
            ).filter(
                AssetAccount.open_date < latest_open_date
            )

        asset_accounts = asset_accounts.all()

        return asset_accounts_schema.dump(asset_accounts)

    def post(self):
        request_dict = asset_account_schema.load(request.json)

        name = request_dict['name']
        description = request_dict['description']
        open_date = request_dict['open_date']
        close_date = request_dict['close_date']

        if len(name) == 0:
            return abort(400, description='Supplied empty name for new asset account.')

        new_asset_account = AssetAccount(
            name=name,
            description=description,
            open_date=open_date,
            close_date=close_date
        )
        db.session.add(new_asset_account)

        return try_commit(new_asset_account, asset_account_schema)

    def put(self):
        request_dict = asset_account_schema.load(request.json)

        id = request_dict.get('id')
        if id is None:
            return abort(400, description='No id for asset account')

        name = request_dict['name']
        description = request_dict['description']
        open_date = request_dict['open_date']
        close_date = request_dict['close_date']

        asset_account = AssetAccount.query.filter_by(id=id).first_or_404()
        asset_account.name = name
        asset_account.description = description
        asset_account.open_date = open_date
        asset_account.close_date = close_date

        return try_commit(asset_account, asset_account_schema)


month_infos_schema = MonthInfoSchema(many=True)
month_info_schema = MonthInfoSchema()
@api.resource("/month-info")
class MonthInfoResource(Resource):
    def get(self):
        request_dict = request.args
        filter_kwargs = year_month_dict_from_request(request_dict)
        latest = request_dict.get('latest')

        try:
            latest = (latest.lower() == "true")
        except AttributeError:
            latest = False

        month_infos = []
        if latest:
            month_infos = MonthInfo.query.filter_by(completed=True).order_by(
                desc(MonthInfo.year),
                desc(MonthInfo.month)
            ).limit(1).all()
        else:
            month_infos = MonthInfo.query.filter_by(**filter_kwargs).all()

        return month_infos_schema.dump(month_infos)

    def post(self):
        request_dict = month_info_schema.load(request.json)

        year = request_dict['year']
        month = request_dict['month']
        income = request_dict['income']
        expenditure = request_dict['expenditure']
        investment_income = request_dict['investment_income']
        assets = request_dict['assets']
        liabilities = request_dict['liabilities']
        # real_hourly_wage = request_dict['real_hourly_wage']

        # set the real hourly wage for the new month_info as the current real hourly wage
        #   whenever the real hourly wage is change through /info, all the incomplete months
        #   are set with the new hourly wage, so the only place the real hourly wage needs
        #   to be set for MonthInfos outside of InfoResource is here.
        real_hourly_wage = 0
        real_hourly_wage_info = Info.query.filter_by(title="real_hourly_wage").first()
        if real_hourly_wage_info is not None:
            real_hourly_wage = real_hourly_wage_info.value

        start_date = get_start_date()
        today = datetime.date.today()
        if not month_year_between_dates(start_date, today, month, year):
            return abort(400, description="Invalid month and year for new month-info")

        new_month_info = MonthInfo(
            year=year,
            month=month,
            income=income,
            expenditure=expenditure,
            investment_income=investment_income,
            assets=assets,
            liabilities=liabilities,
            real_hourly_wage=real_hourly_wage
        )
        db.session.add(new_month_info)

        return try_commit(new_month_info, month_info_schema)

    def put(self):
        request_dict = month_info_schema.load(request.json)

        id = request_dict.get('id')
        if id is None:
            return abort(400, description='No id for month info')

        year = request_dict['year']
        month = request_dict['month']
        income = request_dict['income']
        expenditure = request_dict['expenditure']
        investment_income = request_dict['investment_income']
        assets = request_dict['assets']
        liabilities = request_dict['liabilities']
        # real_hourly_wage = request_dict['real_hourly_wage']
        completed = request_dict['completed']

        month_info = MonthInfo.query.filter_by(id=id).first_or_404()
        month_info.income = income
        month_info.expenditure = expenditure
        month_info.investment_income = investment_income
        month_info.real_hourly_wage = real_hourly_wage
        month_info.assets = assets
        month_info.liabilities = liabilities
        month_info.completed = completed

        return try_commit(month_info, month_info_schema)


month_categories_schema = MonthCategorySchema(many=True)
month_category_schema = MonthCategorySchema()
@api.resource("/month-category")
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

        # month_info = MonthInfo.query.filter_by(id=month_info_id).first()
        # if month_info is not None and month_info.completed:
        #     abort(400, description="month-category month-info is not taking new entries")

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

        # month_info = MonthInfo.query.filter_by(id=month_info_id).first()
        # if month_info is not None and month_info.completed:
        #     abort(400, description="month-category month-info is not updating entries")

        month_category = MonthCategory.query.filter_by(id=id).first_or_404()
        month_category.category_id = category_id
        month_category.month_info_id = month_info_id
        month_category.fulfilment = fulfilment

        return try_commit(month_category, month_category_schema)


investment_incomes_schema = InvestmentIncomeSchema(many=True)
investment_income_schema = InvestmentIncomeSchema()
@api.resource("/investment-income")
class InvestmentIncomeResource(Resource):
    def get(self):
        filter_kwargs = {}
        request_dict = request.args
        month_info_id = request_dict.get('month_info_id')
        try:
            month_info_id = int(month_info_id)
            filter_kwargs['month_info_id'] = month_info_id
        except (TypeError, ValueError):
            pass

        investment_incomes = InvestmentIncome.query.filter_by(**filter_kwargs).all()
        return investment_incomes_schema.dump(investment_incomes)

    def post(self):
        request_dict = investment_income_schema.load(request.json)

        investment_income_type = request_dict['investment_income_type']
        value = request_dict['value']
        description = request_dict['description']
        date = request_dict['date']

        if date is not None and (date > datetime.date.today() or date < get_start_date()):
            return abort(400, description='Cannot save future investment income or investment income prior to start date')

        month_info_id = request_dict['month_info_id']

        month_info = MonthInfo.query.filter_by(id=month_info_id).first()
        if month_info is None:
            return abort(400, description='Month info with this id does not exist')

        if date is not None and (date.month != month_info.month or date.year != month_info.year):
            return abort(400, description='Month info month and year does not match with date')

        new_investment_income = InvestmentIncome(
            month_info_id=month_info_id,
            investment_income_type=investment_income_type,
            value=value,
            description=description
        )
        if date is not None:
            new_investment_income.date = date
        db.session.add(new_investment_income)

        month_info.investment_income += value

        return try_commit(new_investment_income, investment_income_schema)

    def put(self):
        request_dict = investment_income_schema.load(request.json)

        id = request_dict.get('id')
        if id is None:
            return abort(400, description='No id for investment income')
        value = request_dict['value']
        description = request_dict['description']
        date = request_dict['date']
        investment_income_type = request_dict['investment_income_type']

        month_info_id = request_dict.get('month_info_id') # don't update month
        month_info = MonthInfo.query.filter_by(id=month_info_id)

        if date is not None:
            if date > datetime.date.today() or date < get_start_date():
                return abort(400, description='Cannot save future investment income or investment income prior to start date')
            if date.month != month_info.month or date.year != month_info.year:
                return abort(400, description='Month info month and year does not match with date')

        investment_income = InvestmentIncome.query.filter_by(id=id).first_or_404()

        # remove old value from month-info for old income
        old_month_info = MonthInfo.query.filter_by(id=investment_income.month_info_id)
        old_month_info.investment_income -= investment_income.value

        investment_income.investment_income_type = investment_income_type
        investment_income.value = value
        investment_income.description = description
        investment_income.date = date

        # add value back to appropriate month-info
        month_info.investment_income += investment_income.value

        return try_commit(investment_income, investment_income_schema)

    def delete(self):
        id = request.args.get('id')
        if id is None:
            return abort(400, description='No id to delete')
        investment_income = InvestmentIncome.query.filter_by(id=id).first_or_404()

        month_info = MonthInfo.query.filter_by(id=investment_income.month_info_id)

        db.session.delete(investment_income)

        month_info.investment_income -= investment_income.value

        db.session.commit()

        return investment_income_schema.dump(investment_income)


month_asset_account_entries_schema = MonthAssetAccountEntrySchema(many=True)
month_asset_account_entry_schema = MonthAssetAccountEntrySchema()
@api.resource("/month-asset-account-entry")
class MonthAssetAccountEntryResource(Resource):
    def get(self):
        filter_kwargs = {}
        request_dict = request.args
        month_info_id = request_dict.get('month_info_id')

        # try:
        #     if (month_info_id == 'latest'):
        #         # get the latest completed MonthInfo
        #         month_info_id = MonthInfo.query.filter_by(completed=True).join(MonthAssetAccountEntry).order_by(
        #             desc(MonthInfo.year),
        #             desc(MonthInfo.month)
        #         ).limit(1).all()[0].id
        #     else:
        #         month_info_id = int(month_info_id)
        #     filter_kwargs['month_info_id'] = month_info_id
        # except (IndexError, TypeError, ValueError):
        #     pass
        try:
            month_info_id = int(month_info_id)
            filter_kwargs['month_info_id'] = month_info_id
        except (TypeError, ValueError):
            return abort(400, description='Month info id is not valid')

        month_asset_account_entries = MonthAssetAccountEntry.query.filter_by(**filter_kwargs).all()
        return month_asset_account_entries_schema.dump(month_asset_account_entries)

    def post(self):
        request_dict = month_asset_account_entry_schema.load(request.json)

        month_info_id = request_dict['month_info_id']
        asset_account_id = request_dict['asset_account_id']
        asset_value = request_dict['asset_value']
        liability_value = request_dict['liability_value']

        month_info = MonthInfo.query.filter_by(id=month_info_id).first()
        if month_info is None:
            return abort(400, description='Month info with this id does not exist')

        asset_account = AssetAccount.query.filter_by(id=asset_account_id).first()
        if asset_account is None:
            return abort(400, description='Asset account with this id does not exist')

        new_month_asset_account_entry = MonthAssetAccountEntry(
            month_info_id=month_info_id,
            asset_account_id=asset_account_id,
            asset_value=asset_value,
            liability_value=liability_value,
        )
        db.session.add(new_month_asset_account_entry)

        month_info.assets += asset_value
        month_info.liabilities += liability_value

        return try_commit(new_month_asset_account_entry, month_asset_account_entry_schema)

    def put(self):
        request_dict = month_asset_account_entry_schema.load(request.json)

        id = request_dict.get('id')
        if id is None:
            return abort(400, description='No id for month asset account entry')
        month_info_id = request_dict['month_info_id']
        asset_account_id = request_dict['asset_account_id']
        asset_value = request_dict['asset_value']
        liability_value = request_dict['liability_value']

        month_asset_account_entry = MonthAssetAccountEntry.query.filter_by(id=id).first_or_404()

        if month_asset_account_entry.month_info_id != month_info_id:
            return abort(400, description='Cannot change month info for asset account entry')

        asset_account = AssetAccount.query.filter_by(id=asset_account_id).first()
        if asset_account is None:
            return abort(400, description='Asset account with this id does not exist')

        # remove old value from month-info for old income
        month_info = MonthInfo.query.filter_by(id=month_info_id).first()
        if month_info is None:
            return abort(400, description='Month info with this id does not exist')
        month_info.assets -= month_asset_account_entry.asset_value
        month_info.liabilities -= month_asset_account_entry.liability_value

        month_asset_account_entry.asset_account_id = asset_account_id
        month_asset_account_entry.asset_value = asset_value
        month_asset_account_entry.liability_value = liability_value

        # add value back to appropriate month-info
        month_info.assets += month_asset_account_entry.asset_value
        month_info.liabilities += month_asset_account_entry.liability_value

        return try_commit(month_asset_account_entry, month_asset_account_entry_schema)

    def delete(self):
        id = request.args.get('id')
        if id is None:
            return abort(400, description='No id to delete')
        month_asset_account_entry = MonthAssetAccountEntry.query.filter_by(id=id).first_or_404()

        month_info = MonthInfo.query.filter_by(id=month_asset_account_entry.month_info_id)

        db.session.delete(month_asset_account_entry)

        month_info.assets -= month_asset_account_entry.asset_value
        month_info.liabilities += month_asset_account_entry.liability_value

        db.session.commit()

        return month_asset_account_entry_schema.dump(month_asset_account_entry)


month_reflections_schema = MonthReflectionSchema(many=True)
month_reflection_schema = MonthReflectionSchema()
@api.resource("/month-reflection")
class MonthReflectionResource(Resource):
    def get(self):
        filter_kwargs = {}
        request_dict = request.args
        month_info_id = request_dict.get('month_info_id')
        try:
            month_info_id = int(month_info_id)
            filter_kwargs['month_info_id'] = month_info_id
        except (TypeError, ValueError):
            pass

        month_reflections = MonthReflection.query.filter_by(**filter_kwargs).all()
        return month_reflections_schema.dump(month_reflections)

    def post(self):
        request_dict = month_reflection_schema.load(request.json)

        month_info_id = request_dict['month_info_id']
        month_info = MonthInfo.query.filter_by(id=month_info_id).first()
        if month_info is None:
            return abort(400, description="no such month-info exists for reflection")

        # if today's date is prior to the end of this MonthInfo's month, don't save this survey
        today = datetime.date.today()
        earliest_survey_date_year = month_info.year
        earliest_survey_date_month = month_info.month + 1
        if earliest_survey_date_month == 13:
            earliest_survey_date_month = 1
            earliest_survey_date_year += 1
        earliest_survey_date = datetime.date(earliest_survey_date_year, earliest_survey_date_month, 1)
        if today < earliest_survey_date:
            return abort(400, description="survey can only be saved after the month is over")

        q_living_dying = request_dict.get('q_living_dying', "")
        q_employment_purpose = request_dict.get('q_employment_purpose', "")
        q_spending_evaluation = request_dict.get('q_spending_evaluation', "")

        month_reflection = MonthReflection(
            month_info_id=month_info_id,
            q_living_dying=q_living_dying,
            q_employment_purpose=q_employment_purpose,
            q_spending_evaluation=q_spending_evaluation
        )
        db.session.add(month_reflection)

        # if all survey responses have been filled, then set completed to true
        if q_living_dying != "" and q_employment_purpose != "" and q_spending_evaluation != "":
            month_info.completed = True
        else:
            month_info.completed = False

        return try_commit(month_reflection, month_reflection_schema)

    def put(self):
        request_dict = month_reflection_schema.load(request.json)

        id = request_dict.get('id')
        if id is None:
            return abort(400, "cannot update nonexistent month-reflection")
        month_reflection = MonthReflection.query.filter_by(id=id).first()
        if month_reflection is None:
            return abort(400, "month-reflection with this id does not exist")

        month_info_id = request_dict['month_info_id']
        month_info = MonthInfo.query.filter_by(id=month_info_id).first()
        if month_info is None:
            return abort(400, description="no such month-info exists for reflection")

        q_living_dying = request_dict.get('q_living_dying', "")
        q_employment_purpose = request_dict.get('q_employment_purpose', "")
        q_spending_evaluation = request_dict.get('q_spending_evaluation', "")

        month_reflection.q_living_dying = q_living_dying
        month_reflection.q_employment_purpose = q_employment_purpose
        month_reflection.q_spending_evaluation = q_spending_evaluation

        # if all survey responses have been filled, then set completed to true
        if q_living_dying != "" and q_employment_purpose != "" and q_spending_evaluation != "":
            month_info.completed = True
        else:
            month_info.completed = False

        return try_commit(month_reflection, month_reflection_schema)
