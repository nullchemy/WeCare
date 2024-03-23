from .electra import electra
from .cnn import cnn
from .bert import bert

def check_intent(text, model):
  respnse = None
  if model == 'electra':
    respnse =  electra(text)
  elif model == 'bert':
    respnse = bert(text)
  elif model == 'cnn':
    respnse = cnn(text)
  else:
    respnse = electra(text)
  print(respnse)
  return respnse