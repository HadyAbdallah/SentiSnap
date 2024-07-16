import pandas as pd
import numpy as np
import facebook_scraper as fs
import logging
import instaloader
import pathlib
import json
import pickle
import warnings
import sys
from nltk.tokenize import word_tokenize


from text_preprocessing import clean_text, process_text
from instagram_scraper import *
from facebook_scraper import *


def preprocess_comments(comments_df):
    ## Instagram Comments Preprocessing
    # Create a copy of the DataFrame to avoid the SettingWithCopyWarning
    comments_dff = comments_df.copy()

    # Apply text cleaning
    comments_dff.loc[:, 'cleaned_comments'] = comments_dff['comments'].apply(clean_text)

    # Apply text processing
    comments_dff.loc[:, 'processed_comments'] = comments_dff['cleaned_comments'].apply(process_text)

    # Tokenize the processed comments
    comments_dff.loc[:, 'tokens'] = comments_dff['processed_comments'].apply(word_tokenize)

    return comments_dff


def generate_document_embedding(tokens):
    with open('C:\\Users\\Lenovo\\PycharmProjects\\GP1\\word2vec_model.pkl', 'rb') as f:
        word2vec_model = pickle.load(f)
    embedding = []
    for token in tokens:
        if token in word2vec_model.wv:
            embedding.append(word2vec_model.wv[token])
    if embedding:
        return sum(embedding) / len(embedding)
    else:
        return np.zeros(word2vec_model.vector_size)


def model_test(model, preprocessed_df):
    testem=preprocessed_df['tokens'].apply(generate_document_embedding)

    y_pred = model.predict(np.vstack(testem.values))

    for i in range(len(preprocessed_df)):
        if not preprocessed_df['processed_comments'][i]:
            y_pred[i]="None"

    preprocessed_df['sentiment_class'] = y_pred

    posPerc = (np.sum(y_pred == "Positive")/len(y_pred))*100
    negPerc = (np.sum(y_pred == "Negative")/len(y_pred))*100
    nonePerc = (np.sum(y_pred == "None")/len(y_pred))*100

    return posPerc, negPerc, nonePerc, y_pred




def classify_comments(comments, y_pred, preprocessed_df):
    all_comments_with_predictions = []
    positive_comments = []
    negative_comments = []

    for i in range(len(comments)):

        if not preprocessed_df['processed_comments'][i]:
            y_pred[i] = "None"
        all_comments_with_predictions.append((comments['comments'][i], y_pred[i]))
        if y_pred[i] == "Positive":
            positive_comments.append(comments['comments'][i])
        elif y_pred[i] == "Negative":
            negative_comments.append(comments['comments'][i])

    return all_comments_with_predictions, positive_comments, negative_comments


def main(url):
    if "instagram.com" in url:
        L = login_to_instagram()
        if L:
            publisher_username, post_df, post_caption = scrape_instagram_comments(L, url)
            comments_df = post_df[['comment_text']]
            comments_df.columns = ['comments']
        else:
            print("Failed to login to Instagram.")
            return None
    elif "facebook.com" in url:
        publisher_username, post_caption, comments_df = scrape_facebook_comments(url)
    else:
        return "Invalid URL"

    preprocessed_df = preprocess_comments(comments_df)
    with open('C:/Users/Lenovo/PycharmProjects/GP1/model.pkl', 'rb') as file:
        model = pickle.load(file)
    posPerc, negPerc, nonePerc, y_pred = model_test(model, preprocessed_df)
    all_comments_with_predictions, positive_comments, negative_comments = classify_comments(comments_df, y_pred,preprocessed_df)

    result = {
        "publisher_username": publisher_username,
        "post_caption": post_caption,
        "Positive comments": posPerc,
        "Negative comments": negPerc,
        "None comments": nonePerc,
        "array_positive_comments": positive_comments,
        "array_negative_comments": negative_comments,
        "all_comments_with_predictions": all_comments_with_predictions
        # "Most Frequent words": keywords
    }
    return result

# In[41]:


if __name__ == "__main__":
    # if len(sys.argv) > 1:
    #     url = sys.argv[1]
    #     result = main(url)
    #     print(json.dumps(result))
    # else:
    #     print(json.dumps({'error': 'No input provided'}))



    url = input().strip()
    result = main(url)
    print(json.dumps(result, ensure_ascii=False))
    # print(result)
