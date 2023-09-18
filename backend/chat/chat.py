from flask import Blueprint, request, jsonify
from sockets import socketio
import os
from transformers import AutoModelForCausalLM, AutoTokenizer, AutoModelForSequenceClassification
import torch
import random
from IPython.display import Markdown
from datasets import Dataset


start_message = "==== Hello! I am Alex and I am your virtual friend. If you need a listening ear, I'm always here. To end the chat, input 'exit' in the chatbox. ===="

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

helpline_message = "In times of severe distress where you need to speak with someone immediately, these are suicide hotline services available for you. You will be speaking with volunteers or professionals who are trained to deal with suicide crisis. Samaritans of Singapore (SOS; 24 hours): 1800 221 4444 Mental Health Helpline (24 hours): 6389 2222 Singapore Association for Mental Health (SAMH) Helpline: 1800 283 7019"

class ChatHandler:
    def __init__(self):
        self.tokenizer, self.model = self.load_tokenizer_and_model()
        self.chat_history_ids = None
        self.suicide_tokenizer, self.suicide_model = self.load_suicide_tokenizer_and_model()

    def load_tokenizer_and_model(self, model="microsoft/DialoGPT-large"):
        tokenizer = AutoTokenizer.from_pretrained(model)
        model = AutoModelForCausalLM.from_pretrained(model)
        return tokenizer, model

    def load_suicide_tokenizer_and_model(self, tokenizer="google/electra-base-discriminator", model="Models/electra"):
        suicide_tokenizer = AutoTokenizer.from_pretrained(tokenizer)
        suicide_model = AutoModelForSequenceClassification.from_pretrained(model)
        return suicide_tokenizer, suicide_model

    def check_intent(self, text):
        tokenised_text = self.suicide_tokenizer.encode_plus(text, return_tensors="pt")
        logits = self.suicide_model(**tokenised_text)[0]
        prediction = round(torch.softmax(logits, dim=1).tolist()[0][1])
        return prediction

    def generate_response(self, user_input, chat_round):
        if user_input == "exit":
            raise Exception("End of Conversation")
        new_input_ids = self.tokenizer.encode(user_input + self.tokenizer.eos_token, return_tensors='pt')
        bot_input_ids = torch.cat([self.chat_history_ids, new_input_ids], dim=-1) if chat_round > 0 else new_input_ids
        self.chat_history_ids = self.model.generate(bot_input_ids, max_length=1250, pad_token_id=self.tokenizer.eos_token_id)
        if self.check_intent(user_input):
            self.print_response("*Alex:* {}".format(random.choice(prevention_messages)))
            self.print_response("{}".format(helpline_message))
        else:
            self.print_response("*Alex:* {}".format(self.tokenizer.decode(self.chat_history_ids[:, bot_input_ids.shape[-1]:][0], skip_special_tokens=True)))

    def print_response(self, string):
        socketio.emit('response', {'response': Markdown(string).data})
        print(Markdown(string).data)

# Create a ChatHandler instance
chat_handler = ChatHandler()

bp = Blueprint('chat', __name__)

@socketio.on('newchat')
def handle_newChat():
    chat_handler.print_response(start_message)

@socketio.on('client_message')
def handle_message(message):
    user_input = message
    print(user_input)
    global chat_round

    try:
        if user_input == "exit":
            raise Exception("End of Conversation")
        if not chat_handler.chat_history_ids:
            chat_handler.print_response(start_message)
        chat_handler.generate_response(user_input, chat_round)
        if chat_handler.check_intent(user_input):
            response = random.choice(prevention_messages)
            helpline = helpline_message
            socketio.emit('response', {'response': response, 'helpline': helpline})
            return jsonify(response=response, helpline=helpline)
        else:
            response = chat_handler.tokenizer.decode(chat_handler.chat_history_ids[:, -1], skip_special_tokens=True)
            socketio.emit('response', {'response': response})
            return jsonify(response=response)
    except Exception as e:
        print(str(e))
        return jsonify(error=str(e))

if __name__ == '__main__':
    from app import app, socketio
    chat_round = 0
    socketio.run(app, debug=True)
