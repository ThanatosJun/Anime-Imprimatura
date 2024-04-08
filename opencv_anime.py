import cv2
import os

def convert_to_jpg(image_path):
    # 讀取圖片
    img = cv2.imread(image_path)
    # 取得圖片名稱和擴展名
    image_name, ext = os.path.splitext(image_path)
    # 如果不是JPG格式，則進行轉換
    if ext.lower() != '.jpg':
        jpg_path = image_name + '.jpg'
        cv2.imwrite(jpg_path, img)
        return jpg_path
    else:
        return image_path

def face_detect(image_path, cascade_path):
    # 將圖片轉換為JPG格式
    img_path = convert_to_jpg(image_path)
    # 讀取圖片
    img = cv2.imread(img_path)
    # 將圖片轉換為灰度圖像
    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # 進行直方圖均衡化
    img_gray = cv2.equalizeHist(img_gray)
    # 載入臉部偵測器模型
    face_cascade = cv2.CascadeClassifier(cascade_path)
    # 進行臉部偵測
    faces = face_cascade.detectMultiScale(img_gray)
    # 在臉部周圍畫矩形框
    for (x, y, w, h) in faces:
        img = cv2.rectangle(img, (x, y), (x+w, y+h), (255, 0, 255), 5)
        cv2.putText(img, 'Face', (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 255), 2, cv2.LINE_AA)
    # 顯示結果
    cv2.imshow('Face detection', img)
    cv2.waitKey(0)

if __name__ == "__main__":
    # 圖片路徑
    image_path = r"C:\CNN\pic\pic40.png" # 圖片原始格式為PNG
    cascade_path = r"C:\CNN\lbpcascade_animeface.xml"  # 臉部偵測器模型路徑
    
    # 呼叫臉部偵測函式
    face_detect(image_path, cascade_path)