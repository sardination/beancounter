from enums import BalanceSheetEntryEnum
from models import (
    BalanceSheetEntry,
    Info,
    PriorIncome,
)

from marshmallow import (
    post_dump,
    post_load,
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


class PriorIncomeSchema(SQLAlchemySchema):
    class Meta:
        model = PriorIncome

    id = auto_field()
    amount = auto_field()
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
    entry_type = EnumField(BalanceSheetEntryEnum)
    value = auto_field()
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

