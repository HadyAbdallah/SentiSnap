import pandas as pd
import numpy as np
import re , string
#import tensorflow as tf
import pyarabic.araby as araby
import nltk
import seaborn as sns
import matplotlib.pyplot as plt
import pickle

nltk.download('stopwords')
nltk.download('punkt')
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import confusion_matrix,mean_squared_error,precision_score,recall_score,f1_score
from sklearn import metrics
from sklearn.neural_network import MLPClassifier
from sklearn.ensemble import RandomForestClassifier
from gensim.models import Word2Vec
# from tensorflow.keras.preprocessing.text import Tokenizer
# from tensorflow.keras.preprocessing.sequence import pad_sequences
# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import Embedding, SimpleRNN, LSTM, Dense, Dropout
from sklearn.preprocessing import LabelEncoder




df = pd.read_csv('ar_reviews_100k.tsv',sep='\t')
df = df[df['label']!='Mixed']
df



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



# Remove Tashkeel
def remove_diacritics(text):
  return araby.strip_diacritics(text)



remove_emoji_links_mentions_hashtags("حبيت المنتج @mohamed #حبي ❤️ https://www.google.com.eg/?hl=ar")



arabicStopWords= list(set(stopwords.words('arabic')))

for word in ['أقل','ليست','ليس','لا','لكن','ولكن']:
    arabicStopWords.remove(word)

arabic_punctuations = '''`÷×؛’<>_()*&^%][ـ،/:"؟.,'{}~¦+|!”…“–ـ'''
english_punctuations = string.punctuation
punctuations_list = arabic_punctuations + english_punctuations



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



df['cleanedtext']=df['text'].apply(clean_text)

df


df['cleanedtextnew']=df['cleanedtext'].apply(process_text)
df


test="ممتاز نوعا ما . النظافة والموقع والتجهيز"
test=clean_text(test)
test=process_text(test)
print(test)



def get_accuracy(name, trained_model , x_test, y_test):
    tree_predict = trained_model.predict(x_test)
    print("Testing accuracy   :",metrics.accuracy_score(y_test, tree_predict)*100 , "%")
    print("precision : ",precision_score(y_test, tree_predict,average='micro'))
    print("recall    : ",recall_score(y_test, tree_predict,average='micro'))
    print("f1_score  : ",f1_score(y_test, tree_predict,average='micro'))


    cf1 = confusion_matrix(y_test,tree_predict)
    sns.heatmap(cf1,annot=True,fmt = '.0f')
    plt.xlabel('prediction')
    plt.ylabel('Actual')
    plt.title(name+ ' Confusion Matrix')
    plt.show()




# vectorizer=TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
# text_features=vectorizer.fit_transform(df["cleanedtextnew"])
# my_array=text_features.toarray()
# df2=pd.DataFrame(my_array,columns=vectorizer.get_feature_names_out())
# df2
df['tokens'] = df['cleanedtext'].apply(word_tokenize)

# train the model
word2vec_model = Word2Vec(sentences = df['tokens'], vector_size=100, window=5, min_count=2,sg=0)

# get word embeddings from word2vec
word_embeddings = word2vec_model.wv

document_embeddings = []
for tokens in df['tokens']:
    # Filter tokens that have embeddings
    tokens_with_embeddings = [token for token in tokens if token in word_embeddings]

    # Calculate the mean of embeddings for tokens with embeddings
    if tokens_with_embeddings:
        doc_embedding = np.mean([word_embeddings[token] for token in tokens_with_embeddings], axis=0)
    else:
        # If all tokens are missing embeddings, assign a zero vector
        doc_embedding = np.zeros_like(word_embeddings.vectors[0])

    # Append the document embedding to the list
    document_embeddings.append(doc_embedding)
len(document_embeddings)
with open('word2vec_model.pkl', 'wb') as f:
    pickle.dump(word2vec_model, f)




x,y=document_embeddings,df['label']
x=np.array(x)
y=np.array(y)
x_train,x_test,y_train,y_test=train_test_split(x,y,test_size=0.2,random_state=80)
print(len(x_train))
print(len(y_train))
print(len(x_test))
print(len(y_test))



# # TODO: 1. Logistic Regression Model
#
#
#
# clf=LogisticRegression()
# trmodel=clf.fit(x_train,y_train)
# y_pred=clf.predict(x_test)
# print(accuracy_score(y_test,y_pred))
# get_accuracy("LogisticRegression",trmodel,x_test,y_test)


