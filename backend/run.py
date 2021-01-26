from httpx import Client
import json
import os
import tkinter as tk
import webview

from app import create_webview_app

# hidden imports
import sqlalchemy.sql.default_comparator
import pygments.styles.default


# --- FILE CHECKERS ---
def exists(path):
        return os.path.exists(os.path.join(os.path.dirname(__file__), path))


def get_entrypoint():
    """
    Return the entrypoint filepath
    """

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
    path_start = 'http://beancounter/'

    def __init__(self):
        self.app = create_webview_app(migrations=get_migrations_directory())
        self.client = Client(app=self.app, base_url=self.path_start)

    def fullscreen(self):
        webview.windows[0].toggle_fullscreen()

    def resize(self, width, height):
        webview.windows[0].resize(width, height)

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

        resp = self.client.request(method, path, **kwargs)
        return json.loads(resp.content.decode("utf-8"))


# --- IMPLEMENTATION ---

entry = get_entrypoint()

if __name__ == '__main__':
    window = webview.create_window(
        'Bean Counter',
        entry,
        js_api=WebviewApi(),
        x=0,
        y=0
    )
    webview.start(debug=True)
