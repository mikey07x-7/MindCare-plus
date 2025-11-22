import random
import pandas as pd
import numpy as np

emotions = ["happy","sad","angry","anxious","neutral","stressed"]
texts_by_emotion = {
    "happy":["I had a great day","I feel good","Everything is fine"],
    "sad":["I feel down","I miss home","I cried today"],
    "angry":["I'm furious","They upset me","I can't take it"],
    "anxious":["I feel nervous","My heart races","I dread tomorrow"],
    "neutral":["I did my tasks","It was okay","Nothing special"],
    "stressed":["I have too much workload","I'm overwhelmed","I can't sleep"]
}

def generate(n=1000):
    rows = []
    for _ in range(n):
        e = random.choice(emotions)
        base = random.choice(texts_by_emotion[e])
        # add noise
        text = base + " " + " ".join(random.choices(["today","very","so","but","and","because"], k=random.randint(0,5)))
        rows.append({"text": text, "emotion": e})
    return pd.DataFrame(rows)

if __name__ == "__main__":
    df = generate(2000)
    df.to_csv("synthetic_emotions.csv", index=False)
    print("Saved synthetic_emotions.csv")
