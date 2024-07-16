import json
import logging

import facebook_scraper as fs
from requests.cookies import RequestsCookieJar
import warnings
import pandas as pd

warnings.filterwarnings("ignore", category=UserWarning)



def scrape_facebook_comments(url):
    logging.getLogger('facebook_scraper').setLevel(logging.ERROR)

    # Alternatively, you can suppress all warnings globally
    import warnings
    warnings.filterwarnings("ignore")


    #Load cookies from a file
    with open("C:\\Users\\Lenovo\\PycharmProjects\\GP1\\www.facebook.com_cookies.json", "r") as f:
        cookies_list = json.load(f)

    #Convert list of dictionaries to RequestsCookieJar
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

    # Extract the comments part
    publisher_username=post['username']
    post_caption = post['post_text']
    comments = post['comments_full']
    comments =[comment['comment_text'] for comment in comments]
    comments = pd.DataFrame(comments, columns=['comments'])
    # Process comments as you want...
    return publisher_username, post_caption, comments


