from transformers import AutoModelForCausalLM, AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
import torch

suicide_tokenizer = None
suicide_model = None

def load_suicide_tokenizer_and_model_bert(tokenizer="Models/bert", model="Models/bert"):
  global suicide_tokenizer, suicide_model
  suicide_tokenizer = AutoTokenizer.from_pretrained(tokenizer)
  suicide_tokenizer.padding_side = "left" 
  suicide_model = AutoModelForSequenceClassification.from_pretrained(model)
  return suicide_tokenizer, suicide_model

def bert(text):
    global suicide_tokenizer, suicide_model
    print(f'Running generating response => Check intent BERT model')
    if suicide_tokenizer is None or suicide_model is None:
        suicide_tokenizer, suicide_model = load_suicide_tokenizer_and_model_bert()
    tokenised_text = suicide_tokenizer.encode_plus(text, return_tensors="pt")
    logits = suicide_model(**tokenised_text)[0]
    prediction = torch.softmax(logits, dim=1).tolist()[0]
    return {"prediction": round(prediction[1]), "actual_value": prediction[1], "meta_analysis": prediction}