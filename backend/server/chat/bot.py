from flask import Blueprint, request, jsonify
from ..auth_middleware import token_required
from ..sockets import socketio
from ..extensions import mongo 

# MongoDB setup
# group_collection = mongo.db.users

bot = Blueprint('bot', __name__)

@chat.route('/newbot', methods=['POST'])
@token_required
def newchat(current_user):
    data = request.get_json()
    my_user_id = current_user['user_id']
    botname = data.get('botname')