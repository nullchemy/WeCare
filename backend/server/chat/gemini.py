from flask import Blueprint, request, jsonify, make_response
import redis
import os
import uuid
import json
import random
from datetime import datetime,timezone
import google.generativeai as genai
from IPython.display import Markdown, display
from ..auth_middleware import token_required
from ..sockets import socketio
from ..extensions import mongo
from .helpline_messages import helpline_message, prevention_messages, start_message
from .suicide_model import check_intent, generate_pdf
from .electra import initialize_model, cleanup

gemini = Blueprint('gemini', __name__)

genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

redis_host = os.environ.get('REDIS_HOST_URL') or 'localhost'
redis_port = int(os.environ.get('REDIS_HOST_PORT') or 6379)
if os.environ.get('ENV') == 'prod':
  redis_client = redis.from_url(f'{redis_host}:{redis_port}')
else:
  redis_client = redis.Redis(host=redis_host, port=redis_port, db=0)

try:
    # Check if the connection is successful
    if redis_client.ping():
        print(f"Connected to Redis successfully")
    else:
        print("Failed to connect to Redis server")
except redis.ConnectionError as e:
    print(f"Error connecting to Redis server: {e}")

# Global variables
chatid = None
user_id= None
receiver_id = None
sender_id = None

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
    "threshold": "BLOCK_NONE"
  },
  {
    "category": "HARM_CATEGORY_HATE_SPEECH",
    "threshold": "BLOCK_NONE"
  },
  {
    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "threshold": "BLOCK_NONE"
  },
  {
    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
    "threshold": "BLOCK_NONE"
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

def printmd(string, level="bot"):
    socketio.emit('typing', {'response': False})
    print(string)
    string = string.replace("Gemini", "Benn")
    string = string.replace("I am a large language model, trained by Google.", "")
    string = string.replace("trained by Google", "")
    string = string.replace("I am a large language model,", "")
    response = {
        "chat_id": chatid,
        "message_id": str(uuid.uuid4()),
        "sender_id": receiver_id,
        "receiver_id": sender_id,
        "timestamp": datetime.now(timezone.utc).timestamp() * 1000,
        "message": str(Markdown(string).data),
        "level": level
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
    global chatid, user_id, receiver_id, sender_id
    botchats_collection = mongo.db.botchats
    # create chat ID
    message['message_id'] = str(uuid.uuid4())
    message['sender_id'] = current_user['user_id']
    message['timestamp'] = datetime.now(timezone.utc).timestamp() * 1000
    message['level'] = 'bot'
    message['status'] = 'sent'
    receiver_id = message['receiver_id']
    sender_id = current_user['user_id']
    socketio.emit('typing', {'response': True})
    # check suicidal intent
    pred = check_intent(message.get('message'), message.get('model'))
    message['analysis'] = pred
    # save message to database
    botchats_collection.update_one(
            {'chat_id': message.get('chat_id')},
            {'$addToSet': {'chats': message}},
        )
    if chatid is None:
      chatid = message.get('chat_id')
    if user_id is None:
        user_id = current_user['user_id']
    
    message_input = message.get('message')
    if "name" in message_input:
      message_input = message.get('message')+', just tell me your name without explaining yourself or adding extra explanations to it. in short i just want the name'
    print(message_input)
    # Get the model response to the user's message
    model_response = get_model_response(message_input)
    # update chat history
    update_chat_history(chatid, json.dumps({'role': 'user', 'parts': [message.get('message')]}))
    update_chat_history(chatid, json.dumps({'role': 'model', 'parts': [model_response]}))
    # Emit the response back to the client
    printmd(model_response)
    if pred['prediction']:
          printmd(format(random.choice(prevention_messages)))
          socketio.emit('typing', {'response': True})
          printmd(format(helpline_message), 'helpline_message')

# initialize and prestart Suicide Model
@socketio.on('model_start')
@token_required
def model_start(current_user, message):
  print('Initialize Suicide Model Endpoint Hit⚡⚡⚡')
  initialize_model()


@gemini.route('/clearchat', methods=['POST'])
@token_required
def clear_chat(current_user):
  print("Endpoint Hit ⚡⚡ [ClearChat]")
  botchats_collection = mongo.db.botchats
  message = request.get_json()
  my_user_id = current_user['user_id']
  result = redis_client.delete(my_user_id)

  if result > 0:
      print(f"Key '{my_user_id}' cleared from the Redis cache.")
  else:
      print(f"Key '{my_user_id}' not found in the Redis cache.")
  try:
    db_result = botchats_collection.update_one(
      {'chat_id': message.get('chatid')},
      {'$set': {'chats': []}}
    )
    return {'message': 'Success fully cleared messages!'}, 200
  except Exception as e:
    print("Failed to Clear chats from Database:", e)

@gemini.route('/analysis', methods=['POST'])
@token_required
def analysis(current_user):
    print("Endpoint Hit ⚡⚡ [Analysis]")
    data = request.get_json()
    my_user_id = current_user['user_id']
    pred = check_intent(data.get('message'), data.get('model'))
    return jsonify(pred), 200

@gemini.route('/report', methods=['POST'])
@token_required
def gen_report(current_user):
    print("Endpoint Hit ⚡⚡ [Generate Report]")
    my_user_id = current_user['user_id']
    data = request.get_json()
    chat_id = data.get('chat_id')
    botchats_collection = mongo.db.botchats
    chats = botchats_collection.find_one({'chat_id': chat_id})['chats']
    my_chats = [chat for chat in chats if chat['receiver_id'] == chat_id]
    for item in my_chats:
      item.pop('chat_id', None)
      item.pop('message_id', None)
      item.pop('sender_id', None)
      item.pop('receiver_id', None)
      item.pop('level', None)
      item.pop('status', None)
    #print(my_chats)
    output_stream = generate_pdf(my_chats)
    # Create response object
    response = make_response(output_stream.getvalue())
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'inline; filename=example.pdf'
    return response, 200

if __name__ == '__main__':
    from app import app, socketio
    socketio.run(app, debug=True)