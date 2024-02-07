# working chatbot with suicide detection
from flask import Blueprint
from ..sockets import socketio
import os
import torch
import random
import pandas as pd
from transformers import AutoModelForCausalLM, AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
from transformers.utils import logging
from IPython.display import Markdown, display
from datasets import Dataset

# Global variables to store tokenizer and models
chat_round = 0
tokenizer = None
model = None
suicide_tokenizer = None
suicide_model = None 
chat_history_ids = torch.tensor([])

logging.get_logger("transformers").setLevel(logging.ERROR)


start_message = "Hello! I am your virtual friend. If you need a listening ear, I'm always here."

prevention_messages = ["Are you okay? How long have you been feeling this way?",
                       "That sounds so painful, and I appreciate you sharing that with me. How can I help?",
                       "I know things seem bleak now, but it can be hard to see possible solutions when you feel so overwhelmed.",
                       "I'm concerned about you because I care, and I want to offer support however I can. You can talk to me.",
                       "I'm always here if you feel like talking.",
                       "I'm always here to listen, but do you think a therapist could help a little more?",
                       "Have you thought about talking to a therapist?",
                       "You can withstand any storm and when you are too tired to stand, I will hold you up. You are never alone.",
                       "You know I’m always here for you.",
                       "You’re allowed to have bad days, but remember tomorrow is a brand new day.",
                       "You’ve got a place here on Earth for a reason.",
                       "It's okay to have such thoughts but if they become overwhelming, don't keep it to yourself. I am here for you.",
                       "Everything is a season, and right now you’re in winter. It’s dark and cold and you can’t find shelter, but one day it’ll be summer, and you’ll look back and be grateful you stuck it out through winter.",
                       "I know you are going through a lot and you’re scared, but you will never lose me.",
                       "I know it feels like a lot right now. It’s OK to feel that way.",
                       "Is there anything I can do to make this day go easier for you?"]

helpline_message = "In times of severe distress where you need to speak with someone immediately, these are suicide hotline services available for you. You will be speaking with volunteers or professionals who are trained to deal with suicide crisis. Befrienders Kenya (24 hours): +254 722 178 177, NiskiZe: 0900 620 800, Emergency Medicine Kenya Foundation (EMKF): 0800 723 253, Cognitive Behavioral Therapy-Kenya (CBT-Kenya): +254 739 935 333 or +254 756 454 585"

def printmd(string):
    socketio.emit('typing', {'response': False})
    print(string)
    socketio.emit('response', {'response': {
"timestamp": "now",
"userid": "user456",
"sendername": "Alex",
"level": "BOT",
"message": Markdown(string).data
}})

def load_tokenizer_and_model(model="microsoft/DialoGPT-large"):
  global tokenizer
  tokenizer = AutoTokenizer.from_pretrained(model)
  tokenizer.padding_side = "left" 
  model = AutoModelForCausalLM.from_pretrained(model)
  return tokenizer, model

def load_suicide_tokenizer_and_model(tokenizer="google/electra-base-discriminator", model="Models/electra"):
  global suicide_tokenizer, suicide_model
  suicide_tokenizer = AutoTokenizer.from_pretrained(tokenizer)
  suicide_tokenizer.padding_side = "left" 
  suicide_model = AutoModelForSequenceClassification.from_pretrained(model)
  return suicide_tokenizer, suicide_model

def check_intent(text):
  global suicide_tokenizer, suicide_model
  print('Running generating response')
  socketio.emit('typing', {'response': True})
  if suicide_tokenizer is None or suicide_model is None:
        socketio.emit('info', {'response': Markdown('Loading Suicide model...').data})
        suicide_tokenizer, suicide_model = load_suicide_tokenizer_and_model()
  tokenised_text = suicide_tokenizer.encode_plus(text, return_tensors="pt")
  logits = suicide_model(**tokenised_text)[0]
  prediction = round(torch.softmax(logits, dim=1).tolist()[0][1])
  return prediction

def generate_response(chat_round, user_input):
  global tokenizer, model, chat_history_ids
  print('Running generating response')
  socketio.emit('typing', {'response': True})
  if user_input == "exit":
    raise Exception("End of Conversation")
  new_input_ids = tokenizer.encode(user_input + tokenizer.eos_token, return_tensors='pt')
  bot_input_ids = torch.cat([chat_history_ids.long(), new_input_ids], dim=-1) if chat_round > 0 else new_input_ids.long()
  chat_history_ids = model.generate(bot_input_ids, max_length=1250, pad_token_id=tokenizer.eos_token_id)
  if check_intent(user_input):
    printmd(format(random.choice(prevention_messages)))
    socketio.emit('typing', {'response': True})
    printmd(format(helpline_message))
  else:
    printmd(format(tokenizer.decode(chat_history_ids[:, bot_input_ids.shape[-1]:][0], skip_special_tokens=True)))
  return chat_history_ids

def cleanup():
    global tokenizer, model, suicide_tokenizer, suicide_model
    if model is not None:
        del model
    if tokenizer is not None:
        del tokenizer
    if suicide_model is not None:
        del suicide_model
    if suicide_tokenizer is not None:
        del suicide_tokenizer

chatbot = Blueprint('chatbot', __name__)

@socketio.on('client_message')
def start_chatbot(message):
    print('Endpoint Hit⚡⚡⚡')
    global tokenizer, model, chat_round, chat_history_ids
    if tokenizer is None or model is None:
        socketio.emit('info', {'response': Markdown('Loading DialogGPT model...').data})
        tokenizer, model = load_tokenizer_and_model()
    user_input = message.get('message', '').lower()
    print(user_input)
    if user_input.lower() == "start":
        printmd(start_message)
    else:
        try:
            chat_round += 1
            chat_history_ids = generate_response(chat_round, user_input)
        except Exception as e:
            cleanup()
            printmd("chat session terminated!, See Ya")

if __name__ == '__main__':
    from app import app, socketio
    socketio.run(app, debug=True)
