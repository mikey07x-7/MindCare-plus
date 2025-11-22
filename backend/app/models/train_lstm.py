import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import pandas as pd
from collections import Counter
import re
import os
from app.config import settings   # ← FIXED IMPORT

# Simple tokenizer
def tokenize(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]','',text)
    return text.split()

class Vocab:
    def __init__(self, min_freq=1):
        self.min_freq = min_freq
        self.stoi = {"<pad>":0, "<unk>":1}
        self.itos = ["<pad>","<unk>"]
    def build(self, texts):
        cnt = Counter()
        for t in texts:
            cnt.update(tokenize(t))
        for word, freq in cnt.items():
            if freq >= self.min_freq:
                self.stoi[word] = len(self.itos)
                self.itos.append(word)
    def encode(self, text, max_len=50):
        toks = tokenize(text)[:max_len]
        ids = [self.stoi.get(t,1) for t in toks]
        ids += [0]*(max_len - len(ids))
        return ids

class TextDataset(Dataset):
    def __init__(self, df, vocab, label_map):
        self.texts = df['text'].tolist()
        self.labels = [label_map[l] for l in df['emotion']]
        self.vocab = vocab
    def __len__(self): return len(self.texts)
    def __getitem__(self, i):
        x = torch.tensor(self.vocab.encode(self.texts[i]), dtype=torch.long)
        y = torch.tensor(self.labels[i], dtype=torch.long)
        return x, y

class LSTMModel(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_classes):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, batch_first=True)
        self.fc = nn.Linear(hidden_dim, num_classes)
    def forward(self, x):
        emb = self.embedding(x)
        _, (hn, _) = self.lstm(emb)
        logits = self.fc(hn[-1])
        return logits

def train():
    df = pd.read_csv("synthetic_emotions.csv")
    label_map = {l:i for i,l in enumerate(sorted(df.emotion.unique()))}
    vocab = Vocab()
    vocab.build(df.text.tolist())
    ds = TextDataset(df, vocab, label_map)
    dl = DataLoader(ds, batch_size=32, shuffle=True)
    model = LSTMModel(len(vocab.itos), embed_dim=64, hidden_dim=128, num_classes=len(label_map))
    opt = torch.optim.Adam(model.parameters(), lr=1e-3)
    loss_fn = nn.CrossEntropyLoss()
    for epoch in range(6):
        for xb,yb in dl:
            logits = model(xb)
            loss = loss_fn(logits, yb)
            opt.zero_grad(); loss.backward(); opt.step()
        print(f"Epoch {epoch} loss {loss.item():.4f}")
    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    torch.save({"model_state": model.state_dict(), "vocab": vocab.stoi, "label_map": label_map}, settings.LSTM_MODEL_PATH)
    print("Saved LSTM model to", settings.LSTM_MODEL_PATH)

if __name__ == "__main__":
    train()
