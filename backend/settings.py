from appdirs import user_data_dir
import os

from appsecrets import SECRET_KEY


VERSION = "1.1.1"

class Config():
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    db_file_path = None
    db_name = None

    def __init__(self):
        self.SECRET_KEY = SECRET_KEY

class DevConfig(Config):
    # SQLALCHEMY_DATABASE_URI = "postgres://dev:eloper@127.0.0.1/finance"
    SQLALCHEMY_DATABASE_URI = "sqlite:///beancounter-dev.db"
    DEBUG = True

    def __init__(self):
        author = "Bean Counter"
        app_name = "Bean Counter Dev"
        self.db_name = "beancounter-dev.db"

        app_data_path = user_data_dir(app_name, author)
        self.db_file_path = create_db_path_if_not_exists(app_data_path, self.db_name)

        self.SQLALCHEMY_DATABASE_URI = "sqlite:///{db_path}".format(db_path=self.db_file_path)


def create_db_path_if_not_exists(folder_path, db_name):
    """
    Check whether the db path exists and creates the path if not
    NOTE: only works for SQLite files, not servers (e.g. Postgres)
    NOTE 2: as long as the path exists, even if the db does not
        exist, Flask will create the missing db file

    Arguments:
        folder_path (str): the path of the database file folder
        db_name (str): the filename of the db (no folder path)

    Return:
        (str): the full path of the database
    """

    # if the directory structure does not exist, then create it
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    full_db_path = os.path.join(folder_path, db_name)

    return full_db_path


# TODO: How to ensure that only the packaged app can use prod?
class ProdConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///beancounter.db"
    DEBUG = False

    def __init__(self):
        author = "Bean Counter"
        app_name = "Bean Counter"
        self.db_name = "beancounter.db"

        app_data_path = user_data_dir(app_name, author)
        self.db_file_path = create_db_path_if_not_exists(app_data_path, self.db_name)

        self.SQLALCHEMY_DATABASE_URI = "sqlite:///{db_path}".format(db_path=self.db_file_path)

