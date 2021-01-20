from flask import Flask
from flask_cors import CORS
from flask_restful import Api

from api import api
from db import db


# class CustomFlask(Flask):
#     request_class = xxx
#     respone_class = xxx
#     # def __init__(*args, **kwargs):
#     #     super().__init__(*args, **kwargs)

#     def run_serverless():


def create_app():
    """
    Create the Flask application
    """

    app = Flask(__name__)
    CORS(app, origins="http://localhost:4200")

    # app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_NAME
    # app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config.from_pyfile('settings.py', silent=True)
    app.config['DEBUG'] = True

    db.init_app(app)
    api.init_app(app)

    return app


def create_webview_app():
    """
    Create application for packaged pywebview
    """
    return