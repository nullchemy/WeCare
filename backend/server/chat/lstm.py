import torch
import torch.nn as nn
from torch.nn import Sigmoid
from torch.nn.utils.rnn import pad_sequence
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

tokenizer = Tokenizer()
vocab_size = len(tokenizer.word_index) + 1

embedding_dim = 300
hidden_dim = 128
output_size = 1
n_layers = 2
dropout = 0.5

class SentimentLSTM(nn.Module):
    """
    The RNN model that will be used to perform Sentiment analysis.
    """

    def __init__(self, vocab_size, output_size, 
                 embedding_dim, hidden_dim, n_layers, 
                 dropout_rate, pre_trained=False, embedding_vectors=None):
        """
        Initialize the model by setting up the layers.
        """
        super().__init__()

        self.output_size = output_size
        self.n_layers = n_layers
        self.hidden_dim = hidden_dim
        
        if pre_trained:
            self.embedding, num_embeddings, embedding_dim = create_emb_layer(embedding_vectors, True)
        else:
            # Create word embeddings from the input words
            self.embedding = nn.Embedding(vocab_size, embedding_dim)

        self.lstm = nn.LSTM(embedding_dim, hidden_dim, n_layers, 
                            dropout=dropout_rate, batch_first=True)
        
        # dropout layer
        self.dropout = nn.Dropout(0.3) # dropout_rate
        
        # linear and sigmoid layers
        self.fc = nn.Linear(hidden_dim, output_size)
        self.sig = nn.Sigmoid()
        

    def forward(self, x, hidden):
        """
        Perform a forward pass of our model on some input and hidden state.
        """
        batch_size = x.size(0)

        # embeddings and lstm_out
        embeds = self.embedding(x)
        lstm_out, hidden = self.lstm(embeds, hidden)
    
        # stack up lstm outputs
        lstm_out = lstm_out.contiguous().view(-1, self.hidden_dim)
        
        # dropout and fully-connected layer
        out = self.dropout(lstm_out)
        out = self.fc(out)
        # sigmoid function
        sig_out = self.sig(out)
        
        # reshape to be batch_size first
        sig_out = sig_out.view(batch_size, -1)
        sig_out = sig_out[:, -1] # get last batch of labels

        # return last sigmoid output and hidden state
        return sig_out, hidden
    
    
    def init_hidden(self, batch_size):
        ''' Initializes hidden state '''
        # Create two new tensors with sizes n_layers x batch_size x hidden_dim,
        # initialized to zero, for hidden state and cell state of LSTM
        weight = next(self.parameters()).data
        
        hidden = (weight.new(self.n_layers, batch_size, self.hidden_dim).zero_(),
                  weight.new(self.n_layers, batch_size, self.hidden_dim).zero_())
        
        return hidden
        

# Load the trained model
model = SentimentLSTM(vocab_size, output_size, embedding_dim, hidden_dim, n_layers, dropout)
# model.load_state_dict(torch.load('Models/lstm_model_2_saved_weights.pt', map_location=torch.device('cpu')))
current_model_dict = model.state_dict()
loaded_state_dict = torch.load('Models/lstm_model_3_saved_weights.pt', map_location=torch.device('cpu'))
new_state_dict={k:v if v.size()==current_model_dict[k].size()  else  current_model_dict[k] for k,v in zip(current_model_dict.keys(), loaded_state_dict.values())}
model.load_state_dict(new_state_dict, strict=False)
model.eval()

# Define a function to preprocess the input text
def preprocess_text(text):
    # Tokenize the text
    tokenized_text = tokenizer.texts_to_sequences([text])
    # Pad sequences to the same length as in training
    max_length = 100
    padded_sequence = pad_sequences(tokenized_text, maxlen=max_length, padding='post')
    # Convert to tensor
    tensor = torch.LongTensor(padded_sequence)
    return tensor

# Define a function to get predictions
def predict(text):
    print(f'Running generating response => Check intent LSTM model')
    # Preprocess the text
    input_tensor = preprocess_text(text)
    # Get model predictions
    with torch.no_grad():
        model.eval()
        # Initialize hidden state
        hidden = model.init_hidden(input_tensor.size(0))
        # Forward pass
        output, _ = model(input_tensor, hidden)
        # Apply sigmoid to get probabilities
        sigmoid = Sigmoid()
        probabilities = sigmoid(output)
        # Round probabilities to get binary predictions
        predictions = torch.round(probabilities)
        met_anal_val_one = 1 - probabilities.tolist()[0]
    return {'prediction': predictions.item(), "actual_value": probabilities.tolist()[0], "meta_analysis": [met_anal_val_one, probabilities.tolist()[0]]}

print(predict("hello"))
