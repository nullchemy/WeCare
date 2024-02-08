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

# @chat.route('/prevchats', methods=['GET'])
# @token_required
# def prevchats(current_user):
#     print('Endpoint Hit⚡ - /prevchats [GET]')
#     data = request.get_json()
#     print(data)
#     my_user_id = current_user['user_id']
#     print(my_user_id)
#     if not data:
#         print('Please provide chat details')
#         return {
#             "message": "Please provide chat details",
#             "data": None,
#             "error": "Bad request"
#         }, 400
#     chatid = data.get('chat_id')
#     print(chatid)
#     # chats_collection = mongo.db.chats
#     return jsonify({'users': {}, 'status': True})

@chat.route('/prevchats', methods=['GET'])
@token_required
def prevchats(current_user):
    print('Endpoint Hit⚡ - /prevchats [GET]')
    
    # Use request.args to get parameters from the URL
    chat_id = request.args.get('chat_id')
    
    print(chat_id)
    
    if not chat_id:
        print('Please provide chat details')
        return jsonify({
            "message": "Please provide chat_id parameter",
            "data": None,
            "error": "Bad request"
        }), 400

    my_user_id = current_user['user_id']
    print(my_user_id)

    # Do something with chat_id
    
    return jsonify({'users': {}, 'status': True})

if __name__ == '__main__':
    from app import app, socketio
    socketio.run(app, debug=True)
