import cv2
import mediapipe as mp

mp_drawing = mp.solutions.drawing_utils         
mp_drawing_styles = mp.solutions.drawing_styles 
mp_holistic = mp.solutions.holistic             

# 從圖片文件中讀取圖像
image_path = r"C:\CNN\pic\pic5.jpg"
img = cv2.imread(image_path)

# mediapipe 啟用偵測全身
with mp_holistic.Holistic(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5) as holistic:

    img = cv2.resize(img, (520, 300))
    img2 = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)   
    results = holistic.process(img2)              

    mp_drawing.draw_landmarks(
        img,
        results.face_landmarks,
        mp_holistic.FACEMESH_CONTOURS,
        landmark_drawing_spec=None,
        connection_drawing_spec=mp_drawing_styles
        .get_default_face_mesh_contours_style())

    mp_drawing.draw_landmarks(
        img,
        results.pose_landmarks,
        mp_holistic.POSE_CONNECTIONS,
        landmark_drawing_spec=mp_drawing_styles
        .get_default_pose_landmarks_style())

    cv2.imshow('whole_body', img)
    cv2.waitKey(0)

cv2.destroyAllWindows()