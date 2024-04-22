import cv2
import numpy as np

import mediapipe as mp
from mediapipe import solutions
from mediapipe.framework.formats import landmark_pb2

BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

# 手掌偵測設定
options = HandLandmarkerOptions(
    num_hands=2,
    base_options=BaseOptions(model_asset_path='C:/CNN/hand_landmarker.task'),
    running_mode=VisionRunningMode.IMAGE)

# 標記文字
MARGIN = 10  # 像素
FONT_SIZE = 1
FONT_THICKNESS = 1
HANDEDNESS_TEXT_COLOR = (88, 205, 54) # 鮮豔綠色

# 繪製手掌骨架
def draw_landmarks_on_image(rgb_image, detection_result):
  hand_landmarks_list = detection_result.hand_landmarks
  handedness_list = detection_result.handedness
  annotated_image = np.copy(rgb_image)

  # 遍歷檢測到的手部以進行視覺化
  for idx in range(len(hand_landmarks_list)):
    hand_landmarks = hand_landmarks_list[idx]
    handedness = handedness_list[idx]

    # 繪製手部標記點
    hand_landmarks_proto = landmark_pb2.NormalizedLandmarkList()
    hand_landmarks_proto.landmark.extend([
      landmark_pb2.NormalizedLandmark(x=landmark.x, y=landmark.y, z=landmark.z) for landmark in hand_landmarks
    ])
    solutions.drawing_utils.draw_landmarks(
      annotated_image,
      hand_landmarks_proto,
      solutions.hands.HAND_CONNECTIONS,
      solutions.drawing_styles.get_default_hand_landmarks_style(),
      solutions.drawing_styles.get_default_hand_connections_style())

    # 獲取檢測到的手部邊界框的左上角
    height, width, _ = annotated_image.shape
    x_coordinates = [landmark.x for landmark in hand_landmarks]
    y_coordinates = [landmark.y for landmark in hand_landmarks]
    text_x = int(min(x_coordinates) * width)
    text_y = int(min(y_coordinates) * height) - MARGIN

    # 在圖像上繪製左手或右手的標記
    cv2.putText(annotated_image, f"{handedness[0].category_name}",
                (text_x, text_y), cv2.FONT_HERSHEY_DUPLEX,
                FONT_SIZE, HANDEDNESS_TEXT_COLOR, FONT_THICKNESS, cv2.LINE_AA)

  return annotated_image

with HandLandmarker.create_from_options(options) as landmarker:
    image_path = r"C:\CNN\pic\hand.jpg"
    image = cv2.imread(image_path)

    # 将图像大小减小一半
    small_image = cv2.resize(image, (0, 0), fx=0.5, fy=0.5)

    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=small_image)
    hand_landmarker_result = landmarker.detect(mp_image)

    annotated_image = draw_landmarks_on_image(small_image, hand_landmarker_result)

    cv2.imshow('Hand Detection', annotated_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()