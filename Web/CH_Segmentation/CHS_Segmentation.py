import os 
import torch
import cv2
import numpy as np
import matplotlib.pyplot as plt
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator
from ultralytics import YOLO
from ipywidgets import widgets
from IPython.display import display, clear_output

"""
1.Segmentation
2.Detect Segmentation Images
3.Store Correct Segmentation Images
4.Label Correct Segmentation points
5.Store Class Label in .txt
"""
# 檢查檔案是否存在
def check_file_exists(file_path):
    if os.path.isfile(file_path):
        print(f"檔案 {file_path} 已存在。")
    else:
        raise FileNotFoundError(f"找不到檔案: {file_path}")

# 填充輪廓函數
def fill_contours(image, mask, color=(0, 255, 0), thickness=cv2.FILLED):
    if not isinstance(mask, np.ndarray):
        raise TypeError("mask must be a NumPy array")
    if mask.ndim != 2:
        raise ValueError("mask must be a 2D array")
    if mask.dtype != np.uint8:
        mask = mask.astype(np.uint8)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    image_with_filled_contours = image.copy()
    cv2.drawContours(image_with_filled_contours, contours, -1, color, thickness=thickness)

    return image_with_filled_contours, contours

def preprocess_image(image_path):
    image_bgr = cv2.imread(image_path)
    if image_bgr is None:
        raise ValueError(f"Image at path '{image_path}' could not be loaded. Please check the file path.")
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    return image_bgr, image_rgb

class CH_SEG__init():
    def __init__(self,CH_Name):
        # 設定檔案路徑
        self.CHECKPOINT_PATH = "sam_vit_h_4b8939.pth"
        self.CASCADE_PATH = "lbpcascade_animeface.xml"
        self.LABELS_PATH = "labels(face hair eye).txt"
        self.KERAS_MODEL_PATH = "keras_model(face hair eye).h5"
        self.EYE_CASCADE_PATH = "haarcascade_eye.xml"
        self.HAIR_MODEL_PATH = "CHS_hair.pt"

        check_file_exists(self.CHECKPOINT_PATH)
        check_file_exists(self.CASCADE_PATH)
        check_file_exists(self.LABELS_PATH)
        check_file_exists(self.KERAS_MODEL_PATH)
        check_file_exists(self.EYE_CASCADE_PATH)
        check_file_exists(self.HAIR_MODEL_PATH)

        # 創建保存檔案的目錄
        self.output_dir = "segmentation/" + CH_Name
        self.output_image_dir = self.output_dir + "images"
        self.output_txt_dir = self.output_dir + "annotations"

        if not os.path.exists(self.output_image_dir):
            os.makedirs(self.output_image_dir)
        if not os.path.exists(self.output_txt_dir):
            os.makedirs(self.output_txt_dir)

        # 手動指定圖像檔案的路徑
        self.CHD_Detect_dir = "CHD_Detect/" + CH_Name
        self.CHD_SAM_dir = "CHD_SAM/" + CH_Name
        self.CHS_Detect_dir = "CHS_Detect/" + CH_Name
        self.CHS_SAM_dir = "CHS_SAM/" + CH_Name

class CH_Segmentation(CH_SEG__init):
    def __init__(self,CH_Name):
        super().__init__(CH_Name)
        # 設定裝置
        self.DEVICE = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        self.MODEL_TYPE = "vit_h"
        # 加載 SAM 模型
        sam_model = sam_model_registry[self.MODEL_TYPE](checkpoint = self.CHECKPOINT_PATH).to(device = self.DEVICE)
        self.mask_generator = SamAutomaticMaskGenerator(sam_model)
        self.image_ORIs = []
        self.image_RGBs = []
        self.SAM_results = []

        # YOLO detect model init
        self.hair_detect_model = "CHS_hair.pt"
        self.face_detect_model = ""
        self.eye_detect_model = ""
        

    
    def yolov8_detect(self, detect_dir):
        detect_list = []
        detect_list.append(hair_detect)
        hair_detect = YOLO(self.hair_detect_model)
        face_detect = YOLO(self.face_detect_model)
        eye_detect = YOLO(self.eye_detect_model)
        for detect in detect_list:
            hair_results = detect.predict(detect_dir, save = False)
            for hair_result in hair_results:
                print(hair_result.names[0])
                # 我要抓取 detect_name >> result.name, image_name >> result.path, image mask >> result.masks!
                # CHS: 整個程式碼最後會有 N個部件的.txt與一張與mask疊加後的 CHS
                # >>.txt 內，有各個類別的mask label points與
                # >>.txt 命名： {Image_Name}_SAM_hair.txt
                # CHD: 整個程式碼最後會有 N個部件的.txt與一張與mask疊加後的 CHD

    # SAM each image in input dir
    def CH_SAM(self,detect_dir):
        # 使用 SAM 模型生成分割結果
        images = os.listdir(detect_dir)
        print(images)
        for image in images:
        # check file is .png or .jpg
            if image.endswith(('.png', '.jpg', '.jpeg', '.JPG', '.JPEG')):
                image_ORI, image_RGB = preprocess_image(detect_dir + "/" + image)
                self.image_ORIs.append(image_ORI)
                self.image_RGBs.append(image_RGB)
                sam_result = self.mask_generator.generate(image_RGB)
                self.SAM_results.append(sam_result)

        # + 辨識SAM後的圖片是否為重要部件，運用模型辨識，
        # 然後將辨識後的圖片加入SAM_result or 回傳給CHD_SAM,CHS_SAM
        self.yolov8_detect(detect_dir)

    def CHD_SAM(self):
        self.CH_SAM(self.CHD_SAM_dir)


    def CHS_SAM(self):
        self.CH_SAM(self.CHS_SAM_dir)

CH_SAMo = CH_Segmentation("test001")
CH_SAMo.CH_SAM("pic")
