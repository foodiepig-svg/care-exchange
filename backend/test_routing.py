from flask import Flask, send_from_directory
import os

app = Flask(__name__)

_static_dir = os.environ.get('STATIC_ROOT', '/app/workspace/dist')

@app.route('/')
def index():
    return f"INDEX: static_dir={_static_dir}, exists={os.path.exists(_static_dir)}"

@app.route('/<path:path>')
def spa(path):
    return f"CATCH-ALL: path={path}, static_dir={_static_dir}, exists={os.path.exists(_static_dir)}"

@app.route('/api/health')
def health():
    return {'status': 'healthy'}

app.wsgi_app = WhiteNoise(app.wsgi_app, root=_static_dir) if os.path.exists(_static_dir) else app.wsgi_app
