import sys

import pandas as pd
import numpy as np
import re
import string
import pyarabic.araby as araby
import nltk
import facebook_scraper as fs
import logging
import instaloader
import json
import pickle
import warnings

warnings.filterwarnings("ignore", category=UserWarning)
# nltk.download('stopwords')
# nltk.download('punkt')
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from requests.cookies import RequestsCookieJar
from glob import glob
from os.path import expanduser
from sqlite3 import connect
from instaloader.exceptions import ConnectionException
from instaloader import Instaloader, LoginRequiredException
# from textblob import TextBlob
from collections import Counter
from instaloader.exceptions import BadResponseException


# Text Preprocessing

arabicStopWords= list(set(stopwords.words('arabic')))

for word in ['أقل','ليست','ليس','لا','لكن','ولكن']:
    arabicStopWords.remove(word)

arabic_punctuations = '''`÷×؛’<>_()*&^%][ـ،/:"؟.,'{}~¦+|!”…“–ـ'''
english_punctuations = string.punctuation
punctuations_list = arabic_punctuations + english_punctuations


# Remove Tashkeel

def remove_diacritics(text):
  return araby.strip_diacritics(text)

def remove_for_posts_comments(text):
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
    # Remove mentions
    text = re.sub(r'@[^\s@]+', '', text)
    # Remove hashtags
    text = re.sub(r'#[^\s#]+', '', text)
    # Remove English letters
    text = re.sub(r'[a-zA-Z]', '', text)
    # Remove English words
    text = re.sub(r'\b[a-zA-Z]+\b', '', text)
    return text.strip()


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
    # Remove duplicate letters
    text = re.sub(r'(\w)\1{2,}', r'\1', text)
    # Remove English letters
    text = re.sub(r'[a-zA-Z]', '', text)
    # Remove English words
    text = re.sub(r'\b[a-zA-Z]+\b', '', text)
    # Remove consecutive duplicate words
    text = re.sub(r'\b(\w+)(?:\s+\1\b)+', r'\1', text)
    # Remove elongation
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
    # Stemming
    word_list = [stemmer.stem(w) for w in word_list]
    return ' '.join(word_list)


def preprocess_comments(comments_df):
    # Instagram Comments Preprocessing
    # Create a copy of the DataFrame to avoid the SettingWithCopyWarning
    comments_df = comments_df.copy()

    # Apply text cleaning
    comments_df.loc[:, 'cleaned_comments'] = comments_df['comments'].apply(clean_text)

    # Apply text processing
    comments_df.loc[:, 'processed_comments'] = comments_df['cleaned_comments'].apply(process_text)

    # Tokenize the processed comments
    comments_df.loc[:, 'tokens'] = comments_df['processed_comments'].apply(word_tokenize)

    return comments_df


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


# Model Test

def model_test(model, preprocessed_df):
    testem = preprocessed_df['tokens'].apply(generate_document_embedding)

    y_pred = model.predict(np.vstack(testem.values))

    for i in range(len(preprocessed_df)):
        if not preprocessed_df['processed_comments'][i]:
            y_pred[i]="None"

    preprocessed_df['sentiment_class'] = y_pred

    posPerc = (np.sum(y_pred == "Positive")/len(y_pred))*100
    negPerc = (np.sum(y_pred == "Negative")/len(y_pred))*100
    nonePerc = (np.sum(y_pred == "None")/len(y_pred))*100

    return posPerc, negPerc, nonePerc, y_pred


# Instagram Scraper

# Function to read the username and the password

def read_credentials(file_path):
    with open(file_path, 'r') as file:
        lines = file.readlines()
        username = lines[0].strip()
        password = lines[1].strip()
    return username, password


def get_shortcode(url):
    # Extract SHORTCODE from the Instagram post URL
    # SHORTCODE = url.split("/")[-2]
    # return SHORTCODE

    SHORTCODE = re.search(r'/p/([A-Za-z0-9_-]+)/|/reel/([A-Za-z0-9_-]+)/|/tv/([A-Za-z0-9_-]+)/', url)
    if SHORTCODE:
        return SHORTCODE.group(1) or SHORTCODE.group(2)

    print(SHORTCODE)
    return None


def url_check(url):
    if url.startswith("https://www.instagram.com/"):
        return get_shortcode(url)
    else:
        print("Invalid Instagram post URL. Please enter a valid URL.")
        return None


