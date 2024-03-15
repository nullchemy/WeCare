from flask import Blueprint, request, jsonify
from ..auth_middleware import token_required
from ..sockets import socketio, join_room
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
    chats_collection = mongo.db.chats
    chats = None
    
    # Use request.args to get parameters from the URL
    chat_context = request.args.get('context')
    chat_id = request.args.get('chat_id')
    
    if not chat_id or not chat_context:
        return jsonify({
            "message": "Please provide all required URL parameters",
            "data": None,
            "error": "Bad request"
        }), 400

    my_user_id = current_user['user_id']
    if chat_context == 'bot':
        # Fetch Prev Bot Chats from database
        chats = botchats_collection.find_one({'chat_id': chat_id})
    else:
        chats = chats_collection.find_one({'chat_id': chat_id})

    if chats:
        return jsonify({'chats': chats['chats']}), 200
    else:
        return jsonify({'chats': []}), 200

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

def updatestartedchats(my_user_id, data):
    # my_user_id = current_user['user_id']
    # data = request.get_json()
    users_collection = mongo.db.users
    print(data)

    chat_id = str(uuid.uuid4())
    chatee = {
      "chat_id": chat_id,
      "chatee_id": data.get('receiver_id'),
      "name": data.get('full_name'),
      "last_message": data.get('message'),
      "unread_messages": 0,
      "profile_url": "",
      "last_seen": "",
      "timestamp": data.get('timestamp')
    }
    existing_chat = users_collection.find_one(
        {'user_id': my_user_id, 'chats.chatee_id': data.get('receiver_id')})

    if not existing_chat:
        users_collection.update_one(
                {'user_id': my_user_id},
                {'$addToSet': {'chats': chatee}},
                upsert=True
            )
    existing_chat = users_collection.find_one(
        {'user_id': data.get('receiver_id'), 'chats.chatee_id': my_user_id})
    if not existing_chat:
        sender = users_collection.find_one({'user_id': my_user_id})
        users_collection.update_one(
                {'user_id': data.get('receiver_id')},
                {'$addToSet': {'chats': {
                    "chat_id": chat_id,
                    "chatee_id": my_user_id,
                    "name": sender['full_name'],
                    "last_message": data.get('message'),
                    "unread_messages": 0,
                    "profile_url": "",
                    "last_seen": "",
                    "timestamp": data.get('timestamp')
                }}},
                upsert=True
            )
    return jsonify({'chat_id': chat_id, 'message': 'updated started chats'}), 200

@socketio.on('join_room')
@token_required
def on_join(current_user, data):
    room = data['room']
    join_room(room)
    socketio.emit('open_room', {'room': room})

@socketio.on('chat_message')
@token_required
def start_chatbot(current_user, message):
    print('Chat Endpoint Hit⚡⚡⚡')
    my_user_id = current_user['user_id']
    room = message['room']
    print(message)
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
    # add started chats to both sender and receiver
    updatestartedchats(my_user_id, message)
    # Emit the message to the receiver
    receiver_id = message.get('receiver_id')
    socketio.emit('response', message, room=room)

if __name__ == '__main__':
    from app import app, socketio
    socketio.run(app, debug=True)
