from models import (
    Info,
    PriorIncome,
)

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