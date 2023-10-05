from flask import Flask
from flask_bcrypt import Bcrypt

from .extensions import mongo, bcrypt
from .main import main
from .auth import auth
from .chat.chat import chat

def create_app(config_object='server.settings'):
    app = Flask(__name__)

    app.config.from_object(config_object)

    mongo.init_app(app)

    bcrypt.init_app(app)

    app.register_blueprint(main)
    app.register_blueprint(auth)
    app.register_blueprint(chat)

    return app