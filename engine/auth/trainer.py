import os
import cv2
import numpy as np
from PIL import Image

path = 'engine\\auth\\samples'
recognizer = cv2.face.LBPHFaceRecognizer_create()
detector = cv2.CascadeClassifier('engine\\auth\\haarcascade_frontalface_default.xml')

def Images_And_Labels(samples_path):
    image_paths = [os.path.join(samples_path, f) for f in os.listdir(samples_path)]
    face_samples, ids = [], []
    for image_path in image_paths:
        gray_img = Image.open(image_path).convert('L')
        image_array = np.array(gray_img, 'uint8')
        user_id = int(os.path.split(image_path)[-1].split('.')[1])
        for x, y, w, h in detector.detectMultiScale(image_array):
            face_samples.append(image_array[y:y+h, x:x+w])
            ids.append(user_id)
    return face_samples, ids

print("Training faces...")
faces, ids = Images_And_Labels(path)
if not faces:
    raise RuntimeError("No face samples found. Run sample.py first.")
recognizer.train(faces, np.array(ids))
recognizer.write('engine\\auth\\trainer\\trainer.yml')
print("Training complete.")
