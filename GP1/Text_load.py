import pickle
import sys
import json
import re , string
import nltk
import numpy as np
from pyarabic import araby

#nltk.download('stopwords')
#nltk.download('punkt')
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# word2vec_model = pickle.load(open('word2vec_model.pkl', 'rb'))
model = pickle.load(open('C:/Users/Lenovo/PycharmProjects/GP1/model.pkl','rb'))
#model = pickle.load(open('model.pkl','rb'))
word2vec_model = pickle.load(open('C:/Users/Lenovo/PycharmProjects/GP1/word2vec_model.pkl', 'rb'))


# TODO: Text Preprocessing


arabicStopWords= list(set(stopwords.words('arabic')))

for word in ['أقل','ليست','ليس','لا','لكن','ولكن']:
    arabicStopWords.remove(word)

arabic_punctuations = '''`÷×؛’<>_()*&^%][ـ،/:"؟.,'{}~¦+|!”…“–ـ'''
english_punctuations = string.punctuation
punctuations_list = arabic_punctuations + english_punctuations



# Remove Tashkeel
def remove_diacritics(text):
  return araby.strip_diacritics(text)




def remove_emoji_links_mentions_hashtags(text):
    # Remove emojis
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
    # Remove links
    text = re.sub(r'http\S+', '', text)
    # Remove mentions
    text = re.sub(r'@[^\s@]+', '', text)
    # Remove hashtags
    text = re.sub(r'#[^\s#]+', '', text)
    #Remove duplicate letters
    text = re.sub(r'(\w)\1{2,}', r'\1', text)
    #Remove English letters
    text = re.sub(r'[a-zA-Z]', '', text)
    #Remove English words
    text = re.sub(r'\b[a-zA-Z]+\b', '', text)
    #Remove consecutive duplicate words
    text = re.sub(r'\b(\w+)(?:\s+\1\b)+', r'\1', text)
    #Remove longation
    text = re.sub("[إأآا]", "ا", text)
    text = re.sub("ى", "ي", text)
    text = re.sub("ؤ", "ء", text)
    text = re.sub("ئ", "ء", text)
    text = re.sub("ة", "ه", text)
    text = re.sub("گ", "ك", text)
    return text.strip()



def clean_text(text):
    text = remove_emoji_links_mentions_hashtags(text)
    text = remove_diacritics(text)
    text = "".join([word for word in text if word not in punctuations_list])
    tokens = word_tokenize(text)
    text = ' '.join([word for word in tokens if word not in arabicStopWords and word.isalpha()])
    return text



def process_text(text):
    stemmer = nltk.ISRIStemmer()
    word_list = nltk.word_tokenize(text)
    #stemming
    word_list = [stemmer.stem(w) for w in  word_list]
    return ' '.join(word_list)



def generate_document_embedding(tokens):
    # with open('word2vec_model.pkl', 'rb') as f:
    #     word2vec_model = pickle.load(f)
    # word2vec_model = pickle.load(open('word2vec_model.pkl', 'rb'))
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
    # with open('model.pkl', 'rb') as file:
    #     model = pickle.load(file)
    # model = pickle.load(open('model.pkl', 'rb'))
    try:
        cleaned_text = clean_text(text)
        #print(f"Cleaned text: {cleaned_text}")

        processed_text = process_text(cleaned_text)
        #print(f"Processed text: {processed_text}")

        tokens = word_tokenize(processed_text)
        #print(f"Tokens: {tokens}")

        doc_embedding = generate_document_embedding(tokens)
        #print(f"Document embedding: {doc_embedding}")

        prediction = model.predict_proba(doc_embedding.reshape(1, -1))
        #print(f"Prediction: {prediction[0]}")

        return prediction[0]
    except Exception as e:
        print(f"An error occurred: {e}")
        return None




# TODO: Main script
if __name__ == "__main__":
     if len(sys.argv) > 1:
        input_sentence = sys.argv[1]
        sentiment = predict_sentiment(input_sentence)
        #sentiment = "Positive" if random.random() < 0.5 else "Negative"
        result = {"positive": round(float(sentiment[1]*100) , 2) , "negative" : round(float(sentiment[0]*100) , 2)}
        print(json.dumps(result))
     else:
        print(json.dumps({'error': 'No input provided'}))






