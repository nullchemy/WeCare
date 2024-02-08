from flask import Blueprint, request, jsonify
from ..auth_middleware import token_required
from ..sockets import socketio
from ..extensions import mongo 

# MongoDB setup
# group_collection = mongo.db.users

chat = Blueprint('chat', __name__)

# when a user joins a group
@socketio.on('join_group')
def join_room(data):
    roomid = data['room_id']
    userid = data['room_id']
    join_room(roomid)
    socketio.emit('joined_group', {'message': f'{userid} joined'}, room=roomid)

# when a user sends a group message
@socketio.on('group_message')
def handle_message(data):
    room = data['room_id']
    message = data['message']

    # Save the message to the database
    # group_collection.insert_one({'room': room, 'message': message})

    # Broadcast the message to all members in the room
    socketio.emit('message', {'message': message}, room=room)

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

if __name__ == '__main__':
    from app import app, socketio
    socketio.run(app, debug=True)
