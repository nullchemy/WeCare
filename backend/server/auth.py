from flask import Blueprint, request, jsonify, session
import uuid

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

@auth.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
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
        'email': email,
        'hashed_password': hashed_password,
        'user_number': user_number
    }
    users_collection.insert_one(user_data)

    return jsonify({"message": "User registered successfully!", "user_id": user_id, "user_number": user_number}), 201


@auth.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email_or_user_id = data.get('email_or_user_id')
    password = data.get('password')
    users_collection = mongo.db.users

    # Check if the user exists
    user = users_collection.find_one({'$or': [{'email': email_or_user_id}, {'user_id': email_or_user_id}]})

    if user and bcrypt.check_password_hash(user['hashed_password'], password):
        # generate sessionid and save to database
        sessionid = str(uuid.uuid4())
        users_collection.update_one(
            {'user_id': user['user_id']},
            {'$set': {'sessionid': sessionid}}
        )

        return jsonify({"message": "Login successful", "status": True, "session": {"sessionid": sessionid, "user_id": user['user_id']}}), 200

    return jsonify({"message": "Invalid credentials. Please try again.", "status": False}), 401

@auth.route('/auth/session', methods=['POST'])
def session():
    data = request.get_json()
    sessiondet = data.get('auth')
    users_collection = mongo.db.users

    # Check if the session exists
    session = users_collection.find_one({
        'sessionid': sessiondet['sessionid'],
        'user_id': sessiondet['user_id']
    })
    
    if session:
        # Session exists
        return jsonify({'session': True}), 200
    else:
        # Session does not exist
        return jsonify({'session': False}), 404