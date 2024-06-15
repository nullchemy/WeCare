from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

chat_round = 0
tokenizer = None
model = None
chat_history_ids = torch.tensor([])

def load_tokenizer_and_model(model="Models/DialoGPT"):
  global tokenizer
  tokenizer = AutoTokenizer.from_pretrained(model)
  tokenizer.padding_side = "left" 
  model = AutoModelForCausalLM.from_pretrained(model)
  return tokenizer, model

def generate_response(chat_round, user_input):
  global tokenizer, model, chat_history_ids
  print('Running generating response [DialoGPT-Large]')
  if tokenizer is None or model is None:
    tokenizer, model = load_tokenizer_and_model()
  new_input_ids = tokenizer.encode(user_input + tokenizer.eos_token, return_tensors='pt')
  bot_input_ids = torch.cat([chat_history_ids.long(), new_input_ids], dim=-1) if chat_round > 0 else new_input_ids.long()
  chat_history_ids = model.generate(bot_input_ids, max_length=1250, pad_token_id=tokenizer.eos_token_id)
  resp = format(tokenizer.decode(chat_history_ids[:, bot_input_ids.shape[-1]:][0], skip_special_tokens=True))
  print(resp)
  return resp, chat_history_ids


def chatb(input):
    global chat_round
    chat_round += 1
    resp, chat_history_ids = generate_response(chat_round, input)

chatb("how are you doing today?")