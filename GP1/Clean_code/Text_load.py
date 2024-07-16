import pickle
import sys
import json
import numpy as np
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from text_preprocessing import clean_text, process_text
model = pickle.load(open('C:/Users/Lenovo/PycharmProjects/GP1/model.pkl','rb'))
word2vec_model = pickle.load(open('C:/Users/Lenovo/PycharmProjects/GP1/word2vec_model.pkl', 'rb'))


def generate_document_embedding(tokens):
    embedding = []
    for token in tokens:
        if token in word2vec_model.wv:
            embedding.append(word2vec_model.wv[token])
    if embedding:
        return sum(embedding) / len(embedding)
    else:
        return np.zeros(word2vec_model.vector_size)


# TODO: Model Test


def predict_sentiment(text):
    try:
        cleaned_text = clean_text(text)
        processed_text = process_text(cleaned_text)
        tokens = word_tokenize(processed_text)
        doc_embedding = generate_document_embedding(tokens)
        prediction = model.predict_proba(doc_embedding.reshape(1, -1))
        return prediction[0]
    except Exception as e:
        print(f"An error occurred: {e}")
        return None




# TODO: Main script
if __name__ == "__main__":
     if len(sys.argv) > 1:
        input_sentence = sys.argv[1]
        sentiment = predict_sentiment(input_sentence)
        result = {"positive": round(float(sentiment[1]*100) , 2) , "negative" : round(float(sentiment[0]*100) , 2)}
        print(json.dumps(result))
     else:
        print(json.dumps({'error': 'No input provided'}))






