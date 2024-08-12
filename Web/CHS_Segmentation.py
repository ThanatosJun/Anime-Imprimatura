import os 
import torch
import cv2
import numpy as np
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator
from ultralytics import YOLO
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
from shapely.geometry import Point, Polygon
from sklearn.cluster import KMeans

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

# def apply_mask_to_image(image, mask):
#     """
#     將 mask 塗滿並與原圖像結合。

#     :param image: 原圖像，為 BGR 格式的 NumPy 陣列
#     :param mask: 包含多個點的 mask，為 List of (x, y) tuples
#     :return: 塗滿 mask 後的圖像，為 BGR 格式的 NumPy 陣列
#     """
#     # 創建與原圖像相同大小的黑色圖像
#     mask_image = np.zeros_like(image)
    
#     # 將 mask 轉換為 NumPy 陣列
#     mask_array = np.array(mask, dtype=np.int32)
    
#     # 填充 mask 區域
#     cv2.fillPoly(mask_image, [mask_array], (0, 0, 255))  # 使用紅色填充 mask
    
#     # 將 mask_image 與原圖像合併
#     combined_image = cv2.addWeighted(image, 1.0, mask_image, 0.5, 0)
    
#     return combined_image

# def find_convex_hull(polygons):
#     """
#     找到包含所有多边形点的最大凸多边形（凸包）。

#     :param polygons: 多边形列表，每个多边形是一个 List of (x, y) tuples
#     :return: 包含所有点的最大凸多边形，返回为 List of (x, y) tuples
#     """
#     # 获取所有多边形的顶点，并确保是CV_32S格式
#     # all_points = np.concatenate([np.array(polygon, dtype=np.int32) for polygon in polygons])


#     # 计算凸包
#     hull = cv2.convexHull(polygons)

#     # 将凸包转换为 List of (x, y) tuples
#     hull_points = [(point[0][0], point[0][1]) for point in hull]

#     return hull_points

def preprocess_image(image_path):
    image_bgr = cv2.imread(image_path)
    if image_bgr is None:
        raise ValueError(f"Image at path '{image_path}' could not be loaded. Please check the file path.")
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    return image_bgr, image_rgb

class CH_SEG__init():
    def __init__(self,CH_Name):
        # # 設定檔案路徑
        self.CHECKPOINT_PATH = "CH_Segmentation/sam_vit_h_4b8939.pth"

        # 手動指定圖像檔案的路徑
        self.CHD_Detect_dir = "CHD_Detect/" + CH_Name
        self.CHD_SAM_dir = "CHD_SAM/" + CH_Name
        self.CHS_Detect_dir = "CHS_Detect/" + CH_Name
        self.CHS_SAM_dir = "CHS_SAM/" + CH_Name
        os.makedirs(self.CHD_SAM_dir, exist_ok=True)
        os.makedirs(self.CHS_SAM_dir, exist_ok=True)
        self.class_list = []

