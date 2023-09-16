from flask import Flask
from flask_socketio import SocketIO
from chat.chat import bp as chat

app = Flask(__name__)
socketio = SocketIO(app)
app.register_blueprint(chat)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

if __name__ == '__main__':
    socketio.run(app)