def login_to_instagram():
    L = instaloader.Instaloader()

    credentials_file = 'C:\\Users\\Lenovo\\PycharmProjects\\GP1\\credentials.txt'
    username, password = read_credentials(credentials_file)

    # Load session from file if exists
    try:
        L.load_session_from_file(username)
        # print(f"Loaded session from file for {username}.")
    except FileNotFoundError:
        # If session file not found, login and save session
        try:
            L.login(username, password)
            L.save_session_to_file()
            print(f"Logged in and saved session for {username}.")
        except LoginRequiredException:
            print("Login required. Check your username and password.")
            return None

    # Get the path of the Firefox cookies from your file browser
    # Make sure you signed in with your Instagram account on Firefox and saved your info
    path_to_firefox_cookies = "C:\\Users\\Lenovo\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\gmek3udq.default\\cookies.sqlite"
    expanded_path = expanduser(path_to_firefox_cookies)
    cookie_files = glob(expanded_path)

    if cookie_files:
        FIREFOXCOOKIEFILE = cookie_files[0]
        # print(f"Found Firefox cookie file: {FIREFOXCOOKIEFILE}")
        try:
            conn = connect(FIREFOXCOOKIEFILE)
            cursor = conn.cursor()
            cursor.execute("SELECT name, value FROM moz_cookies WHERE host='.instagram.com'")
            for cookie in cursor.fetchall():
                L.context._session.cookies.set(cookie[0], cookie[1])
            conn.close()
        except Exception as e:
            print(f"Error loading cookies: {e}")
            return None
    else:
        print("Firefox cookie file not found.")
        return None

    try:
        username = L.test_login()
        if not username:
            raise ConnectionError("Failed to retrieve username. Are you logged in successfully in Firefox?")
    except ConnectionException as e:
        print(f"Instaloader connection error: {e}")
        raise  # Re-raise the exception for higher-level handling
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise  # Re-raise the exception for higher-level handling

    return L


def show_most_frequent_words(posPerc, negPerc, nonePerc, preprocessed_df):
    # If the percentage of positive comments is higher than negative comments, extract the most common keywords
    # from positive comments
    if posPerc > negPerc:
        positive_comments = preprocessed_df[preprocessed_df['sentiment_class'] == 'Positive']['cleaned_comments']
        all_words = ' '.join(positive_comments).split()

        # Remove stopwords
        arabicStopWords= list(set(stopwords.words('arabic')))

        for word in ['أقل','ليست','ليس','لا','لكن','ولكن']:
            arabicStopWords.remove(word)
        filtered_words = [word for word in all_words if word.lower() not in arabicStopWords]

        # Get the most common keywords
        most_common_keywords = Counter(filtered_words).most_common()
        return most_common_keywords[:10]
    else:
        negative_comments = preprocessed_df[preprocessed_df['sentiment_class'] == 'Negative']['cleaned_comments']
        all_words = ' '.join(negative_comments).split()

        # Remove stopwords
        arabicStopWords= list(set(stopwords.words('arabic')))

        for word in ['أقل','ليست','ليس','لا','لكن','ولكن']:
            arabicStopWords.remove(word)
        filtered_words = [word for word in all_words if word.lower() not in arabicStopWords]

        # Get the most common keywords
        most_common_keywords = Counter(filtered_words).most_common()
        return most_common_keywords[:10]


def classify_comments(comments, y_pred, preprocessed_df):
    all_comments_with_predictions = []
    positive_comments = []
    negative_comments = []

    for i in range(len(comments)):

        cleaned_comment = remove_for_posts_comments(comments['comments'][i])
        if not preprocessed_df['processed_comments'][i]:
            y_pred[i] = "None"
        all_comments_with_predictions.append((cleaned_comment, y_pred[i]))
        if y_pred[i] == "Positive":
            positive_comments.append(cleaned_comment)
        elif y_pred[i] == "Negative":
            negative_comments.append(cleaned_comment)

    return all_comments_with_predictions, positive_comments, negative_comments


def scrape_instagram_comments(L, url):
    SHORTCODE = url_check(url)
    if SHORTCODE:
        try:
            post = instaloader.Post.from_shortcode(L.context, SHORTCODE)

            comments_data = []
            post_caption = post.caption if post.caption else ""
            post_caption = post_caption.replace('\n', '')
            for x in post.get_comments():
                post_info = {
                    "profile_username": post.owner_username,
                    "post_shortcode": post.shortcode,
                    "commenter_username": x.owner.username,
                    "comment_text": x.text if x.text else "",
                    "comment_likes": x.likes_count
                }
                comments_data.append(post_info)
            df = pd.DataFrame(comments_data)
            return post.owner_username, df, post_caption, None
        except BadResponseException:
            return None, pd.DataFrame(), None, "Unable to scrape the post. It may be private or inaccessible."
    else:
        return "Invalid post URL", pd.DataFrame(), None

