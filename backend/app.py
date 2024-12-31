from alembic.migration import MigrationContext
from alembic.script import ScriptDirectory
from flask import Flask
from flask.wrappers import Request
from flask_cors import CORS
from flask_migrate import Migrate, upgrade
from flask_restful import Api

import simplejson as json

import datetime

from api import api
from db import db
from models import Info
import settings
from utils import backup_database, maybe_backup_database


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

    if dev_mode:
        config = settings.DevConfig()
    else:
        config = settings.ProdConfig()

    app.config.from_object(config)

    db.init_app(app)
    api.init_app(app)

    if migrations is not None:
        # This will upgrade the database if the current schema
        #   does not match the latest alembic version
        with app.app_context():
            # Get the current alembic revision
            db_conn = db.engine.connect()
            migrate_context = MigrationContext.configure(db_conn)
            current_revision = migrate_context.get_current_revision()
            db_conn.close()
            db.engine.dispose()

            migrate = Migrate(app, db)
            alembic_config = app.extensions['migrate'].migrate.get_config(migrations)
            script = ScriptDirectory.from_config(alembic_config)
            head_revision = script.get_current_head()

            # If the current revision is different from the head revision, we should:
            #     1. back up db
            #     2. upgrade db
            if current_revision != head_revision and config.db_file_path and config.db_name:
                backup_database(config)
                upgrade(directory=migrations)
            else:
                # If we didn't update, check if it has been a week since the latest backup
                #     and make another backup if so.
                maybe_backup_database(config, datetime.timedelta(days=7))

    with app.app_context():
        set_start_date()

    return app
