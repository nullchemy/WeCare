from flask import Flask, render_template
from flask_cors import CORS
# from chat.test import bp as test
from chatbot import bp as chatbot
from sockets import socketio

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# app.register_blueprint(test)
app.register_blueprint(chatbot)
socketio.init_app(app)

@app.route("/")
def hello_world():
    return render_template("index.html")

if __name__ == '__main__':
    socketio.run(app, debug=True)
