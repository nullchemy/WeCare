from flask_socketio import SocketIO, join_room

socketio = SocketIO(cors_allowed_origins="*")

join_room = join_room