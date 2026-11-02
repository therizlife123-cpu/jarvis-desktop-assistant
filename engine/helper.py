import os
import re
import time
import markdown2
from bs4 import BeautifulSoup

def extract_yt_term(command):
    pattern = r'play\s+(.*?)\s+on\s+youtube'
    match = re.search(pattern, command, re.IGNORECASE)
    return match.group(1) if match else None

def remove_words(input_string, words_to_remove):
    return ' '.join(word for word in input_string.split() if word.lower() not in words_to_remove)

def keyEvent(key_code):
    os.system(f'adb shell input keyevent {key_code}')
    time.sleep(1)

def tapEvents(x, y):
    os.system(f'adb shell input tap {x} {y}')
    time.sleep(1)

def adbInput(message):
    os.system(f'adb shell input text "{message}"')
    time.sleep(1)

def goback(key_code):
    for _ in range(6):
        keyEvent(key_code)

def replace_spaces_with_percent_s(input_string):
    return input_string.replace(' ', '%s')

def markdown_to_text(md):
    html = markdown2.markdown(md)
    return BeautifulSoup(html, "html.parser").get_text().strip()
