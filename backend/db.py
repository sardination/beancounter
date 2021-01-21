from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# have functions to create db if it doesn't exist: this means create file and migrate schema