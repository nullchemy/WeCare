from flask import Blueprint, request, jsonify
from backend.server.sockets import socketio
from backend.server.extensions import mongo 

# MongoDB setup
group_collection = mongo.db.users

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
    group_collection.insert_one({'room': room, 'message': message})

    # Broadcast the message to all members in the room
    socketio.emit('message', {'message': message}, room=room)

if __name__ == '__main__':
    from app import app, socketio
    socketio.run(app, debug=True)
