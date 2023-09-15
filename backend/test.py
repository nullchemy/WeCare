import os
import torch
import random
from transformers import AutoModelForCausalLM, AutoTokenizer, AutoModelForSequenceClassification

# Load the chatbot tokenizer and model
chatbot_model = "microsoft/DialoGPT-large"
chatbot_tokenizer = AutoTokenizer.from_pretrained(chatbot_model)
chatbot_model = AutoModelForCausalLM.from_pretrained(chatbot_model)

# Initialize chatbot history variable
chat_history_ids = None

# Load the tokenizer and model for suicide intent detection
model_path = "./Models/electra"  # Replace with the actual path to your ELECTRA model
suicide_tokenizer = AutoTokenizer.from_pretrained(model_path)
suicide_model = AutoModelForSequenceClassification.from_pretrained(model_path)

# Define Constants
start_message = "==== Hello! I am Alex and I am your virtual friend. If you need a listening ear, I'm always here. To end the chat, input 'exit' in the chatbox. ===="
prevention_messages = [...]  # Your list of prevention messages
helpline_message = "In times of severe distress where you need to speak with someone immediately, these are suicide hotline services available for you..."

# Function to generate a response using the chatbot model
def generate_response(tokenizer, model, user_input, chat_history_ids):
    # Encode user input and End-of-String (EOS) token
    new_input_ids = tokenizer.encode(user_input + tokenizer.eos_token, return_tensors='pt')

    # Append tokens to chat history
    bot_input_ids = torch.cat([chat_history_ids, new_input_ids], dim=-1) if chat_history_ids is not None else new_input_ids

    # Generate response given maximum chat length history of 1250 tokens
    chat_history_ids = model.generate(bot_input_ids, max_length=1250, pad_token_id=tokenizer.eos_token_id)

    # Return the chat history ids
    return chat_history_ids

# Function to check for suicidal intent using the ELECTRA model
def check_intent(text):
    tokenized_text = suicide_tokenizer.encode_plus(text, return_tensors="pt")
    logits = suicide_model(**tokenized_text)[0]
    prediction = round(torch.softmax(logits, dim=1).tolist()[0][1])
    return prediction

# Start a chat with the chatbot
def start_chatbot(n=1000):
    global chatbot_tokenizer, chatbot_model, chat_history_ids

    # Initial message
    print("==== Hello! I am Alex and I am your virtual friend. If you need a listening ear, I'm always here. To end the chat, input 'exit' in the chatbox. ====")

    # Chat for n rounds
    try:
        for chat_round in range(n):
            user_input = input(">> You: ")

            if user_input.lower() == "exit":
                print("*Alex:* See ya")
                break

            # Check for suicidal intent
            intent_prediction = check_intent(user_input)

            if intent_prediction == 1:
                print("*Alex:* " + random.choice(prevention_messages))
                print("*Alex:* " + helpline_message)
            else:
                chat_history_ids = generate_response(chatbot_tokenizer, chatbot_model, user_input, chat_history_ids)
                response = chatbot_tokenizer.decode(chat_history_ids[:, -1], skip_special_tokens=True)
                print("*Alex:* " + response)

    except Exception as e:
        print("*Alex:* See ya")

# Start the chatbot
start_chatbot()
