from flask import Flask
from flask.wrappers import Request
from flask_cors import CORS
from flask_migrate import Migrate, upgrade
from flask_restful import Api

import os

from api import api
from db import db
import settings


def create_app():
    """
    Create the Flask application (for development)
    """

    app = Flask(__name__)
    CORS(app, origins="http://localhost:4200")

    app.config.from_object(settings.DevConfig())

    db.init_app(app)
    api.init_app(app)

    return app


def create_webview_app(migrations=None):
    """
    Create the Flask application for webview
    """

    app = Flask(__name__)
    CORS(app, origins="http://beancounter/")

    config = settings.ProdConfig()
    app.config.from_object(config)

    db.init_app(app)
    api.init_app(app)

    if migrations is not None:
        # this will upgrade the database if the current schema
        #   does not match the latest alembic version
        with app.app_context():
            migrate = Migrate(app, db)
            upgrade(migrations)

    return app