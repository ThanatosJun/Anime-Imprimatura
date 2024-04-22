import cv2

# 讀取圖片
img = cv2.imread("C:\CNN\w.JPG")

# 將圖片轉換為灰階
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# 使用眼睛模型
eye_cascade = cv2.CascadeClassifier("C:\CNN\haarcascade_eye.xml")
eyes = eye_cascade.detectMultiScale(gray)

# 偵測眼睛並標記綠色方框
# 使用嘴巴模型
mouth_cascade = cv2.CascadeClassifier("C:\CNN\haarcascade_mcs_mouth.xml")
mouths = mouth_cascade.detectMultiScale(gray)

# 偵測嘴巴並標記紅色方框
for (x, y, w, h) in mouths:
    cv2.rectangle(img, (x, y), (x+w, y+h), (0, 0, 255), 2)

# 使用鼻子模型
nose_cascade = cv2.CascadeClassifier("C:\CNN\haarcascade_mcs_nose.xml")
noses = nose_cascade.detectMultiScale(gray)

# 偵測鼻子並標記藍色方框
for (x, y, w, h) in noses:
    cv2.rectangle(img, (x, y), (x+w, y+h), (255, 0, 0), 2)

# 顯示圖片
cv2.imshow('oxxostudio', img)

# 等待按鍵停止
cv2.waitKey(0)

# 關閉所有視窗
cv2.destroyAllWindows()