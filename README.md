# financial-planner

Inspired by the book _Your Money or Your Life_, an application to help someone track their financial activity and make informed decisions for their future financial well-being.

##Init Development Environment
* In `frontend/`, run `npm install`
* In `backend/`, `mkvirtualenv finance` and then `pip install -r requirements`


##Run in Development
* Method 1 (develop in browser):
    * In `frontend/`, run `ng serve`
    * In `backend/`, run `python manage.py runserver` and navigate to http://localhost:4200/
* Method 2 (develop in app):
    * In `frontend/` run `npm run build:dev`
    * Run `python run.py -d` to launch the pywebview application in dev mode


##Build Notes
* Angular Routing has been disabled in favor of dynamic component loading for the sake of local page service (from the filesystem)
* In `frontend`, run `ng build --base-href ./`. The distribution frontend files will be put into the `frontend/dist` folder.
* After `ng build` has completed, go to the `frontend/dist` folder and open `index.html`. Remove all `<script>` tags that contain `type="module"` and remove the attribute `nomodule` from all of the remaining tags.

##Notes on updating `pywebview`
* Clone your fork of `pywebview` into any folder (does not have to be a subdirectory of this repo)
* When testing your changes to `pywebview` on this application, first run `pip install <path-to-local-pywebview>`
* If your changes to `pywebview` have not been merged upstream on the parent repo, then update pip package path to `pip install git@github:<username>/pywebview.git` to use the path to your forked repo with the changes you want.
