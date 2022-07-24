from flask import Flask
from flask.wrappers import Request
from flask_cors import CORS
from flask_migrate import Migrate, upgrade
from flask_restful import Api

import datetime
import os

from api import api
from db import db
from models import Info
import settings


def set_start_date():
    start_date_info = Info.query.filter_by(title="start_date").first()
    # if start_date_info doesn't exist, set it as today
    if start_date_info is None:
        start_date_info = Info(title="start_date", value=datetime.date.today())
        db.session.add(start_date_info)
        db.session.commit()


def create_app():
    """
    Create the Flask application (for development)
    """

    app = Flask(__name__)
    CORS(app, origins="http://localhost:4200")

    app.config.from_object(settings.DevConfig())

    db.init_app(app)
    api.init_app(app)

    with app.app_context():
        set_start_date()

    return app


def create_webview_app(migrations=None, dev_mode=False):
    """
    Create the Flask application for webview
    """

    app = Flask(__name__)
    CORS(app, origins="http://beancounter/")

    if dev_mode:
        config = settings.DevConfig()
    else:
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

    with app.app_context():
        set_start_date()

    return app
