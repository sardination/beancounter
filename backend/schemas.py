from enums import (
    BalanceSheetEntryType,
    FulfilmentType,
    InvestmentIncomeType,
    TransactionType,
)
from models import (
    AssetAccount,
    BalanceSheetEntry,
    Config,
    ExchangeRate,
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
from utils import convert_zulu_timestamp_to_datestring

from marshmallow import (
    fields,
    post_dump,
    post_load,
    pre_load,
)
from marshmallow_enum import EnumField
from marshmallow_sqlalchemy import (
    SQLAlchemySchema,
    auto_field,
)

from decimal import Decimal


class ConfigSchema(SQLAlchemySchema):
    class Meta:
        model = Config

    title = auto_field()
    value = auto_field()

class InfoSchema(SQLAlchemySchema):
    class Meta:
        model = Info

    title = auto_field()
    value = auto_field()

    @pre_load
    def dtoc_and_ptod(self, data, **kwargs):
        """
        Convert real hourly wage and monthly expense to cents before backend
        Convert interest percentage to decimal before backend
        """
        try:
            if data["title"] in ["real_hourly_wage", "average_monthly_expense"]:
                rwh_cents = int(float(data["value"]) * 100)
                data["value"] = str(rwh_cents)
            elif data["title"] == "long_term_interest_rate":
                lti_dec = float(data["value"]) / 100
                data["value"] = str(lti_dec)
        except:
            data["value"] = ""

        return data

    @pre_load
    def format_date(self, data, **kwargs):
        """
        Convert collected date format into datetime
        """
        if data["title"] == "start_date":
            data["value"] = convert_zulu_timestamp_to_datestring(data["value"])
        return data

    @post_dump
    def ctod_and_dtop(self, data, **kwargs):
        """
        Convert real hourly wage and monthly expense to dollars before frontend
        Convert interest decimal to percentage before backend
        """
        try:
            if data["title"] in ["real_hourly_wage", "average_monthly_expense"]:
                rwh_dollars = float(data["value"]) / 100
                data["value"] = str(rwh_dollars)
            elif data["title"] == "long_term_interest_rate":
                lti_pct = float(data["value"]) * 100
                data["value"] = str(lti_pct)
        except:
            data["value"] = ""

        return data


class PriorIncomeSchema(SQLAlchemySchema):
    class Meta:
        model = PriorIncome

    id = auto_field()
    amount = fields.Float()
    description = auto_field()
    date = auto_field()

    @post_load
    def amount_to_cents(self, data, **kwargs):
        """
        Convert de-serialized amount to cents before backend
        """
        data["amount"] = data["amount"] * 100
        return data

    @pre_load
    def format_date(self, data, **kwargs):
        """
        Convert collected date format into datetime
        """
        data["date"] = convert_zulu_timestamp_to_datestring(data["date"])
        return data

    @post_dump
    def amount_to_dollars(self, data, **kwargs):
        """
        Convert serialized amount to dollars before frontend
        """
        data["amount"] = float(data["amount"]) / 100
        return data


class BalanceSheetEntrySchema(SQLAlchemySchema):
    class Meta:
        model = BalanceSheetEntry

    id = auto_field()
    entry_type = EnumField(BalanceSheetEntryType)
    value = fields.Float()
    description = auto_field()

    @post_load
    def value_to_cents(self, data, **kwargs):
        """
        Convert de-serialized amount to cents before backend
        """
        data["value"] = data["value"] * 100
        return data

    @post_dump
    def value_to_dollars(self, data, **kwargs):
        """
        Convert serialized amount to dollars before frontend
        """
        data["value"] = float(data["value"]) / 100
        return data


class WeeklyJobTransactionSchema(SQLAlchemySchema):
    class Meta:
        model = WeeklyJobTransaction

    id = auto_field()
    transaction_type = EnumField(TransactionType)
    hours = auto_field()
    value = fields.Float()
    description = auto_field()

    @post_load
    def value_to_cents(self, data, **kwargs):
        """
        Convert de-serialized amount to cents before backend
        """
        data["value"] = data["value"] * 100
        return data

    @post_dump
    def value_to_dollars(self, data, **kwargs):
        """
        Convert serialized amount to dollars before frontend
        """
        data["value"] = float(data["value"]) / 100
        return data


class TransactionSchema(SQLAlchemySchema):
    class Meta:
        model = Transaction

    id = auto_field()
    transaction_type = EnumField(TransactionType)
    date = auto_field()
    value = fields.Float()
    description = auto_field()
    category_id = auto_field()
    currency = auto_field()

    @post_load
    def value_to_cents(self, data, **kwargs):
        """
        Convert de-serialized amount to cents before backend
        """
        data["value"] = data["value"] * 100
        return data

    @pre_load
    def format_date(self, data, **kwargs):
        """
        Convert collected date format into datetime
        """
        data["date"] = convert_zulu_timestamp_to_datestring(data["date"])
        return data

    @post_dump
    def value_to_dollars(self, data, **kwargs):
        """
        Convert serialized amount to dollars before frontend
        """
        data["value"] = float(data["value"]) / 100
        return data


class TransactionCategorySchema(SQLAlchemySchema):
    class Meta:
        model = TransactionCategory

    id = auto_field()
    name = auto_field()


class AssetAccountSchema(SQLAlchemySchema):
    class Meta:
        model = AssetAccount

    id = auto_field()
    name = auto_field()
    description = auto_field()
    open_date = auto_field()
    close_date = auto_field()
    currency = auto_field()

    @pre_load
    def format_date(self, data, **kwargs):
        """
        Convert collected date format into datetime
        """
        if data.get("open_date") is not None:
            data["open_date"] = convert_zulu_timestamp_to_datestring(data["open_date"])
        else:
            data["open_date"] = None

        if data.get("close_date") is not None:
            data["close_date"] = convert_zulu_timestamp_to_datestring(data["close_date"])
        else:
            data["close_date"] = None

        return data


class MonthInfoSchema(SQLAlchemySchema):
    class Meta:
        model = MonthInfo

    id = auto_field()
    month = auto_field()
    year = auto_field()
    income = fields.Float()
    expenditure = fields.Float()
    investment_income = fields.Float()
    assets = fields.Float()
    liabilities = fields.Float()
    real_hourly_wage = fields.Float()
    completed = auto_field()

    @post_load
    def values_to_cents(self, data, **kwargs):
        """
        Convert de-serialized amount to cents before backend
        """
        data["income"] = data.get("income", 0) * 100
        data["expenditure"] = data.get("expenditure", 0) * 100
        data["investment_income"] = data.get("investment_income", 0) * 100
        data["real_hourly_wage"] = data.get("real_hourly_wage", 0) * 100
        data["assets"] = data.get("assets", 0) * 100
        data["liabilities"] = data.get("liabilities", 0) * 100

        # frontend has months zero-indexed
        data["month"] += 1

        return data

    @post_dump
    def values_to_dollars(self, data, **kwargs):
        """
        Convert serialized amount to dollars before frontend
        """
        data["income"] = float(data["income"]) / 100
        data["expenditure"] = float(data["expenditure"]) / 100
        data["investment_income"] = float(data["investment_income"]) / 100
        data["real_hourly_wage"] = float(data["real_hourly_wage"]) / 100
        data["assets"] = float(data["assets"]) / 100
        data["liabilities"] = float(data["liabilities"]) / 100

        # frontend has months zero-indexed
        data["month"] -= 1

        return data

class ExchangeRateSchema(SQLAlchemySchema):
    class Meta:
        model = ExchangeRate

    id = auto_field()
    month_info_id = auto_field()
    currency = auto_field()
    rate = auto_field()

class MonthCategorySchema(SQLAlchemySchema):
    class Meta:
        model = MonthCategory

    id = auto_field()
    month_info_id = auto_field()
    category_id = auto_field()
    fulfilment = EnumField(FulfilmentType)


class InvestmentIncomeSchema(SQLAlchemySchema):
    class Meta:
        model = InvestmentIncome

    id = auto_field()
    month_info_id = auto_field()
    investment_income_type = EnumField(InvestmentIncomeType)
    value = fields.Float()
    description = auto_field()
    date = auto_field()
    currency = auto_field()

    @post_load
    def value_to_cents(self, data, **kwargs):
        """
        Convert de-serialized amount to cents before backend
        """
        data["value"] = data["value"] * 100
        return data

    @pre_load
    def format_date(self, data, **kwargs):
        """
        Convert collected date format into datetime
        """
        if data.get("date") is not None:
            data["date"] = convert_zulu_timestamp_to_datestring(data["date"])
        else:
            data["date"] = None
        return data

    @post_dump
    def value_to_dollars(self, data, **kwargs):
        """
        Convert serialized amount to dollars before frontend
        """
        data["value"] = float(data["value"]) / 100
        return data


class MonthAssetAccountEntrySchema(SQLAlchemySchema):
    class Meta:
        model = MonthAssetAccountEntry

    id = auto_field()
    month_info_id = auto_field()
    asset_account_id = auto_field()
    asset_value = fields.Float()
    liability_value = fields.Float()

    @post_load
    def value_to_cents(self, data, **kwargs):
        """
        Convert de-serialized asset/liability value to cents
        before backend
        """
        data["asset_value"] = data["asset_value"] * 100
        data["liability_value"] = data["liability_value"] * 100
        return data

    @post_dump
    def value_to_dollars(self, data, **kwargs):
        """
        Convert serialized asset/liability amount to dollars
        before frontend
        """
        data["asset_value"] = float(data["asset_value"]) / 100
        data["liability_value"] = float(data["liability_value"]) / 100
        return data


class MonthReflectionSchema(SQLAlchemySchema):
    class Meta:
        model = MonthReflection

    id = auto_field()
    month_info_id = auto_field()
    q_living_dying = auto_field()
    q_employment_purpose = auto_field()
    q_spending_evaluation = auto_field()

