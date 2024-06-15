from waitress import serve
from . import app

serve(app.app, host='0.0.0.0', port=8080)