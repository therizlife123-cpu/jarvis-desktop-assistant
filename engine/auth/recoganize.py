import cv2

def AuthenticateFace():
    flag = 0
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read('engine\\auth\\trainer\\trainer.yml')
    cascade = cv2.CascadeClassifier('engine\\auth\\haarcascade_frontalface_default.xml')
    names = ['', 'User']
    cam = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    cam.set(3, 640); cam.set(4, 480)
    min_w, min_h = 0.1 * cam.get(3), 0.1 * cam.get(4)
    while True:
        ret, img = cam.read()
        if not ret: break
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5,
                                         minSize=(int(min_w), int(min_h)))
        for x, y, w, h in faces:
            cv2.rectangle(img, (x,y), (x+w,y+h), (0,255,0), 2)
            user_id, accuracy = recognizer.predict(gray[y:y+h, x:x+w])
            if accuracy < 100 and user_id < len(names):
                label = names[user_id]; flag = 1
            else:
                label = 'unknown'; flag = 0
            cv2.putText(img, str(label), (x+5,y-5), cv2.FONT_HERSHEY_SIMPLEX, 1,
                        (255,255,255), 2)
        cv2.imshow('camera', img)
        if cv2.waitKey(10) & 0xff == 27 or flag == 1: break
    cam.release(); cv2.destroyAllWindows()
    return flag
