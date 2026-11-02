# Jarvis — Personal Desktop Voice Assistant

Jarvis is a Windows-focused desktop voice assistant built with Python and Eel. It combines a Python automation backend with an HTML, CSS, and JavaScript interface.

## Features

- Voice input and text-command interaction
- Text-to-speech responses
- Gemini-powered conversational responses (requires your own API key)
- Face authentication using OpenCV
- Launch desktop applications and open websites
- Search and play videos on YouTube
- Optional WhatsApp and Android-device automation
- Configurable personal contacts and application shortcuts

> **Platform note:** This project uses Windows-specific features and Android Debug Bridge (ADB) for some device actions. Some features require a microphone, webcam, speakers, Microsoft Edge, and/or a connected Android device.

## Tech stack

Python 3.10, Eel, OpenCV, SpeechRecognition, PyAudio, pyttsx3, Google Generative AI SDK, HTML, CSS and JavaScript.

## Getting started

1. Install Windows 10/11 and Python 3.10.
2. Clone this repository and create a virtual environment:

```bash
git clone https://github.com/therizlife123-cpu/jarvis-desktop-assistant.git
cd jarvis-desktop-assistant
py -3.10 -m venv .venv
.venv\\Scripts\\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and add your own `GEMINI_API_KEY` and optional contact values. Never commit `.env` or API keys.
4. Create your own face samples and train your own model:

```bash
python engine/auth/sample.py
python engine/auth/trainer.py
```

5. Start the app with `python run.py`.

## Privacy and security

- No local IP address, API key, phone number, face sample, trained biometric model, local database or virtual environment is intentionally included in this public repository.
- Face samples and trained models are biometric data; keep them local.
- Use your own API key and contact details in an untracked `.env` file.
- Review automation commands before enabling actions that send messages or control devices.

## Known limitations

This project is Windows-oriented. Voice recognition needs an internet connection. Face authentication requires you to generate a local training model before first use. Android automation depends on local ADB and device configuration.

## License

No license was supplied with the source. Add a license before granting others permission to reuse, modify or distribute this code.