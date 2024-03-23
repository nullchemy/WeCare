import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

tokenizer = Tokenizer()
vocab_size = len(tokenizer.word_index) + 1

embedding_dim = 200 
n_filters = 32
filter_sizes = [5, 6, 7, 8]
output_dim = 1
dropout_rate = 0.2
model = None

class CNN(nn.Module):
    def __init__(self, vocab_size, embedding_dim, 
                 n_filters, filter_sizes, output_dim,
                 dropout_rate, pre_trained=False, embedding_vectors=None):
        super().__init__()
        
        if pre_trained:
            self.embedding, num_embeddings, embedding_dim = create_emb_layer(embedding_vectors, True)
        else:
            # Create word embeddings from the input words
            self.embedding = nn.Embedding(vocab_size, embedding_dim)
        
        self.convs = nn.ModuleList([
            nn.Conv1d(in_channels=embedding_dim, 
                      out_channels=n_filters, 
                      kernel_size=fs)
            for fs in filter_sizes
        ])
        
        self.fc = nn.Linear(len(filter_sizes) * n_filters, output_dim)
        self.dropout = nn.Dropout(dropout_rate)
        
    def forward(self, text): 
        embedded = self.embedding(text)
        embedded = embedded.permute(0, 2, 1)
        conved = [F.relu(conv(embedded)) for conv in self.convs]
        pooled = [F.max_pool1d(conv, conv.shape[2]).squeeze(2) for conv in conved]
        cat = self.dropout(torch.cat(pooled, dim=1))
        return self.fc(cat)

# Define the function to load embedding layer with pretrained weights
def load_pretrained_embeddings(pretrained_embedding_matrix, non_trainable=True):
    num_embeddings, embedding_dim = pretrained_embedding_matrix.shape
    embedding = nn.Embedding(num_embeddings, embedding_dim)
    embedding.weight.data.copy_(torch.from_numpy(pretrained_embedding_matrix))
    if non_trainable:
        embedding.weight.requires_grad = False
    return embedding

def initialize_model(model_path):
    global model
    # Load the saved model
    model = CNN(vocab_size, embedding_dim, n_filters, filter_sizes, output_dim, dropout_rate)
    model_state_dict = torch.load(model_path, map_location=torch.device('cpu'))

    # Modify the embedding layer and convolutional layers to match the sizes in the saved model
    model.embedding = load_pretrained_embeddings(model_state_dict['embedding.weight'].numpy())
    for i in range(len(filter_sizes)):
        model.convs[i].weight.data.copy_(model_state_dict[f'convs.{i}.weight'])
        model.convs[i].bias.data.copy_(model_state_dict[f'convs.{i}.bias'])

    # Load the remaining parameters
    model.fc.weight.data.copy_(model_state_dict['fc.weight'])
    model.fc.bias.data.copy_(model_state_dict['fc.bias'])

    model.eval()  # Set the model to evaluation mode

if model is None:
    initialize_model('Models/cnn_model_3_saved_weights.pt')

def cnn(text):
    try:
        print(f'Running generating response => Check intent CNN model')
        # Tokenize and pad the input text
        tokenizer.fit_on_texts([text])
        tokens = tokenizer.texts_to_sequences([text])
        max_length = 100
        padded_sequence = pad_sequences(tokens, maxlen=max_length, padding='post')
        
        # Convert the padded sequence to a PyTorch tensor
        inputs = torch.LongTensor(padded_sequence)
        
        # Perform inference
        if model is None:
            initialize_model('Models/cnn_model_3_saved_weights.pt')
        with torch.no_grad():
            outputs = model(inputs)
            sigmd = torch.sigmoid(outputs)
            print(sigmd)
            predictions = torch.round(sigmd).squeeze().tolist()
        
        met_anal_val_one = 1 - sigmd.tolist()[0][0]

        
        # Return predictions
        return {'prediction': predictions, "actual_value": sigmd.tolist()[0][0], "meta_analysis": [met_anal_val_one, sigmd.tolist()[0][0]]}
    except Exception as e:
        return {'error': str(e)}