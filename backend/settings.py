from secrets import SECRET_KEY

class Config():
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    def __init__(self):
        self.SECRET_KEY = SECRET_KEY

class DevConfig(Config):
    SQLALCHEMY_DATABASE_URI = "postgres://dev:eloper@127.0.0.1/finance"
    DEBUG = True

class ProdConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///finance.db"
    DEBUG = False