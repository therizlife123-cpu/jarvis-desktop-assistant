import json
import os
from shlex import quote
import sqlite3
import struct
import subprocess
import time
import webbrowser
from playsound import playsound
import eel
import pyaudio
import pyautogui
from engine.command import speak, takecommand
from engine.config import ASSISTANT_NAME
import pywhatkit as kit
import pvporcupine
from engine.helper import extract_yt_term, markdown_to_text, remove_words
import google.generativeai as genai

con = sqlite3.connect("jarvis.db")
cursor = con.cursor()

@eel.expose
def playAssistantSound():
    playsound("www\\assets\\audio\\start_sound.mp3")

def openCommand(query):
    query = query.replace(ASSISTANT_NAME, "").replace("open", "").strip().lower()
    sites = {"youtube":"https://www.youtube.com", "google":"https://www.google.com",
             "instagram":"https://www.instagram.com"}
    for site, url in sites.items():
        if site in query:
            speak("Opening " + site.title()); webbrowser.open(url); return
    if "whatsapp" in query:
        speak("Opening WhatsApp")
        os.system("start shell:AppsFolder\\5319275A.WhatsAppDesktop_cv1g1gvanyjgm!App")
        return
    if "send message to" in query:
        speak("To whom?"); name = takecommand().lower()
        speak("What should I send?"); message = takecommand().lower()
        send_whatsapp_message(name, message); return
    if query:
        try:
            cursor.execute('SELECT path FROM sys_command WHERE name IN (?)', (query,))
            results = cursor.fetchall()
            if results:
                speak("Opening " + query); os.startfile(results[0][0])
            else:
                cursor.execute('SELECT url FROM web_command WHERE name IN (?)', (query,))
                results = cursor.fetchall()
                if results:
                    speak("Opening " + query); webbrowser.open(results[0][0])
                else:
                    speak("Opening " + query); os.system('start ' + query)
        except Exception as e:
            print("ERROR:", e); speak("something went wrong")

def PlayYoutube(query):
    search_term = query.replace("play", "").replace("on youtube", "").strip()
    speak("Playing " + search_term); kit.playonyt(search_term)

def send_whatsapp_message(name, message):
    contacts = {key: os.getenv("JARVIS_CONTACT_" + key.upper(), "")
                for key in ("rahul", "tarun", "rihan")}
    phone_number = contacts.get(name)
    if not phone_number:
        speak("Contact not configured"); return
    speak("Sending message to " + name)
    webbrowser.open(f"https://web.whatsapp.com/send?phone={phone_number}&text={message}")
    time.sleep(10); pyautogui.press("enter"); speak("Message sent")

def hotword():
    porcupine = paud = audio_stream = None
    try:
        porcupine = pvporcupine.create(keywords=["jarvis", "alexa"])
        paud = pyaudio.PyAudio()
        audio_stream = paud.open(rate=porcupine.sample_rate, channels=1,
            format=pyaudio.paInt16, input=True, frames_per_buffer=porcupine.frame_length)
        while True:
            keyword = struct.unpack_from("h" * porcupine.frame_length,
                                         audio_stream.read(porcupine.frame_length))
            if porcupine.process(keyword) >= 0:
                import pyautogui as autogui
                autogui.keyDown("win"); autogui.press("j"); time.sleep(2); autogui.keyUp("win")
    except Exception as exc:
        print("Hotword listener stopped:", exc)
    finally:
        if porcupine is not None: porcupine.delete()
        if audio_stream is not None: audio_stream.close()
        if paud is not None: paud.terminate()

def findContact(query):
    words_to_remove = [ASSISTANT_NAME, 'make', 'a', 'to', 'phone', 'call',
                        'send', 'message', 'wahtsapp', 'video']
    query = remove_words(query, words_to_remove).strip().lower()
    try:
        cursor.execute("SELECT mobile_no FROM contacts WHERE LOWER(name) LIKE ? OR LOWER(name) LIKE ?",
                       ('%' + query + '%', query + '%'))
        results = cursor.fetchall()
        mobile_number = str(results[0][0])
        if not mobile_number.startswith('+91'): mobile_number = '+91' + mobile_number
        return mobile_number, query
    except Exception:
        speak('not exist in contacts'); return 0, 0

