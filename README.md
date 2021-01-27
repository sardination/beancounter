# financial-planner

Inspired by the book _Your Money or Your Life_, an application to help someone track their financial activity and make informed decisions for their future financial well-being.

##Init Development Environment
* In `frontend/`, run `npm install`
* In `backend/`, `mkvirtualenv finance` and then `pip install -r requirements`


##Build Notes:
* Angular Routing has been disabled in favor of dynamic component loading for the sake of local page service (from the filesystem)
* In `frontend`, run `ng build --base-href ./`. The distribution frontend files will be put into the `frontend/dist` folder.
* After `ng build` has completed, go to the `frontend/dist` folder and open `index.html`. Remove all `<script>` tags that contain `type="module"` and remove the attribute `nomodule` from all of the remaining tags.