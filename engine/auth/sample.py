import cv2

cam = cv2.VideoCapture(0, cv2.CAP_DSHOW)
cam.set(3, 640); cam.set(4, 480)
detector = cv2.CascadeClassifier('engine\\auth\\haarcascade_frontalface_default.xml')
face_id = input("Enter a numeric user ID: ")
print("Taking samples; look at the camera.")
count = 0
while True:
    ret, img = cam.read()
    if not ret: break
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    for x, y, w, h in detector.detectMultiScale(gray, 1.3, 5):
        cv2.rectangle(img, (x,y), (x+w,y+h), (255,0,0), 2)
        count += 1
        cv2.imwrite(f"engine\\auth\\samples\\face.{face_id}.{count}.jpg",
                    gray[y:y+h, x:x+w])
        cv2.imshow('image', img)
    key = cv2.waitKey(100) & 0xff
    if key == 27 or count >= 100: break
print("Samples captured.")
cam.release(); cv2.destroyAllWindows()
