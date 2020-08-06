from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from .settings import DATABASE_NAME


app = Flask(__name__)
CORS(app, origins="http://localhost:4200")

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_NAME
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)