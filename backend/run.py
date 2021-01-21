from flask import request

import webview

from app import create_app



class PyWebviewApi:
    def __init__():
        self.app = create_app()

    def make_request(self, request):
        # HANDLE THE FORMAT PASSED FROM ANGULAR
        with self.app.test_request_context(request.path, method=request.method):
            # MORE ARGS
            return app.full_dispatch_request()

if __name__ == '__main__':
    # # serve(app, host='127.0.0.1', port=5000)
    # # app = create_app()

    # # import ipdb
    # # ipdb.set_trace()

    # with app.test_request_context('/prior-income', method="GET"):
    #     return app.full_dispatch_request()

    webview_api = PyWebviewApi()
    window = webview.create_window('Financial Planner', html="??????", js_api=webview_api)
    webview.start()