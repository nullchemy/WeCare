from transformers import AutoModelForCausalLM, AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer

def load_suicide_tokenizer_and_model(tokenizer="google/electra-base-discriminator", model="Models/electra"):
  global suicide_tokenizer, suicide_model
  suicide_tokenizer = AutoTokenizer.from_pretrained(tokenizer)
  suicide_tokenizer.padding_side = "left" 
  suicide_model = AutoModelForSequenceClassification.from_pretrained(model)
  return suicide_tokenizer, suicide_model