# TODO: 2. ANN Model



ann1 = MLPClassifier()
trmodel=ann1.fit(x_train,y_train)
get_accuracy("ANN",trmodel,x_test,y_test)


# # TODO: 3. SVM Model
#
#
#
# svm = LinearSVC()
# trmodel=svm.fit(x_train,y_train)
# y_pred=svm.predict(x_test)
# print(accuracy_score(y_test,y_pred))
# get_accuracy("LogisticRegression",trmodel,x_test,y_test)
#
#
# # TODO: 4. MultiNominal NB
#
#
#
# nb_model = MultinomialNB()
# trmodel=nb_model.fit(x_train,y_train)
# get_accuracy("MultinomialNB",trmodel,x_test,y_test)
#
#
# # TODO: 5. Decision Tree Model
#
#
#
# dt_classifier = DecisionTreeClassifier()
# trmodel=dt_classifier.fit(x_train,y_train)
# get_accuracy("DecisionTreeClassifier",trmodel,x_test,y_test)
#
#
# # TODO: 6. KNN (K=3)
#
#
#
# knn = KNeighborsClassifier(n_neighbors=3)
# trmodel=knn.fit(x_train,y_train)
# get_accuracy("KNeighborsClassifier With k=3",trmodel,x_test,y_test)
#
#
# # TODO: 7. KNN (K=5)
#
#
#
# knn2 = KNeighborsClassifier(n_neighbors=5)
# trmodel=knn2.fit(x_train,y_train)
# get_accuracy("KNeighborsClassifier With k=3",trmodel,x_test,y_test)


# # TODO: 8. KNN (K=10)
#
#
#
# knn3 = KNeighborsClassifier(n_neighbors=10)
# trmodel=knn3.fit(x_train,y_train)
# get_accuracy("KNeighborsClassifier With k=10",trmodel,x_test,y_test)
#
#
# # TODO: 9. Random Forest
#
#
#
# model = RandomForestClassifier()
# trmodel=model.fit(x_train,y_train)
# get_accuracy("KNeighborsClassifier With k=10",trmodel,x_test,y_test)


# # TODO: 10. SimpleRNN
#
#
# X = df['cleanedtext']
# Y = df['label']
# # Label encoder (pos=>0 , Neg=>1)
# label_encoder = LabelEncoder()
#
# # Fit and transform the column containing strings
# Y = label_encoder.fit_transform(Y)
# X_train, X_test, y_train, y_test = train_test_split(X, Y, test_size=0.2, random_state=42)
#
#
# # Word Embedding
# tokenizer = Tokenizer()
# tokenizer.fit_on_texts(X)
#
# vocab_size = len(tokenizer.word_index) + 1
#
# X_train_sequences = tokenizer.texts_to_sequences(X_train)
# X_test_sequences = tokenizer.texts_to_sequences(X_test)
#
# maxlen = max([len(seq) for seq in X_train_sequences + X_test_sequences])
#
# X_train_pad = pad_sequences(X_train_sequences, maxlen=maxlen)
# X_test_pad = pad_sequences(X_test_sequences, maxlen=maxlen)
# def train_model(model_type, X_train, y_train, X_test, y_test):
#     model = Sequential()
#     model.add(Embedding(vocab_size, 128, input_length=maxlen))
#
#     if model_type == 'SimpleRNN':
#         model.add(SimpleRNN(128, return_sequences=False))
#     elif model_type == 'LSTM':
#         model.add(LSTM(128, return_sequences=False))
#
#     model.add(Dropout(0.5))
#
#     model.add(Dense(3, activation='softmax'))
#
#     model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
#
#     model.fit(X_train, y_train, epochs=10, batch_size=32, validation_data=(X_test, y_test))
#
#     return model
#
# simple_rnn_model = train_model('SimpleRNN', X_train_pad, y_train, X_test_pad, y_test)
#
# rnn_loss, rnn_accuracy = simple_rnn_model.evaluate(X_test_pad, y_test)
#
#
# print(f'RNN Model Accuracy: {rnn_accuracy}')
# print(f'RNN Model rnn_loss: {rnn_loss}')

with open('model.pkl', 'wb') as file:
    pickle.dump(trmodel, file) #ANN model