def whatsApp(mobile_no, message, flag, name):
    if flag == 'message':
        target_tab = 12; jarvis_message = "message send successfully to " + name
    elif flag == 'call':
        target_tab = 7; message = ''; jarvis_message = "calling to " + name
    else:
        target_tab = 6; message = ''; jarvis_message = "starting video call with " + name
    encoded_message = quote(message)
    whatsapp_url = f"whatsapp://send?phone={mobile_no}&text={encoded_message}"
    subprocess.run(f'start "" "{whatsapp_url}"', shell=True)
    time.sleep(5); subprocess.run(f'start "" "{whatsapp_url}"', shell=True)
    pyautogui.hotkey('ctrl', 'f')
    for _ in range(1, target_tab): pyautogui.hotkey('tab')
    pyautogui.hotkey('enter'); speak(jarvis_message)

def chatBot(query):
    speak("Chat feature is disabled")
    return "Chat disabled"

def makeCall(name, mobileNo):
    mobileNo = mobileNo.replace(" ", "")
    speak("Calling " + name)
    os.system('adb shell am start -a android.intent.action.CALL -d tel:' + mobileNo)

def sendMessage(message, mobileNo, name):
    from engine.helper import replace_spaces_with_percent_s, goback, keyEvent, tapEvents, adbInput
    message = replace_spaces_with_percent_s(message)
    mobileNo = replace_spaces_with_percent_s(mobileNo)
    speak("sending message"); goback(4); time.sleep(1); keyEvent(3)
    tapEvents(136, 2220); tapEvents(819, 2192); adbInput(mobileNo)
    tapEvents(601, 574); tapEvents(390, 2270); adbInput(message); tapEvents(957, 1397)
    speak("message send successfully to " + name)

def geminai(query):
    try:
        query = query.replace(ASSISTANT_NAME, "").replace("search", "")
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            speak("Gemini API key is not configured. Set GEMINI_API_KEY first."); return
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(query)
        speak(markdown_to_text(response.text))
    except Exception as e:
        print("Error:", e)

@eel.expose
def assistantName():
    return ASSISTANT_NAME

@eel.expose
def personalInfo():
    try:
        cursor.execute("SELECT * FROM info"); results = cursor.fetchall()
        eel.getData(json.dumps(results[0])); return 1
    except Exception: print("no data")

@eel.expose
def updatePersonalInfo(name, designation, mobileno, email, city):
    cursor.execute("SELECT COUNT(*) FROM info"); count = cursor.fetchone()[0]
    if count > 0:
        cursor.execute('''UPDATE info SET name=?, designation=?, mobileno=?, email=?, city=?''',
                       (name, designation, mobileno, email, city))
    else:
        cursor.execute('''INSERT INTO info (name, designation, mobileno, email, city) VALUES (?, ?, ?, ?, ?)''',
                       (name, designation, mobileno, email, city))
    con.commit(); personalInfo(); return 1

@eel.expose
def displaySysCommand():
    cursor.execute("SELECT * FROM sys_command"); results = cursor.fetchall()
    eel.displaySysCommand(json.dumps(results)); return 1

@eel.expose
def deleteSysCommand(id):
    cursor.execute("DELETE FROM sys_command WHERE id = ?", (id,)); con.commit()

@eel.expose
def addSysCommand(key, value):
    cursor.execute('''INSERT INTO sys_command VALUES (?, ?, ?)''', (None, key, value)); con.commit()

@eel.expose
def displayWebCommand():
    cursor.execute("SELECT * FROM web_command"); results = cursor.fetchall()
    eel.displayWebCommand(json.dumps(results)); return 1

@eel.expose
def addWebCommand(key, value):
    cursor.execute('''INSERT INTO web_command VALUES (?, ?, ?)''', (None, key, value)); con.commit()

@eel.expose
def deleteWebCommand(id):
    cursor.execute("DELETE FROM web_command WHERE Id = ?", (id,)); con.commit()

@eel.expose
def displayPhoneBookCommand():
    cursor.execute("SELECT * FROM contacts"); results = cursor.fetchall()
    eel.displayPhoneBookCommand(json.dumps(results)); return 1

@eel.expose
def deletePhoneBookCommand(id):
    cursor.execute("DELETE FROM contacts WHERE Id = ?", (id,)); con.commit()

@eel.expose
def InsertContacts(Name, MobileNo, Email, City):
    cursor.execute('''INSERT INTO contacts VALUES (?, ?, ?, ?, ?)''',
                   (None, Name, MobileNo, Email, City)); con.commit()
