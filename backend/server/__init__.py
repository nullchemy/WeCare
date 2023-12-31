from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS

from .extensions import mongo, bcrypt
from .sockets import socketio
from .main import main
from .auth import auth
from .chat.chatbot import chatbot

def create_app(config_object='server.settings'):
    app = Flask(__name__)

    app.config.from_object(config_object)

    mongo.init_app(app)

    bcrypt.init_app(app)

    CORS(app)

    app.register_blueprint(main)
    app.register_blueprint(auth)
    app.register_blueprint(chatbot)

    socketio.init_app(app)

    return app