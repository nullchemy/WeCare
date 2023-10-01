from flask import Flask, request, jsonify, session
from pymongo import MongoClient
import uuid


client = MongoClient('mongodb://localhost:27017/')
db = client['wecare']
users_collection = db['users']

def generate_user_id():
    return str(uuid.uuid4())

def generate_user_number():
    last_user = users_collection.find_one(sort=[('user_number', -1)])  # Get the last user
    last_user_number = last_user['user_number'] if last_user else 100000
    new_user_number = last_user_number + 1
    return new_user_number

def registerlogic(full_name, email, password, confirm_password, bcrypt):
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


def loginlogic(email_or_user_id, password):
    # Check if the user exists
    user = users_collection.find_one({'$or': [{'email': email_or_user_id}, {'user_id': email_or_user_id}]})

    if user and bcrypt.check_password_hash(user['hashed_password'], password):
        session['user_id'] = user['user_id']
        return jsonify({"message": "Login successful", "user_id": user['user_id']}), 200

    return jsonify({"message": "Invalid credentials. Please try again."}), 401