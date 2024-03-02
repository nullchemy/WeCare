from flask import Blueprint, request, jsonify
import redis
import os
import uuid
import json
from datetime import datetime,timezone
import google.generativeai as genai
from IPython.display import Markdown, display
from ..auth_middleware import token_required
from ..sockets import socketio
from ..extensions import mongo

gemini = Blueprint('gemini', __name__)

genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))
redis_client = redis.Redis(host=os.environ.get('REDIS_HOST_URL') or 'localhost', port=os.environ.get('REDIS_HOST_PORT') or 6379, db=0)

# Global variables
chatid = None
user_id= None

# Set up the model
generation_config = {
  "temperature": 0.9,
  "top_p": 1,
  "top_k": 1,
  "max_output_tokens": 2048,
}

safety_settings = [
  {
    "category": "HARM_CATEGORY_HARASSMENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_HATE_SPEECH",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
]

# retrieve chat history for a user
def get_chat_history(user_id):
  return redis_client.lrange(f'chat_history:{user_id}', 0, -1)

# update chat history
def update_chat_history(user_id, message):
  redis_client.rpush(f'chat_history:{user_id}', message)

model = genai.GenerativeModel(model_name="gemini-1.0-pro",
                              generation_config=generation_config,
                              safety_settings=safety_settings)

convo = model.start_chat(history=list(map(lambda x: x.decode("utf-8"), get_chat_history(user_id))))

def get_model_response(user_input):
    convo.send_message(user_input)
    return convo.last.text

def printmd(string):
    socketio.emit('typing', {'response': False})
    response = {
        "message_id": str(uuid.uuid4()),
        "sender_id": '',
        "receiver_id": '',
        "timestamp": datetime.now(timezone.utc).timestamp() * 1000,
        "message": str(Markdown(string).data),
        "level": 'bot',
        "status": 'sent',
      }
    # save response to database
    botchats_collection = mongo.db.botchats
    botchats_collection.update_one(
            {'chat_id': chatid},
            {'$addToSet': {'chats': response}},
        )
    response.pop('_id', None)
    json_response = json.dumps(response)
    socketio.emit('response', {'response': response})

@socketio.on('gemini_message')
@token_required
def gemini_chat(current_user, message):
    print('Gemini Endpoint Hit⚡⚡⚡')
    global chatid, user_id
    botchats_collection = mongo.db.botchats
    print(message)
    # create chat ID
    message['message_id'] = str(uuid.uuid4())
    message['sender_id'] = current_user['user_id']
    message['timestamp'] = datetime.now(timezone.utc).timestamp() * 1000
    message['level'] = 'bot'
    message['status'] = 'sent'
    # save message to database
    botchats_collection.update_one(
            {'chat_id': message.get('chat_id')},
            {'$addToSet': {'chats': message}},
        )
    if chatid is None:
      chatid = message.get('chat_id')
    if user_id is None:
        user_id = current_user['user_id']
    socketio.emit('typing', {'response': True})
    # Get the model response to the user's message
    model_response = get_model_response(message.get('message'))
    # update chat history
    update_chat_history(current_user['user_id'], json.dumps({'role': 'user', 'parts': [message.get('message')]}))
    update_chat_history(current_user['user_id'], json.dumps({'role': 'model', 'parts': [model_response]}))
    # Emit the response back to the client
    printmd(model_response)

if __name__ == '__main__':
    from app import app, socketio
    socketio.run(app, debug=True)