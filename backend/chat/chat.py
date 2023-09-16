from flask import Blueprint, jsonify

bp = Blueprint('chat', __name__)

@bp.route('/chat', methods=['GET'])
def route3():
    return jsonify(message='This is chat route')