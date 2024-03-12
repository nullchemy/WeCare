from transformers import AutoModelForCausalLM, AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
import torch
from ..sockets import socketio
from IPython.display import Markdown, display

suicide_tokenizer = None
suicide_model = None

def load_suicide_tokenizer_and_model(tokenizer="google/electra-base-discriminator", model="Models/electra"):
  global suicide_tokenizer, suicide_model
  suicide_tokenizer = AutoTokenizer.from_pretrained(tokenizer)
  suicide_tokenizer.padding_side = "left" 
  suicide_model = AutoModelForSequenceClassification.from_pretrained(model)
  return suicide_tokenizer, suicide_model

def check_intent(text):
  global suicide_tokenizer, suicide_model
  print('Running generating response => Check intent')
  if suicide_tokenizer is None or suicide_model is None:
        socketio.emit('info', {'response': Markdown('Loading Suicide model...').data})
        suicide_tokenizer, suicide_model = load_suicide_tokenizer_and_model()
  tokenised_text = suicide_tokenizer.encode_plus(text, return_tensors="pt")
  logits = suicide_model(**tokenised_text)[0]
  prediction = round(torch.softmax(logits, dim=1).tolist()[0][1])
  return prediction

def initialize_model():
    global suicide_tokenizer, suicide_model
    if suicide_tokenizer is None or suicide_model is None:
        socketio.emit('info', {'response': Markdown('Loading Suicide model...').data})
        suicide_tokenizer, suicide_model = load_suicide_tokenizer_and_model()
    socketio.emit('info', {'response': 'online'})
    return True

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