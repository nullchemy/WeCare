from flask import Blueprint, request, jsonify
from ..auth_middleware import token_required
from ..sockets import socketio
from ..extensions import mongo 
import uuid

BOT_DEFAULT_SETTINGS = {
    'setting1': 'default_value1',
    'setting2': 'default_value2',
}

bot = Blueprint('bot', __name__)

@bot.route('/newbot', methods=['POST'])
@token_required
def newchat(current_user):
    data = request.get_json()
    my_user_id = current_user['user_id']
    new_botname = data.get('botname')
    bot_profile_pic = data.get('bot_profile_pic')
    bots_collection = mongo.db.bots
    botchats_collection = mongo.db.botchats

    bot_id = str(uuid.uuid4())

    # Check if the user already has a bot
    existing_bot = bots_collection.find_one({'user_id': my_user_id})

    if existing_bot:
        # add Bot to user's Bots
        bots_collection.update_one(
            {'user_id': my_user_id},
            {'$addToSet': {'bot': {'botname': new_botname, 'bot_id': bot_id, 'bot_profile_pic': bot_profile_pic}}, '$set': {'settings': BOT_DEFAULT_SETTINGS}},
        )
        response_message = 'Bot Created successfully!'
    else:
        # Create a new bot for the user
        new_bot = {
            'user_id': my_user_id,
            'bot': [{'botname': new_botname, 'bot_id': bot_id, 'bot_profile_pic': bot_profile_pic}],  # Initialize with a list containing the first bot name
            'settings': BOT_DEFAULT_SETTINGS,
        }
        bots_collection.insert_one(new_bot)
        response_message = 'New bot created successfully!'
    # initialize Chat for the user's Bot
    botchats_collection.insert_one({'user_id': my_user_id,'bot_id': bot_id, 'chat_id': bot_id, 'level': 'bot', 'bot_profile_pic': bot_profile_pic, 'chats': []})

    return jsonify({'message': response_message})

@bot.route('/mybots', methods=['GET'])
@token_required
def get_user_bots(current_user):
    my_user_id = current_user['user_id']
    bots_collection = mongo.db.bots

    # Retrieve the user's bots from the database
    user_bots = bots_collection.find_one({'user_id': my_user_id}, {'_id': 0, 'user_id': 0})

    if user_bots:
        return jsonify({'user_bots': user_bots['bot']})
    else:
        return jsonify({'user_bots': []})