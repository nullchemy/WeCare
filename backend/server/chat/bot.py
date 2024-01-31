from flask import Blueprint, request, jsonify
from ..auth_middleware import token_required
from ..sockets import socketio
from ..extensions import mongo 

BOT_DEFAULT_SETTINGS = {
    'setting1': 'default_value1',
    'setting2': 'default_value2',
    # Add more settings as needed
}

bot = Blueprint('bot', __name__)

@bot.route('/newbot', methods=['POST'])
@token_required
def newchat(current_user):
    data = request.get_json()
    my_user_id = current_user['user_id']
    new_botname = data.get('botname')
    bots_collection = mongo.db.bots

    # Check if the user already has a bot
    existing_bot = bots_collection.find_one({'user_id': my_user_id})

    if existing_bot:
        # Update existing bot
        bots_collection.update_one(
            {'user_id': my_user_id},
            {'$addToSet': {'botname': new_botname}, '$set': {'settings': BOT_DEFAULT_SETTINGS}},
        )
        response_message = 'Bot Created successfully!'
    else:
        # Create a new bot
        new_bot = {
            'user_id': my_user_id,
            'botname': [new_botname],  # Initialize with a list containing the first bot name
            'settings': BOT_DEFAULT_SETTINGS,
        }
        bots_collection.insert_one(new_bot)
        response_message = 'New bot created successfully!'

    return jsonify({'message': response_message})
