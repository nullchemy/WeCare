from flask import Blueprint, request, jsonify, session
import uuid
import jwt
from flask import current_app
from .auth_middleware import token_required

from .extensions import mongo, bcrypt
auth = Blueprint('auth', __name__)

def generate_user_id():
    return str(uuid.uuid4())

def generate_user_number():
    users_collection = mongo.db.users
    last_user = users_collection.find_one(sort=[('user_number', -1)])  # Get the last user

    if last_user and 'user_number' in last_user:
        last_user_number = last_user['user_number']
    else:
        last_user_number = 99999  # Set a default starting number

    new_user_number = last_user_number + 1
    return new_user_number

@auth.route('/auth/register', methods=['POST', 'OPTIONS'])
def register():
    data = request.get_json()
    if not data:
        return {
            "message": "Please provide user details",
            "data": None,
            "error": "Bad request"
        }, 400
    full_name = data.get('full_name')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')
    users_collection = mongo.db.users

    # Check if password and confirm password match
    if password != confirm_password:
        return jsonify({"message": "Passwords do not match. Please try again."}), 400

    # Generate unique user_id and user number
    user_id = generate_user_id()
    user_number = generate_user_number()

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Save user details to the database
    user_data = {
        'user_id': user_id,
        'full_name': full_name,
        'profile_url': '',
        'email': email,
        'hashed_password': hashed_password,
        'user_number': user_number,
        'chats': [],
        'active': True
    }
    result = users_collection.insert_one(user_data)
    # token should expire after 24 hrs
    if result.acknowledged:
        token = jwt.encode(
            {"user_id": user_id},
            current_app.config["SECRET_KEY"],
            algorithm="HS256"
        )
        print("Insertion successful. Token generated")
        return jsonify({"message": "User registered successfully!", "status": True, "token": token, "meta": {"user_id": user_id, "full_name": full_name, "email": email}}), 201
    else:
        print("Insertion failed.")
        return jsonify({"message": "User registration failed!"}), 500



@auth.route('/auth/login', methods=['POST', 'OPTIONS'])
def login():
    data = request.get_json()
    if not data:
        return {
            "message": "Please provide user details",
            "data": None,
            "error": "Bad request"
        }, 400
    email_or_user_id = data.get('email_or_user_id')
    password = data.get('password')
    users_collection = mongo.db.users

    # Check if the user exists
    user = users_collection.find_one({'$or': [{'email': email_or_user_id}, {'user_id': email_or_user_id}]})

    if user and bcrypt.check_password_hash(user['hashed_password'], password):
        # token should expire after 24 hrs
        token = jwt.encode(
            {"user_id": user["user_id"]},
            current_app.config["SECRET_KEY"],
            algorithm="HS256"
        )
        print(user)

        return jsonify({"message": "Login successful", "status": True, "token": token, "meta": {"user_id": user["user_id"], "full_name": user["full_name"], "email": user['email'], "profile_url": user["profile_url"]}}), 200

    return jsonify({"message": "Invalid credentials. Please try again.", "status": False}), 401

@auth.route('/updateprofile', methods=['PUT'])
@token_required
def updateprofile(current_user):
    data = request.get_json()
    profile_url = data.get('url')
    my_user_id = current_user['user_id']
    users_collection = mongo.db.users
    # Find the user by user_id and update the profile_url
    result = users_collection.update_one({'user_id': my_user_id}, {'$set': {'profile_url': profile_url}})
    # Check if the user was found and updated
    if result.modified_count == 1:
        return jsonify({'message': 'Profile updated successfully'}), 200
    else:
        return jsonify({'message': 'profile update failed'}), 404