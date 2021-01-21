from flask import Flask
from flask.wrappers import Request
from flask_cors import CORS
from flask_restful import Api

from api import api
from db import db


def create_app():
    """
    Create the Flask application (for development)
    """

    app = Flask(__name__)
    CORS(app, origins="http://localhost:4200")

    app.config.from_pyfile('settings.py', silent=True)
    app.config['DEBUG'] = False

    db.init_app(app)
    api.init_app(app)

    return app

def create_webview_app():
    """
    Create the Flask application for webview
    """

    app = Flask(__name__)
    CORS(app, origins="http://financeapp/")

    app.config.from_pyfile('settings.py', silent=True)
    app.config['DEBUG'] = False

    db.init_app(app)
    api.init_app(app)

    return app