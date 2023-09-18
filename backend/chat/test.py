from flask import Blueprint, request, jsonify
from sockets import socketio
import os
from transformers import AutoModelForCausalLM, AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
import torch
import random
import pandas as pd
from IPython.display import Markdown, display
from datasets import Dataset

bp = Blueprint('chat', __name__)

start_message = "==== Hello! I am Alex and I am your virtual friend. If you need a listening ear, I'm always here. To end the chat, input 'exit' in the chatbox. ===="
prevention_messages = ["Are you okay? How long have you been feeling this way?",
                       # ... (all prevention messages)
                      ]
helpline_message = "In times of severe distress where you need to speak with someone immediately, these are suicide hotline services available for you. You will be speaking with volunteers or professionals who are trained to deal with suicide crisis. Samaritans of Singapore (SOS; 24 hours): 1800 221 4444 Mental Health Helpline (24 hours): 6389 2222 Singapore Association for Mental Health (SAMH) Helpline: 1800 283 7019"

def printmd(string):
    socketio.emit('response', {'response': Markdown(string).data})
    print(Markdown(string).data)

def load_tokenizer_and_model(model="microsoft/DialoGPT-large"):
    tokenizer = AutoTokenizer.from_pretrained(model)
    model = AutoModelForCausalLM.from_pretrained(model)
    return tokenizer, model

def load_suicide_tokenizer_and_model(tokenizer="google/electra-base-discriminator", model="Models/electra"):
    suicide_tokenizer = AutoTokenizer.from_pretrained(tokenizer)
    suicide_model = AutoModelForSequenceClassification.from_pretrained(model)
    return suicide_tokenizer, suicide_model

def check_intent(text):
    global suicide_tokenizer, suicide_model
    tokenised_text = suicide_tokenizer.encode_plus(text, return_tensors="pt")
    logits = suicide_model(**tokenised_text)[0]
    prediction = round(torch.softmax(logits, dim=1).tolist()[0][1])
    return prediction

def generate_response(tokenizer, model, chat_round, chat_history_ids, user_input):
    if user_input == "exit":
        raise Exception("End of Conversation")
    new_input_ids = tokenizer.encode(user_input + tokenizer.eos_token, return_tensors='pt')
    bot_input_ids = torch.cat([chat_history_ids, new_input_ids], dim=-1) if chat_round > 0 else new_input_ids
    chat_history_ids = model.generate(bot_input_ids, max_length=1250, pad_token_id=tokenizer.eos_token_id)
    if check_intent(user_input):
        printmd("*Alex:* {}".format(random.choice(prevention_messages)))
        printmd("{}".format(helpline_message))
    else:
        printmd("*Alex:* {}".format(tokenizer.decode(chat_history_ids[:, bot_input_ids.shape[-1]:][0], skip_special_tokens=True)))
    return chat_history_ids

@socketio.on('newchat')
def handle_newChat():
    printmd(start_message)

@socketio.on('client_message')
def handle_message(message):
    user_input = message
    print(user_input)
    global tokenizer, model, chat_history_ids

    try:
        chat_history_ids = generate_response(tokenizer, model, 0, chat_history_ids, user_input)
        if user_input == "exit":
            raise Exception("End of Conversation")
        if not chat_history_ids:
            printmd(start_message)
        chat_history_ids = generate_response(tokenizer, model, 0, chat_history_ids, user_input)
        if check_intent(user_input):
            response = random.choice(prevention_messages)
            helpline = helpline_message
            socketio.emit('response', {'response': response, 'helpline': helpline})
            return jsonify(response=response, helpline=helpline)
        else:
            response = tokenizer.decode(chat_history_ids[:, -1], skip_special_tokens=True)
            socketio.emit('response', {'response': response})
            return jsonify(response=response)
    except Exception as e:
        print(str(e))
        return jsonify(error=str(e))

if __name__ == '__main__':
    from app import app, socketio
    tokenizer, model = load_tokenizer_and_model()
    chat_history_ids = None
    suicide_tokenizer, suicide_model = load_suicide_tokenizer_and_model()
    socketio.run(app, debug=True)