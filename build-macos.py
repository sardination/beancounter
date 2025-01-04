import os
import py2app
import shutil

from setuptools import setup

def tree(src):
    return [(root, [os.path.join(root, f) for f in files])
        for (root, _, files) in os.walk(os.path.normpath(src))]


if os.path.exists('build'):
    shutil.rmtree('build')

if os.path.exists('dist/index.app'):
    shutil.rmtree('dist/index.app')

ENTRY_POINT = ['backend/run.py']

DATA_FILES = tree('frontend/dist') # frontend files
DATA_FILES.extend(tree('backend/migrations')) # alembic migrations

OPTIONS = {
    'argv_emulation': False,
    'argv_inject': ['-p'],
    'strip': True,
    'iconfile': 'assets/logo.icns',
    'includes': ['WebKit', 'Foundation', 'webview'],
    'excludes': ['psycopg2']
}

setup(
    app=ENTRY_POINT,
    name='Bean Counter',
    data_files=DATA_FILES,
    options={'py2app': OPTIONS},
    setup_requires=['py2app'],
)
