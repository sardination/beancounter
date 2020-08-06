from flask_restful import (
    Resource,
    Api,
)

from .app import app


api = Api(app)

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