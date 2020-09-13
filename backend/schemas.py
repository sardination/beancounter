from enums import (
    BalanceSheetEntryType,
    FulfilmentType,
    TransactionType,
)
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


class InfoSchema(SQLAlchemySchema):
    class Meta:
        model = Info

    title = auto_field()
    value = auto_field()

    @pre_load
    def rhw_to_cents(self, data, **kwargs):
        """
        Convert real hourly wage to cents before backend
        """
        if data["title"] == "real_hourly_wage":
            try:
                rwh_cents = int(float(data["value"]) * 100)
                data["value"] = str(rwh_cents)
            except:
                pass
        return data

    @post_dump
    def rhw_to_dollars(self, data, **kwargs):
        """
        Convert real hourly wage to dollars before frontend
        """
        if data["title"] == "real_hourly_wage":
            try:
                rwh_dollars = float(data["value"]) / 100
                data["value"] = str(rwh_dollars)
            except:
                pass
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
        data["date"] = data["date"][:10]
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


class MonthInfoSchema(SQLAlchemySchema):
    class Meta:
        model = MonthInfo

    id = auto_field()
    month = auto_field()
    year = auto_field()
    income = auto_field()
    expenditure = auto_field()
    real_hourly_wage = auto_field()
    completed = auto_field()

    @post_load
    def values_to_cents(self, data, **kwargs):
        """
        Convert de-serialized amount to cents before backend
        """
        data["income"] = data.get("income", 0) * 100
        data["expenditure"] = data.get("expenditure", 0) * 100
        data["real_hourly_wage"] = data.get("real_hourly_wage", 0) * 100

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
        data["real_hourly_wage"] = float(data["real_hourly_wage"]) / 100

        # frontend has months zero-indexed
        data["month"] -= 1

        return data


class MonthCategorySchema(SQLAlchemySchema):
    class Meta:
        model = MonthCategory

    id = auto_field()
    month_info_id = auto_field()
    category_id = auto_field()
    fulfilment = EnumField(FulfilmentType)
