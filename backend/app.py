from flask import Flask
from flask.wrappers import Request
from flask_cors import CORS
from flask_restful import Api

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

def create_webview_app():
    """
    Create the Flask application for webview
    """

    app = Flask(__name__)
    CORS(app, origins="http://beancounter/")

    app.config.from_object(settings.ProdConfig())

    db.init_app(app)
    api.init_app(app)

    return app