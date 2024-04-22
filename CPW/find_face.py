import cv2

def detect_faces(image_path, cascade_path):
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    face_cascade = cv2.CascadeClassifier(cascade_path)
    faces = face_cascade.detectMultiScale(gray)

    for (x, y, w, h) in faces:
        cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)

    cv2.imshow('Face Detection', img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

# 提示用戶輸入圖片路徑
image_path = r"C:\CNN\pic\IVE.webp"

# 指定模型文件的完整路徑
cascade_path = r"C:\CNN\find_face_model.xml"  

detect_faces(image_path, cascade_path)
