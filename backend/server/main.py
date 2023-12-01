from flask import Blueprint, jsonify, request, render_template
from .auth_middleware import token_required
import uuid

from .extensions import mongo 

main = Blueprint('main', __name__)

@main.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@main.route('/allusers', methods=['GET'])
@token_required
def allusers(current_user):
    users_collection = mongo.db.users
    my_user_id = current_user['user_id']
    users = users_collection.find({})
    user_list = []
    for user in users:
        # Exclude the current user by comparing user IDs
        if user['user_id'] != my_user_id:
            user_data = {
                'user_id': user['user_id'],
                'email': user['email'],
                'full_name': user['full_name'],
                'user_number': user['user_number'],
                'active': user['active'],
            }
            user_list.append(user_data)
    return jsonify({'users': user_list, 'status': True})

@main.route('/newchat', methods=['POST'])
@token_required
def login(current_user):
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



@main.errorhandler(403)
def forbidden(e):
    return jsonify({
        "message": "Forbidden",
        "error": str(e),
        "data": None
    }), 403

@main.errorhandler(404)
def forbidden(e):
    return jsonify({
        "message": "Endpoint Not Found",
        "error": str(e),
        "data": None
    }), 404
