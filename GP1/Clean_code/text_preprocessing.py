import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import pyarabic.araby as araby

# nltk.download('stopwords')
# nltk.download('punkt')

arabicStopWords = list(set(stopwords.words('arabic')))
for word in ['أقل', 'ليست', 'ليس', 'لا', 'لكن', 'ولكن']:
    arabicStopWords.remove(word)

arabic_punctuations = '''`÷×؛’<>_()*&^%][ـ،/:"؟.,'{}~¦+|!”…“–ـ'''
english_punctuations = string.punctuation
punctuations_list = arabic_punctuations + english_punctuations

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
    text = re.sub("[إأآا]", "ا", text)
    text = re.sub("ى", "ي", text)
    text = re.sub("ؤ", "ء", text)
    text = re.sub("ئ", "ء", text)
    text = re.sub("ة", "ه", text)
    text = re.sub("گ", "ك", text)
    return text.strip()

def remove_diacritics(text):
    return araby.strip_diacritics(text)

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
    word_list = [stemmer.stem(w) for w in word_list]
    return ' '.join(word_list)
