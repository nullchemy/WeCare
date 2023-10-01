from flask import Flask, render_template, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_pymongo import PyMongo
from auth import registerlogic, loginlogic
from chat.chat import bp as chat
from chatbot import bp as chatbot
from sockets import socketio

app = Flask(__name__)
cors = CORS(app)
app.config["MONGO_URI"] = "mongodb://localhost:27017/myDatabase"
mongo = PyMongo(app)
bcrypt = Bcrypt(app)

app.register_blueprint(chat)
app.register_blueprint(chatbot)
socketio.init_app(app)

@app.route("/")
def hello_world():
    return render_template("index.html")

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    full_name = data.get('full_name')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')
    return registerlogic(full_name, email, password, confirm_password, bcrypt)

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email_or_user_id = data.get('email_or_user_id')
    password = data.get('password')
    return loginlogic(email_or_user_id, password)

if __name__ == '__main__':
    socketio.run(app, debug=True)
