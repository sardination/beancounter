from requests import Session
import webview
from wsgiadapter import WSGIAdapter

from app import create_webview_app


class PyWebviewApi:
    def __init__(self):
        self.app = create_webview_app()

        self.session = Session()
        self.session.mount('http://financeapp/', WSGIAdapter(self.app))

    def make_request(self, request):
        # HANDLE THE FORMAT PASSED FROM ANGULAR AND PASS MORE ARGS BELOW:
        self.session.request(request.method, request.url)

if __name__ == '__main__':
    webview_api = PyWebviewApi()
    window = webview.create_window('Financial Planner', html="??????", js_api=webview_api)
    webview.start()