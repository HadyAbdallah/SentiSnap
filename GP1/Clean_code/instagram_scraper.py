import logging
import instaloader
import pathlib
import json
import pickle
import warnings
import sys
import re, string
import pandas as pd

from glob import glob
from os.path import expanduser
from sqlite3 import connect
from instaloader.exceptions import ConnectionException
from instaloader import Instaloader, LoginRequiredException
warnings.filterwarnings("ignore", category=UserWarning)


# ### **Instagram Scraper**
#Function to read the username and the password
def read_credentials(file_path):
    with open(file_path, 'r') as file:
        lines = file.readlines()
        username = lines[0].strip()
        password = lines[1].strip()
    return username, password


# In[40]:


def get_shortcode(url):
    # Extract SHORTCODE from the Instagram post URL
    SHORTCODE = re.search(r'/p/([A-Za-z0-9_-]+)/|/reel/([A-Za-z0-9_-]+)/|/tv/([A-Za-z0-9_-]+)/', url)
    if SHORTCODE:
        return SHORTCODE.group(1) or SHORTCODE.group(2)

    print(SHORTCODE)
    return None


# In[25]:


def url_check(url):
    if url.startswith("https://www.instagram.com/"):
        return get_shortcode(url)
    else:
        print("Invalid Instagram post URL. Please enter a valid URL.")
        return None


# In[26]:


def login_to_instagram():
    L = instaloader.Instaloader()

    credentials_file = 'C:\\Users\\Lenovo\\PycharmProjects\\GP1\\credentials.txt'
    username, password = read_credentials(credentials_file)

    # Load session from file if exists
    try:
        L.load_session_from_file(username)
    except FileNotFoundError:
        # If session file not found, login and save session
        try:
            L.login(username, password)
            L.save_session_to_file()
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

def scrape_instagram_comments(L, url):

    SHORTCODE = url_check(url)
    if SHORTCODE:
        post = instaloader.Post.from_shortcode(L.context, SHORTCODE)
        comments_data = []
        post_caption = post.caption
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
        return post.owner_username, df, post_caption
    else:
        return None, pd.DataFrame(), None