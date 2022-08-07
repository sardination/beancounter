from httpx import Client, Response
import getopt
import json
import os
from settings import VERSION
import sys
import tkinter as tk
import webview

from app import create_webview_app

# hidden imports
import sqlalchemy.sql.default_comparator
import pygments.styles.default


# --- FILE CHECKERS ---
def exists(path):
    return os.path.exists(os.path.join(os.path.dirname(__file__), path))


def get_entrypoint(serving=False):
    """
    Return the entrypoint filepath
    """

    # If running frontend via ng serve, allow hot updates for dev
    if serving:
        return 'http://localhost:4200/'

    if exists('../frontend/dist/index.html'): # unfrozen development
        return '../frontend/dist/index.html'

    if exists('../Resources/frontend/dist/index.html'): # frozen py2app
        return '../Resources/frontend/dist/index.html'

    if exists('./frontend/dist/index.html'):
        return './frontend/dist/index.html'

    raise Exception('No index.html found')


def get_migrations_directory():
    """
    Return the alembic migrations filepath
    """

    if exists('migrations'): # unfrozen development
        return 'migrations'

    if exists('../Resources/backend/migrations'): # frozen py2app
        return '../Resources/backend/migrations'

    if exists('./backend/migrations'):
        return './backend/migrations'

    raise Exception('No migrations directory found')

# --- WEBVIEW CONTENT ---

class WebviewApi:
    """
    Api to access python functions from js
    """
    dev_mode = True

    def __init__(self, dev_mode=False):
        self.dev_mode = dev_mode
        self.app = create_webview_app(migrations=get_migrations_directory(), dev_mode=dev_mode)
        self.client = Client(app=self.app)

    def fullscreen(self):
        webview.windows[0].toggle_fullscreen()

    def resize(self, width, height):
        webview.windows[0].resize(width, height)

    def get_version(self):
        return VERSION

    def request(self, method, path, options):
        """
        Pass a request through to the Flask server

        Arguments:
            method (str): GET, POST, PUT, or DELETE
            path (str): the path (including host) to which the request is going
            options (dict): any options included in the request
        """

        kwargs = {}
        headers = options.get('headers')
        params = options.get('params')
        body = options.get('body')
        if headers is not None:
            kwargs['headers'] = headers
        if params is not None:
            kwargs['params'] = params
        if body is not None:
            kwargs['json'] = body

        # Since hostname is irrelevant for our requests in webview, we use it to differentiate between
        #     dev and prod. Prod uses "beancounter" and dev uses "beancounter-dev".
        hostname = path.split("//")[1].split("/")[0]
        if (not self.dev_mode and hostname == "beancounter") or \
            (self.dev_mode and hostname == "beancounter-dev"):
            resp = self.client.request(method, path, **kwargs)
            return json.loads(resp.content.decode("utf-8"))

        # If dev mode and hostname don't match, then return 403
        return Response(status_code=403)


# --- IMPLEMENTATION ---

if __name__ == '__main__':
    is_dev = True # default to dev
    serving = False # default to bundled mode

    # don't allow running as prod from the terminal (prevent accidents this way)
    in_terminal = sys.stdin and sys.stdin.isatty()

    try:
        opts, args = getopt.getopt(sys.argv[1:], "ps")
    except getopt.GetoptError:
        # if bad arguments, then just run in dev mode
        pass

    for opt, arg in opts:
        if opt == '-p' and not in_terminal:
            is_dev = False
        elif opt == '-s':
            serving = True

    # ng serve mode should only be allowed in dev mode
    if serving and not is_dev:
        serving = False

    entry = get_entrypoint(serving=serving)

    window = webview.create_window(
        'Bean Counter',
        entry,
        js_api=WebviewApi(dev_mode=is_dev),
        x=0,
        y=0
    )
    webview.start(debug=is_dev)
