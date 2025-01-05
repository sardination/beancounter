from httpx import Client, Response, WSGITransport
import getopt
import json
import os
from settings import VERSION
import sys
import tkinter as tk
from tkinter import ttk
import urllib
import webbrowser
import webview
import webview.menu as wm

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

    entrypoint = None

    # If running frontend via ng serve, allow hot updates for dev
    if serving:
        return 'http://localhost:4200/'

    if exists('../frontend/dist/index.html'): # unfrozen development
        entrypoint = '../frontend/dist/index.html'

    if exists('../Resources/frontend/dist/index.html'): # frozen py2app
        entrypoint = '../Resources/frontend/dist/index.html'

    if exists('./frontend/dist/index.html'):
        entrypoint = './frontend/dist/index.html'

    if entrypoint is None:
        raise Exception('No index.html found')

    return "file://" + os.path.abspath(entrypoint)

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
        self.transport = WSGITransport(app=self.app)

    def fullscreen(self):
        webview.windows[0].toggle_fullscreen()

    def resize(self, width, height):
        webview.windows[0].resize(width, height)

    def get_version(self):
        return VERSION

    def request(self, method, path, options, internal=False):
        """
        Pass a request through to the Flask server

        Arguments:
            method (str): GET, POST, PUT, or DELETE
            path (str): the path (including host) to which the request is going
            options (dict): any options included in the request

        Kwargs:
            internal (bool): whether the request is coming from within the app or
                from an external caller (e.g. frontend JS)
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

        preferred_hostname = "beancounter-dev"
        if not self.dev_mode:
            preferred_hostname = "beancounter"

        # If request is internal, stick on the right hostname
        if internal:
            path = "https://{}/{}".format(preferred_hostname, path)

        # Since hostname is irrelevant for our requests in webview, we use it to differentiate between
        #     dev and prod. Prod uses "beancounter" and dev uses "beancounter-dev".
        hostname = path.split("//")[1].split("/")[0]
        if hostname == preferred_hostname:
            with Client(transport=self.transport) as client:
                resp = client.request(method, path, **kwargs)
                return json.loads(resp.content.decode("utf-8"))

        # If dev mode and hostname don't match, then return 403
        return Response(status_code=403)


# --- IMPLEMENTATION ---

def check_for_updates(startup=False, is_dev=False):
    """
    If `startup` is True, then don't show a dialog if the latest version hasn't changed
    """

    window = webview.active_window()
    js_api = window._js_api

    try:
        latest_version = urllib.request.urlopen("https://beancounter.me/downloads/version.html").read().decode('UTF-8')
    except urllib.error.URLError:
        # If the request for the latest version failed and this is not an automated check,
        #     pop up a update failure dialog.
        if not startup:
            window.create_confirmation_dialog(
                "Update check failed!", "Confirm that you have Internet access and try checking for updates again"
            )
            return

    current_version = VERSION
    update_available = not is_dev and current_version != latest_version

    if update_available:
        # If there is an update available but the latest skipped version is the same as the latest version,
        #     and this update check is being done on startup, then just don't pop up a dialog.
        latest_skipped_version = js_api.request("GET", "config/latest_skipped_version", {}, internal=True)
        if startup and latest_skipped_version == latest_version:
            return

        res = window.create_confirmation_dialog("Update available", "There is an update available! \
            Upgrade to Bean Counter v{}?".format(latest_version))

        if res == 1:
            # Redirect to the Bean Counter downloads page
            webbrowser.open("https://beancounter.me/#downloads")
        else:
            # If user manually declines to update, save latest skipped version to db
            js_api.request("POST", "config/latest_skipped_version",
                {'body': {
                    'title': 'latest_skipped_version',
                    'value': latest_version
                }}, internal=True)
    elif not startup:
        # Only show this dialog if the user selected manually to check for updates from the menu
        window.create_confirmation_dialog("No updates available", "You are on the latest version of Bean Counter.")


if __name__ == '__main__':
    is_dev = True # default to dev
    serving = False # default to bundled mode

    # don't allow running as prod from the terminal (prevent accidents this way)
    in_terminal = sys.stdin and sys.stdin.isatty()

    try:
        opts, args = getopt.getopt(sys.argv[1:], "ps")
        for opt, arg in opts:
            if opt == '-p' and not in_terminal:
                is_dev = False
            elif opt == '-s':
                serving = True
    except getopt.GetoptError:
        # if bad arguments, then just run in dev mode
        pass

    # ng serve mode should only be allowed in dev mode
    if serving and not is_dev:
        serving = False

    entry = get_entrypoint(serving=serving)

    # Put update option under Help menu
    bar_menu_items = [
        wm.Menu(
            'Help',
            [
                wm.MenuAction('Check for Updates', check_for_updates),
            ]
        )
    ]

    js_api = WebviewApi(dev_mode=is_dev)

    window = webview.create_window(
        'Bean Counter',
        entry,
        js_api=js_api,
        x=0,
        y=0
    )

    # Check if there are any updates on startup
    window.events.loaded += lambda:check_for_updates(startup=True, is_dev=is_dev)

    webview.start(debug=is_dev, menu=bar_menu_items)