class CH_Segmentation(CH_SEG__init):
    def __init__(self,CH_Name):
        super().__init__(CH_Name)
        # 設定裝置
        self.DEVICE = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        self.MODEL_TYPE = "vit_h"
        # 加載 SAM 模型
        sam_model = sam_model_registry[self.MODEL_TYPE](checkpoint = self.CHECKPOINT_PATH).to(device = self.DEVICE)
        self.mask_generator = SamAutomaticMaskGenerator(sam_model)

        # YOLO detect model init
        # init model_SAM path
        model_SAM = "model_SAM"
        detect_models = Path(model_SAM)
        # init detect model list
        self.detect_list = []
        for detect_model in detect_models.iterdir():
            if detect_model.is_file():
                detect = YOLO(detect_model)
                self.detect_list.append(detect)
    
    def yolov8_detect(self, detect_dir, save_dir, CH_Type):
        # for detect in self.detect_list:
        for detect in self.detect_list:
            results = detect.predict(detect_dir, save = False)
            class_store = False
            for i, result in enumerate(results):
                image_path = result.path
                image = cv2.imread(image_path)
                image_name = os.path.splitext(os.path.basename(image_path))[0]
                detect_class = result.names[0]
                mask_points = result.masks.xy[0]
                inner_points = self.find_random_points_within_polygon(mask_points,5)
                if (CH_Type == "CHD"):
                    output_image_dir = save_dir + "/images"
                    output_annotation_dir = save_dir + "/annotations"
                    # 創建一個全白的圖像
                    masked_image = np.ones_like(image) * 255
                    if (class_store == False):
                        self.class_list.append(detect_class)
                        class_store = True      
                else:
                    output_image_dir = save_dir + "/" + f"{image_name}/images"
                    output_annotation_dir = save_dir + "/" + f"{image_name}/annotations"
                    # 創建一個全黑的圖像
                    masked_image = np.zeros_like(image)
                os.makedirs(output_image_dir, exist_ok=True)
                os.makedirs(output_annotation_dir, exist_ok=True)
                txt_filename = os.path.join(output_annotation_dir + "/", f"{detect_class}_{i+1}.txt")
                print("txt_filename:" + txt_filename)
                print("self.output_annotation_dir:" + output_annotation_dir)
                mask = result.masks.data[0].cpu().numpy()  # 獲取所有 mask [0]的數據
                with open(txt_filename, 'w') as file:
                    file.write(f"Image_Name: {image_name}\n")
                    file.write(f"Class: {detect_class}\n")
                    file.write(f"Inner Main Points: {inner_points}\n")
                    file.write(f"Mask Points:\n{mask_points}\n")
                print("Finish input data into text")

                # 獲取 mask 數據
                
                mask_resized = cv2.resize(mask.squeeze(), (result.orig_shape[1], result.orig_shape[0]), interpolation=cv2.INTER_LINEAR)
                mask_bool = mask_resized.astype(bool)  # 轉換為布林格式


                # 將原圖像的 mask 區域拷貝到新的圖像
                masked_image[mask_bool] = image[mask_bool] 
                # 保存mask圖像
                output_image_path = os.path.join(output_image_dir + "/", f"{detect_class}_{i+1}.png")
                cv2.imwrite(output_image_path, masked_image)
                print("Finish create a mask image")
                
    def CHD_SEG(self):
        CH_Type = "CHD"
        self.yolov8_detect(self.CHD_Detect_dir, self.CHD_SAM_dir, CH_Type)
        classes_path = os.path.join(self.CHD_SAM_dir + "/" + f"Classes.txt")
        with open(classes_path, 'w') as file:
            for cls in self.class_list:    
                file.write(f"{cls}\n")
        print(self.class_list)
        print(f"Finish input {classes_path} in {self.CHD_SAM_dir}")

    def CHS_SEG(self):
        CH_Type = "CHS"
        self.yolov8_detect(self.CHS_Detect_dir, self.CHS_SAM_dir, CH_Type)

    def find_random_points_within_polygon(self,polygon_points, num_points):
        """
        在由多邊形點定義的範圍內找到指定數量的隨機點。
        
        :param polygon_points: 多邊形頂點的列表，每個點是 (x, y) 的元組
        :param num_points: 要查找的點數量
        :return: 內部點的列表，每個點是 (x, y) 的元組
        """
        # 創建多邊形對象
        polygon = Polygon(polygon_points)
        
        # # 檢查多邊形是否有效
        # if not polygon.is_valid:
        #     raise ValueError("Invalid polygon")
        
        # 初始化隨機點的列表
        random_points = []
        
        while len(random_points) < num_points:
            # 生成隨機點在多邊形的 bounding box 中
            minx, miny, maxx, maxy = polygon.bounds
            random_point = Point(np.random.uniform(minx, maxx), np.random.uniform(miny, maxy))
            
            # 檢查隨機點是否在多邊形內部
            if polygon.contains(random_point):
                random_points.append((random_point.x, random_point.y))
        
        return random_points

