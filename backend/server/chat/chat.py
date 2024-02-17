from flask import Blueprint, request, jsonify
from ..auth_middleware import token_required
from ..sockets import socketio
from ..extensions import mongo 
import uuid
from datetime import datetime,timezone

chat = Blueprint('chat', __name__)

@chat.route('/newchat', methods=['POST'])
@token_required
def newchat(current_user):
    data = request.get_json()
    my_user_id = current_user['user_id']
    userid = data.get('userid')
    if not userid:
        return {
            "message": "User ID is required for new details",
            "data": None,
            "error": "Bad request"
        }, 400
    chats_collection = mongo.db.chats

    data = {
        "chat_id": str(uuid.uuid4()),
        "participants": [my_user_id, userid],
    }
    chats_collection.insert_one(data)

    return jsonify({"message": "Create new chat successfully!", "status": True}), 200

@chat.route('/prevchats', methods=['GET'])
@token_required
def prevchats(current_user):
    print('Endpoint Hit⚡ - /prevchats [GET]')
    botchats_collection = mongo.db.botchats
    
    # Use request.args to get parameters from the URL
    chat_id = request.args.get('chat_id')
    
    print(chat_id)
    
    if not chat_id:
        return jsonify({
            "message": "Please provide chat_id parameter",
            "data": None,
            "error": "Bad request"
        }), 400

    my_user_id = current_user['user_id']

    # Fetch Prev Bot Chats from database
    chats = botchats_collection.find_one({'chat_id': chat_id})
    if chats:
        return jsonify({'chats': chats['chats']})
    else:
        return jsonify({'chats': []})

@chat.route('/getusers', methods=['GET'])
@token_required
def getusers(current_user):
    my_user_id = current_user['user_id']
    users_collection = mongo.db.users
    users = users_collection.find({'user_id': {'$ne': my_user_id}})
    # Convert MongoDB documents to a list of dictionaries
    users_list = []
    for user in users:
        user_dict = {
            '_id': str(user['_id']),
            'user_id': user['user_id'],
            'full_name': user['full_name'],
            'email': user['email'],
            'user_number': user['user_number'],
            'active': user['active']
        }
        users_list.append(user_dict)
    return jsonify(users_list)

@chat.route('/getchats', methods=['GET'])
@token_required
def getchats(current_user):
    my_user_id = current_user['user_id']
    users_collection = mongo.db.users
    user_data = users_collection.find_one({'user_id': my_user_id}, {'chats': 1})
    if user_data:
        chats = user_data.get('chats', [])
        response = {
            'user_id': my_user_id,
            'chats': chats
        }
        return jsonify(response), 200
    else:
        return jsonify({'message': 'User not found'}), 404

@chat.route('/updatestartedchats', methods=['PUT'])
@token_required
def updatestartedchats(current_user):
    my_user_id = current_user['user_id']
    data = request.get_json()
    users_collection = mongo.db.users
    chat_id = str(uuid.uuid4())
    chatee = {
      "chat_id": chat_id,
      "name": data.get('full_name'),
      "last_message": "",
      "unread_messages": 0,
      "profile_url": "",
      "last_seen": "",
      "timestamp": ""
    }
    users_collection.update_one(
            {'user_id': my_user_id},
            {'$addToSet': {'chats': chatee}},
            upsert=True
        )
    return jsonify({'chat_id': chat_id, 'message': 'updated started chats'}), 200

@socketio.on('chat_message')
@token_required
def start_chatbot(current_user, message):
    print('Chat Endpoint Hit⚡⚡⚡')
    chats_collection = mongo.db.chats
    # create chat ID
    message['message_id'] = str(uuid.uuid4())
    message['sender_id'] = current_user['user_id']
    message['timestamp'] = datetime.now(timezone.utc).timestamp() * 1000
    message['level'] = 'chat'
    # save message to database
    chats_collection.update_one(
            {'chat_id': message.get('chat_id'), 'receiver_id': message.get('chat_id')},
            {'$addToSet': {'chats': message}},
            upsert=True
        )
    # Emit the message to the receiver
    receiver_id = message.get('receiver_id')
    socketio.emit('response', message)

if __name__ == '__main__':
    from app import app, socketio
    socketio.run(app, debug=True)
