import sys
import json
import pandas as pd
import numpy as np
import re, string
import pyarabic.araby as araby
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.linear_model import LogisticRegression
from gensim.models import Word2Vec
from sklearn.model_selection import train_test_split

nltk.download('stopwords')
nltk.download('punkt')

# Load the dataset and preprocess it
df = pd.read_csv('D:\\ML\\ar_reviews_100k.tsv', sep='\t')
df = df[df['label'] != 'Mixed']

# Define preprocessing functions
def remove_emoji_links_mentions_hashtags(text):
    emoticon_pattern = r"[\U0001F600-\U0001F64F" \
                       r"\U0001F300-\U0001F5FF" \
                       r"\U0001F680-\U0001F6FF" \
                       r"\U0001F700-\U0001F77F" \
                       r"\U0001F780-\U0001F7FF" \
                       r"\U0001F800-\U0001F8FF" \
                       r"\U0001F900-\U0001F9FF" \
                       r"\U0001FA00-\U0001FA6F" \
                       r"\U0001FA70-\U0001FAFF" \
                       r"\U00002702-\U000027B0" \
                       r"\U000024C2-\U0001F251]+"
    text = re.sub(emoticon_pattern, '', text)
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'@[^\s@]+', '', text)
    text = re.sub(r'#[^\s#]+', '', text)
    text = re.sub(r'(\w)\1{2,}', r'\1', text)
    text = re.sub(r'[a-zA-Z]', '', text)
    text = re.sub(r'\b[a-zA-Z]+\b', '', text)
    text = re.sub(r'\b(\w+)(?:\s+\1\b)+', r'\1', text)
    return text.strip()

def remove_diacritics(text):
    return araby.strip_diacritics(text)

def clean_text(text):
    text = remove_emoji_links_mentions_hashtags(text)
    text = remove_diacritics(text)
    text = "".join([word for word in text if word not in punctuations_list])
    tokens = word_tokenize(text)
    text = ' '.join([word for word in tokens if word not in arabicStopWords])
    return text

def process_text(text):
    stemmer = nltk.ISRIStemmer()
    word_list = nltk.word_tokenize(text)
    word_list = [stemmer.stem(w) for w in word_list]
    return ' '.join(word_list)

def generate_document_embedding(tokens):
    embedding = [word2vec_model.wv[token] for token in tokens if token in word2vec_model.wv]
    if embedding:
        return np.mean(embedding, axis=0)
    else:
        return np.zeros(100)  # Return zero vector if no token has an embedding

# Preprocess the dataset
arabicStopWords = list(set(stopwords.words('arabic')))
for word in ['أقل', 'ليست', 'ليس', 'لا', 'لكن', 'ولكن']:
    arabicStopWords.remove(word)

arabic_punctuations = '''`÷×؛<>_()*&^%][ـ،/:"؟.,'{}~¦+|!”…“–ـ'''
english_punctuations = string.punctuation
punctuations_list = arabic_punctuations + english_punctuations

df['cleanedtext'] = df['text'].apply(clean_text)
df['cleanedtextnew'] = df['cleanedtext'].apply(process_text)
df['tokens'] = df['cleanedtextnew'].apply(word_tokenize)

# Train the Word2Vec model
word2vec_model = Word2Vec(sentences=df['tokens'], vector_size=100, window=5, min_count=2, sg=0)

# Generate document embeddings
document_embeddings = [generate_document_embedding(tokens) for tokens in df['tokens']]

# Train-test split
x, y = np.array(document_embeddings), np.array(df['label'])
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.3, random_state=100)

# Train the Logistic Regression model
clf = LogisticRegression()
clf.fit(x_train, y_train)

# Function to predict sentiment
def predict_sentiment(text):
    cleaned_text = clean_text(text)
    processed_text = process_text(cleaned_text)
    tokens = word_tokenize(processed_text)
    doc_embedding = generate_document_embedding(tokens)
    prediction = clf.predict(doc_embedding.reshape(1, -1))
    return prediction[0]

# Main script
if __name__ == "__main__":
    input_sentence = sys.argv[1]
    sentiment = predict_sentiment(input_sentence)
    result = {'sentiment': sentiment}
    print(json.dumps(result))
