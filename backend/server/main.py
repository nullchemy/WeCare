from .auth_middleware import token_required
from flask import Blueprint, jsonify

from .extensions import mongo 

main = Blueprint('main', __name__)

@main.route('/')
@token_required
def index():
    user_collection = mongo.db.users
    user_collection.insert_one({'name' : 'Cristina'})
    user_collection.insert_one({'name' : 'Derek'})
    return '<h1>Added a User!</h1>'

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
