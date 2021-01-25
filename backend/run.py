from httpx import Client
import json
import os
import tkinter as tk
import webview

from app import create_webview_app

# hidden imports
import sqlalchemy.sql.default_comparator


class WebviewApi:
    """
    Api to access python functions from js
    """
    path_start = 'http://beancounter/'

    def __init__(self):
        self.app = create_webview_app()
        self.client = Client(app=self.app, base_url=self.path_start)

    def fullscreen(self):
        webview.windows[0].toggle_fullscreen()

    def request(self, method, path, options):
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
        'Bean Counter',
        entry,
        js_api=WebviewApi(),
        width=screen_width,
        height=screen_height
    )
    webview.start(debug=True)
