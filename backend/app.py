from flask import Flask
from chat.chat import bp as chat

app = Flask(__name__)

app.register_blueprint(chat)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"