class Coloring():
    def __init__(self):
        super().__init__(CH_Name)
    """
    1.從CHD_SAM/{CH_Name}/找到所有部件的classes.txt檔
    2.從CHD_SAM/{CH_Name}/{image_name}/images/找到所有部件的CHD
    or 從CHD_SAM/{CH_Name}/中找到所有部件的CHD
    3.dictionary製作，CHD圖片K-means取色
    4.從CHS_SAM/{CH_Name}/找到每張照片取得的n個部件的Inner Main Points
    5.透過dictionary與 部件名 和inner main points 上色
    """
    # 讀取CHD segment txt檔案到字典
    def read_files_to_dict(classes_path, start_index=1):
        """
        讀取Classes.txt檔案，將每個class轉換為字典中的索引。
        
        :param file_path: Classes.txt文件的路徑
        :return: 包含類別名稱和對應索引的字典
        """
        class_dict = {}
        
        with open(classes_path, 'r', encoding='utf-8') as file:
            for index, line in enumerate(file, start=1):
                class_name = line.strip()
                if class_name:  # 確保類別名稱不為空
                    class_dict[class_name] = index
        
        return class_dict
    
    # 獲取第二主要顏色(利用kmeans取色)
    def get_second_dominant_color(image, k=4):
        img_np = np.array(image)
        img_np = img_np.reshape((-1, 3))

        kmeans = KMeans(n_clusters=k, n_init=10)
        kmeans.fit(img_np)

        unique, counts = np.unique(kmeans.labels_, return_counts=True)
        sorted_indices = np.argsort(counts)

        second_dominant_color = kmeans.cluster_centers_[unique[sorted_indices[-2]]]
        return second_dominant_color.astype(int)
    # Function for getting all path in folder
    def get_images_read(images_dir):
        images = []
        # Go Through all files
        for root, dirs, files in os.walk(images_dir):
            for file in files:
                # Check picture extension type
                if file.endswith(('.jpg', '.jpeg', '.png', '.bmp', '.gif')):
                    # store completed data path
                    images.append(cv2.imread(os.path.join(root, file)))
        return images
    

    def pick_color(self):
        # classes_path = "CHD_SAM/Anime008" + "/Classes.txt"
        classes_path = self.CHD_SAM_dir + "/classes.txt"
        images_dir = self.CHD_SAM_dir + "/images"
        images_dir = "CHD_SAM/Anime008" + "/images"
        images = self.get_images_read(images_dir)
        # listTest = read_files_to_dict(classes_path)
        # print(listTest)
        class_dictionary = self.read_files_to_dict(classes_path)

        # 初始化一個空字典來存儲每張圖像的第二主色
        second_dominant_colors = {}

        # 遍歷圖像列表，並逐一提取每張圖像的第二主色
        for index, image in enumerate(images):
            # 計算圖像的第二主色，並將其轉換為 Python 列表
            second_color = self.get_second_dominant_color(image).tolist()
            
            # 將索引轉換為從 1 開始的字符串，並作為字典的鍵
            image_key = str(index + 1)
            
            # 將第二主色存入字典中
            second_dominant_colors[image_key] = second_color
        print(second_dominant_colors)
        combined_dict = {class_dictionary[key]: second_dominant_colors[str(key)] for key in class_dictionary}






        

    

if __name__ == "__main__":
    CH_Name = "Anime008"
    CH_Seg = CH_Segmentation(CH_Name)
    CH_Seg.CHD_SEG()
    CH_Seg.CHS_SEG()



                



                # def plot_polygon_and_points(polygon_points, points):
                #     """
                #     繪製多邊形和內部的點。
                    
                #     :param polygon_points: 多邊形頂點的列表，每個點是 (x, y) 的元組
                #     :param points: 要繪製的點，每個點是 (x, y) 的元組
                #     """
                #     polygon = Polygon(polygon_points)
                #     x, y = polygon.exterior.xy
                    
                #     plt.figure()
                #     plt.fill(x, y, alpha=0.5, fc='blue', label='Polygon')
                #     px, py = zip(*points)
                #     plt.scatter(px, py, color='red', label='Random Points')
                #     plt.xlabel('X')
                #     plt.ylabel('Y')
                #     plt.title('Polygon and Random Points')
                #     plt.legend()
                #     plt.grid(True)
                #     plt.show()

                # # 示例使用
                # polygon_points = mask
                # random_points = find_random_points_within_polygon(polygon_points, num_points=13)
                # print("Random Points:", random_points)

                # plot_polygon_and_points(polygon_points, random_points)