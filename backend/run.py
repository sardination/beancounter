import os
from requests import Session
import tkinter as tk
import webview
from wsgiadapter import WSGIAdapter

from app import create_webview_app

# hidden imports
import sqlalchemy.sql.default_comparator


class WebviewApi:
    """
    Api to access python functions from js
    """
    def __init__(self):
        self.app = create_webview_app()

        self.session = Session()
        self.session.mount('http://financeapp/', WSGIAdapter(self.app))

    def fullscreen(self):
        webview.windows[0].toggle_fullscreen()


def get_entrypoint():
    """
    Return the entrypoint filepath
    """

    def exists(path):
        return os.path.exists(os.path.join(os.path.dirname(__file__), path))

    if exists('../frontend/dist/index.html'): # unfrozen development
        return '../frontend/dist/index.html'

    if exists('../Resources/frontend/dist/index.html'): # frozen py2app
        return '../Resources/frontend/dist/index.html'

    if exists('./frontend/dist/index.html'):
        return './frontend/dist/index.html'

    raise Exception('No index.html found')


def get_curr_screen_geometry():
    """
    Workaround to get the size of the current screen in a multi-screen setup.

    Returns:
        (width, height): width and height of the current screen
    """
    root = tk.Tk()
    root.update_idletasks()
    root.attributes('-fullscreen', False)
    root.state('iconic')
    width = root.winfo_screenwidth()
    height = root.winfo_screenheight()
    root.destroy()
    return width, height


entry = get_entrypoint()

if __name__ == '__main__':
    screen_width, screen_height = get_curr_screen_geometry()

    window = webview.create_window(
        'Financial Planner',
        entry,
        js_api=WebviewApi(),
        width=screen_width,
        height=screen_height
    )
    webview.start(debug=True)