# Facebook Scraper

def scrape_facebook_comments(url):
    logging.getLogger('facebook_scraper').setLevel(logging.ERROR)

    # Alternatively, you can suppress all warnings globally
    import warnings
    warnings.filterwarnings("ignore")

    # Load cookies from a file
    with open("C:\\Users\\Lenovo\\PycharmProjects\\GP1\\www.facebook.com_cookies.json", "r") as f:
        cookies_list = json.load(f)

    # Convert list of dictionaries to RequestsCookieJar
    cookies = RequestsCookieJar()
    for cookie in cookies_list:
        cookies.set(
            cookie['name'],
            cookie['value'],
            domain=cookie.get('domain'),
            path=cookie.get('path'),
            secure=cookie.get('secure'),
            rest={'HttpOnly': cookie.get('httpOnly'), 'SameSite': cookie.get('sameSite')}
        )

    # Specify the post ID
    # POST_ID = post_id
    try:
        facebook_url = url

        # Number of comments to download -- set this to True to download all comments
        MAX_COMMENTS = True
        # Get the post (this gives a generator)
        gen = fs.get_posts(
            post_urls=[facebook_url],
            options={"comments": MAX_COMMENTS, "progress": True},
            cookies=cookies
        )

        # Take 1st element of the generator which is the post we requested
        post = next(gen)
        # print(post)
        # print(post['username'])

        # Extract the comments part
        publisher_username = post['username']
        post_caption = post['post_text']
        post_caption = post_caption.replace('\n', '')
        # post_caption = "\n".join([line for line in post_caption.splitlines() if line.strip() != ""])
        # print(publisher_username)
        comments = post['comments_full']
        comments = [comment['comment_text'] for comment in comments]
        comments = pd.DataFrame(comments, columns=['comments'])
        return publisher_username, post_caption, comments
    except (StopIteration, KeyError):
        return "Unable to scrape the post. It may be private or inaccessible."


def main(url):
    if "instagram.com" in url:
        L = login_to_instagram()
        if L:
            publisher_username, post_df, post_caption, error_message = scrape_instagram_comments(L, url)
            if error_message is not None:
                return error_message
            else:
                # preprocess_comments(comments_df)
                comments_df = post_df[['comment_text']]
                comments_df.columns = ['comments']
                # print(comments_df)
                preprocessed_df = preprocess_comments(comments_df)
                with open('C:/Users/Lenovo/PycharmProjects/GP1/model.pkl', 'rb') as file:
                    model = pickle.load(file)
                posPerc, negPerc, nonePerc, y_pred = model_test(model, preprocessed_df)
                # keywords = show_most_frequent_words(posPerc, negPerc, nonePerc, preprocessed_df)
                all_comments_with_predictions, positive_comments, negative_comments = classify_comments(comments_df, y_pred, preprocessed_df)

                result = {
                    "publisher_username": publisher_username,
                    "post_caption": post_caption,
                    "Positive comments": posPerc,
                    "Negative comments": negPerc,
                    "None comments": nonePerc,
                    "array_positive_comments": positive_comments,
                    "array_negative_comments": negative_comments,
                    #"all_comments_with_predictions": all_comments_with_predictions
                    # "Most Frequent words": keywords
                }
                return result

        else:
            print("Failed to login to Instagram.")
            return None
    elif "facebook.com" in url:
        result = scrape_facebook_comments(url)
        if isinstance(result, str):
            # If the result is a string, it means there was an error or the post is private
            return result
        else:
            publisher_username, post_caption, comments_df = result
            preprocessed_df = preprocess_comments(comments_df)
            with open('C:/Users/Lenovo/PycharmProjects/GP1/model.pkl', 'rb') as file:
                model = pickle.load(file)
            posPerc, negPerc, nonePerc, y_pred = model_test(model, preprocessed_df)
            all_comments_with_predictions, positive_comments, negative_comments = classify_comments(comments_df, y_pred, preprocessed_df)

            result = {
                "publisher_username": publisher_username,
                "post_caption": post_caption,
                "Positive comments": posPerc,
                "Negative comments": negPerc,
                "None comments": nonePerc,
                "array_positive_comments": positive_comments,
                "array_negative_comments": negative_comments,
                #"all_comments_with_predictions": all_comments_with_predictions
            }
            return result
    else:
        return "Invalid URL"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
        result = main(url)
        print(json.dumps(result))
        #print(json.dumps(result, ensure_ascii=False,indent=4))

    else:
        print(json.dumps({'error': 'No input provided'}))


    # url = input().strip()
    # result = main(url)
    # print(json.dumps(result, ensure_ascii=False))
    # # print(result)
