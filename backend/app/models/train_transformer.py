from datasets import load_dataset, Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
import pandas as pd
import os
from app.config import settings

def train_transformer():
    df = pd.read_csv("synthetic_emotions.csv")
    labels = sorted(df.emotion.unique())
    label2id = {l:i for i,l in enumerate(labels)}
    df['label'] = df['emotion'].map(label2id)
    ds = Dataset.from_pandas(df[['text','label']])
    tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
    def preprocess(examples):
        return tokenizer(examples["text"], truncation=True, padding="max_length", max_length=128)
    ds = ds.map(preprocess, batched=True)
    ds = ds.train_test_split(test_size=0.1)
    model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=len(labels))
    args = TrainingArguments(
        output_dir="./transformer_out",
        per_device_train_batch_size=16,
        num_train_epochs=3,
        logging_steps=10,
        save_strategy="epoch"
    )
    trainer = Trainer(model=model, args=args, train_dataset=ds['train'], eval_dataset=ds['test'])
    trainer.train()
    model.save_pretrained(settings.TRANSFORMER_MODEL_PATH)
    tokenizer.save_pretrained(settings.TRANSFORMER_MODEL_PATH)
    print("Saved transformer model to", settings.TRANSFORMER_MODEL_PATH)

if __name__ == "__main__":
    train_transformer()
