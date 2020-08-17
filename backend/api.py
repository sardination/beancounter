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
)
from schemas import (
    InfoSchema,
    PriorIncomeSchema,
)


api = Api(app)


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
        amount = request.json['amount']
        description = request.json['description']
        date = request.json['date']

        if amount <= 0:
            return abort(400, description='Income amount must be greater than 0')

        new_prior_income = PriorIncome(
            amount=amount,
            description=description,
            date=date
        )
        db.session.add(new_prior_income)
        try:
            db.session.commit()
        except exc.SQLAlchemyError:
            return abort(400, description='Bad model arguments')

        return prior_income_schema.dump(new_prior_income)

    def put(self):
        id = request.json.get('id')
        if id is None:
            return abort(400, description='No id for prior income')
        amount = request.json['amount']
        description = request.json['description']
        date = request.json['date']

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
