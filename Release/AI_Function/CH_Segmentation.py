import os 
import cv2
import numpy as np
from ultralytics import YOLO
from pathlib import Path
import numpy as np
from shapely.geometry import Point, Polygon
from sklearn.cluster import KMeans
import shutil
import random
import sys

"""
* Segmentation
1.Segmentate CHD and CHS in CHD_Detect and CHS_Detect into different parts
    CHD_SAM
    CHS_SAM
2.Annotate and Mask for each parts
    annotations:label
    images:masked part
* Color
3.Use CHD_SAM, Make a dictionary to save body parts and corresponding color
4.Use CHS_SAM, Make a dictionary to save body parts and corresponding coloring position
"""
# Class for initial every class
class CH_SEG__init():
    # Function for init
    def __init__(self,CH_Name):
        # Set detect and save directories
        self.CHD_Detect_dir = "CHD_Detect/" + CH_Name
        self.CHD_SAM_dir = "CHD_SAM/" + CH_Name
        self.CHS_Detect_dir = "CHS_Detect/" + CH_Name
        self.CHS_SAM_dir = "CHS_SAM/" + CH_Name
        # Create new dir
        os.makedirs(self.CHD_SAM_dir, exist_ok=True)
        os.makedirs(self.CHS_SAM_dir, exist_ok=True)
        # Announce a list to store all class models detect
        self.class_list = []
    # Function for recreate dir
    def clear_and_create_dir(self, directory):
        if os.path.exists(directory):
            shutil.rmtree(directory)
        os.makedirs(directory, exist_ok=True)

# Class for Sementate CHD and CHS from user and preprocess
class CH_Segmentation(CH_SEG__init):
    # Function for init
    def __init__(self,CH_Name):
        # init from Class CH_SEG_init
        super().__init__(CH_Name)
        # init YOLO models
        # init model_SAM path
        model_SAM = "model_SAM"
        # Get all models path in {model_SAM}
        detect_models = Path(model_SAM)
        # init detect model list
        self.detect_list = []
        # Save all models into {detect_list}
        for detect_model in detect_models.iterdir():
            if detect_model.is_file():
                detect = YOLO(detect_model)
                self.detect_list.append(detect)
    
    def get_next_image_name(self, output_image_dir, detect_class):
        # 遍歷目標資料夾內的所有檔案
        files = os.listdir(output_image_dir)
        # 設置初始計數
        same_class_count = 1
        
        # 遍歷檔案，判斷是否有與 detect_class 名稱匹配的檔案
        for file in files:
            # 檢查檔案名稱是否以 detect_class 開頭並以 ".png" 結尾
            if file.startswith(f"{detect_class}_") and file.endswith(".png"):
                try:
                    # 嘗試從檔案名稱中提取數字
                    count = int(file.replace(f"{detect_class}_", "").replace(".png", ""))
                    same_class_count = max(same_class_count, count + 1)
                except ValueError:
                    continue
        
        # 根據最終的 same_class_count 生成新檔案名稱
        output_image_path = os.path.join(output_image_dir, f"{detect_class}_{same_class_count}.png")
        
        return output_image_path

    def get_next_txt_name(self, output_annotation_dir, detect_class):
        # 遍歷目標資料夾內的所有檔案
        files = os.listdir(output_annotation_dir)
        # 設置初始計數
        same_class_count = 1
        
        # 遍歷檔案，判斷是否有與 detect_class 名稱匹配的 .txt 檔案
        for file in files:
            # 檢查檔案名稱是否以 detect_class 開頭並以 ".txt" 結尾
            if file.startswith(f"{detect_class}_") and file.endswith(".txt"):
                try:
                    # 嘗試從檔案名稱中提取數字
                    count = int(file.replace(f"{detect_class}_", "").replace(".txt", ""))
                    same_class_count = max(same_class_count, count + 1)
                except ValueError:
                    continue
        
        # 根據最終的 same_class_count 生成新檔案名稱
        txt_filename = os.path.join(output_annotation_dir, f"{detect_class}_{same_class_count}.txt")
        
        return txt_filename

    # Function for YOLO segmentation
    def yolov8_detect(self, detect_dir, save_dir, CH_Type):
        self.clear_and_create_dir(save_dir)
        # Segmentate with each model in list
        for detect in self.detect_list:
            results = detect.predict(detect_dir, save = False)
            # Announce whether this model's detection class has been save or not
            # Solve the results' informations
            for i, result in enumerate(results):
                if result.masks == None:
                    pass
                else:
                    image_path = result.path    # image path
                    image = cv2.imread(image_path)  # Change image_path to image which is available for dealing
                    image_name = os.path.splitext(os.path.basename(image_path))[0]  # Get image's name
                    names = result.names
                    
                    if (CH_Type == "CHS"):
                        output_image_dir = save_dir + "/" + f"{image_name}/images"
                        output_annotation_dir = save_dir + "/" + f"{image_name}/annotations"
                        os.makedirs(output_image_dir, exist_ok = True)
                        os.makedirs(output_annotation_dir, exist_ok = True)
                    else:
                        output_image_dir = save_dir + "/images"
                        os.makedirs(output_image_dir, exist_ok = True)

                    # Catch class IDs in boxes and turn into numpy
                    class_ids = result.boxes.cls.cpu().numpy()
                    # Exchange to corresponding class name
                    detect_classes = [names[int(class_id)] for class_id in class_ids]
                    print(detect_classes)
                    detect_class = detect_classes[0] # Get class
                    
                    # if detect_class in ["Hand", "Eye", "Shoe", "Leg"]:
                    for j, mask in enumerate(result.masks.xy):
                        mask_points = mask
                        detect_class = detect_classes[j]
                        print("Yes:" + detect_class)
                        # inner_points = self.select_random_points_from_polygon_points(mask_points,5)
                        inner_points = self.find_random_points_within_polygon(mask_points,5)
                        
                        # Check input images are CHD or CHS
                        if (CH_Type == "CHD"):
                            # Create all white background
                            masked_image = np.ones_like(image) * 255
                            # Check wheather is this class been saved
                            if (detect_class in self.class_list):
                                continue
                            else:
                                self.class_list.append(detect_class)      
                        else:
                            # Create all black background
                            masked_image = np.zeros_like(image)
                            # Announce txt path
                            txt_filename = self.get_next_txt_name(output_annotation_dir, detect_class)                                
                            with open(txt_filename, 'w') as file:
                                file.write(f"Image_Name: {image_name}\n")
                                file.write(f"Class: {detect_class}\n")
                                file.write(f"Inner Main Points: {inner_points}\n")
                                file.write(f"Mask Points:\n{mask_points}\n")
                            print(f"Finish input data into {txt_filename}")
                        # Get first mask data
                        mask_are = result.masks.data[j].cpu().numpy()
                        # Resize mask image size
                        mask_resized = cv2.resize(mask_are.squeeze(), (result.orig_shape[1], result.orig_shape[0]), interpolation=cv2.INTER_LINEAR)
                        mask_bool = mask_resized.astype(bool)  # Change into booling type
                        # Copy original image's mask to new image
                        masked_image[mask_bool] = image[mask_bool] 
                        # Save new image for show mask
                        output_image_path = self.get_next_image_name(output_image_dir, detect_class)
                        # output_image_path = os.path.join(output_image_dir + "/", f"{detect_class}_{same_class_count}.png")
                        cv2.imwrite(output_image_path, masked_image)
                        print(f"Finish create a mask image {output_image_path}")
    
    # Function for CHD segementation            
    def CHD_SEG(self):
        CH_Type = "CHD"
        # Call function yolov8_detect for segmentating
        self.yolov8_detect(self.CHD_Detect_dir, self.CHD_SAM_dir, CH_Type)
        # Save all class in Classes.txt to prepare for color_dictionary
        classes_path = os.path.join(self.CHD_SAM_dir + "/" + f"Classes.txt")
        with open(classes_path, 'w') as file:
            for cls in self.class_list:    
                file.write(f"{cls}\n")
        print(f"Finish save all class in {classes_path}")

    # Function for CHS segementation
    def CHS_SEG(self):
        CH_Type = "CHS"
        # Call function yolov8_detect for segmentating
        self.yolov8_detect(self.CHS_Detect_dir, self.CHS_SAM_dir, CH_Type)

    # Function for get random points in CHS parts for corloring
    """
    在由多邊形點定義的範圍內找到指定數量的隨機點。
    :param polygon_points: 多邊形頂點的列表，每個點是 (x, y) 的元組
    :param num_points: 要查找的點數量
    :return: 內部點的列表，每個點是 (x, y) 的元組
    """
    def find_random_points_within_polygon(self,polygon_points, num_points):
        # Create polygon object
        polygon = Polygon(polygon_points)
        # init random points
        random_points = []
        
        # Shrink the polygon by the specified amount (in pixels)
        shrunken_polygon = polygon.buffer(-10)
        
        # 如果縮小的多邊形是空的，則使用原始多邊形
        if shrunken_polygon.is_empty:
            print("Shrunken polygon is empty. Using the minimum enclosing circle's center point.")
            
            # 找到內接圓的中心點
            center = self.get_polygon_center_min_enclosing_circle(polygon_points)
            if center:
                random_points.append(center)
        else:     
            # center = self.get_polygon_center_min_enclosing_circle(polygon_points)
            # random_points.append(center) 
            # Get n random points
            while len(random_points) < num_points:
                # Generate random point in the bounding box of the shrunken polygon
                minx, miny, maxx, maxy = shrunken_polygon.bounds
                print(f"minx: {minx}, maxx: {maxx}, miny: {miny}, maxy: {maxy}")
                for _ in range(num_points * 50):  # 產生更多的嘗試以增加找到隨機點的機率
                    random_point = Point(np.random.uniform(minx, maxx), np.random.uniform(miny, maxy))
                    
                    # Check whether random point is in the shrunken polygon
                    if shrunken_polygon.contains(random_point):
                        random_points.append((random_point.x, random_point.y))
                        if len(random_points) == num_points:
                            break
        return random_points
    
    def get_polygon_center_min_enclosing_circle(self, polygon_points):
        """
        計算多邊形的最小外接圓的中心點。
        
        Args:
            polygon_points (list of tuples): 多邊形的點列表
        
        Returns:
            tuple: 最小外接圓的中心點 (x, y)
        """
        # 將多邊形點轉換為 numpy array
        polygon_np_points = np.array(polygon_points, dtype=np.float32)
        
        # 計算最小外接圓
        (center_x, center_y), radius = cv2.minEnclosingCircle(polygon_np_points)
        return (int(center_x), int(center_y))

# Class for coloring
"""
1.從CHD_SAM/{CH_Name}/找到所有部件的classes.txt檔
2.從CHD_SAM/{CH_Name}/{image_name}/images/找到所有部件的CHD
or 從CHD_SAM/{CH_Name}/中找到所有部件的CHD
3.dictionary製作，CHD圖片K-means取色
4.從CHS_SAM/{CH_Name}/找到每張照片取得的n個部件的Inner Main Points
5.透過dictionary與 部件名 和inner main points 上色
"""
class Coloring(CH_SEG__init):
    # init
    def __init__(self, CH_Name):
        super().__init__(CH_Name)
        # Set colored CHS's save dir
        self.CHS_Finished_dir = "CHS_Finished/" + CH_Name
        self.clear_and_create_dir(self.CHS_Finished_dir)
    
    # Function for getting all image path in folder
    def get_images_path(self, images_dir):
        images_path = []
        # Go Through all files
        for root, dirs, files in os.walk(images_dir):
            for file in files:
                # Check picture extension type
                if file.endswith(('.jpg', '.jpeg', '.png', '.bmp', '.gif')):
                    # store completed data path
                    images_path.append(os.path.join(root, file))
        return images_path
    
    # Function for getting all path in folder
    def get_files_path(self, files_dir):
        files_path = []
        # Go Through all files
        for root, dirs, files in os.walk(files_dir):
            for file in files:
                files_path.append(os.path.join(root, file))
        return files_path
    
    # Function for reading CHD's all classes in txt
    def read_files_to_dict(self, classes_path):
        # Announce a dictionary
        class_dict = {}
        # Read each row and save
        with open(classes_path, 'r', encoding='utf-8') as file:
            for index, line in enumerate(file, start=1):
                class_name = line.strip()
                if class_name:
                    class_dict[class_name] = index
        return class_dict
    
    # Function for getting second main color with K-means
    def get_second_dominant_color(self, image, k=6):
        img_np = np.array(image)
        img_np = img_np.reshape((-1, 3))
        # init kmeans and do with image
        kmeans = KMeans(n_clusters=k, n_init=10)
        kmeans.fit(img_np)

        # Sort colors
        unique, counts = np.unique(kmeans.labels_, return_counts=True)
        sorted_indices = np.argsort(counts)
        # Get second main color to skip white
        second_dominant_color = kmeans.cluster_centers_[unique[sorted_indices[-2]]]
        # Convert from (b, g, r) to (r, g, b)
        second_dominant_color = second_dominant_color.astype(int)[::-1]
        print(f"color rgb:{second_dominant_color}")
        return second_dominant_color.astype(int)

    # Function for getting CHS label in txt
    def extract_class_and_points(self, file_path):
        class_name = None
        inner_main_points = None
        # Get class and inner main points in Classes.txt
        with open(file_path, 'r', encoding='utf-8') as file:
            # For each row
            for line in file:
                line = line.strip()
                # If start "Class"
                if line.startswith("Class:"):
                    class_name = line.split(":")[1].strip()
                # If start "Class"
                if line.startswith("Inner Main Points:"):
                    points_str = line.split(":")[1].strip()
                    # Change string into list
                    inner_main_points = eval(points_str)
        return class_name, inner_main_points
    
    def overlay_black_lines_on_image(self, copy_img, sketch):
        # Make sure size is the same
        sketch = cv2.resize(sketch, (copy_img.shape[1], copy_img.shape[0]))
        # Change sketch into gray
        gray_sketch = cv2.cvtColor(sketch, cv2.COLOR_BGR2GRAY)
        # Mask for black sketch
        _, mask = cv2.threshold(gray_sketch, 200, 255, cv2.THRESH_BINARY)
        # Catch copy
        combined_image = cv2.bitwise_and(copy_img, copy_img, mask=mask)
        return combined_image

    # Function for fill color in CHS
    def fill_color_demo(self, sketch, color_dictionary, position_dictionary):
        copy_img = sketch.copy()
        h, w = sketch.shape[:2]
        mask = np.zeros([h+2, w+2], np.uint8)
        # Color CHS with color_dictionary and points
        for key, position_list in position_dictionary.items():
            key = key.split("_")[0]
            if key in color_dictionary:
                rgb = color_dictionary[key]
                r, g, b = rgb
                for position in position_list:
                    # If string
                    if isinstance(position, str):
                        x, y = map(int, position.strip('()').split(', '))
                    # If tuple
                    elif isinstance(position, tuple):
                        x, y = map(int, position)
                    # If Error
                    else:
                        raise ValueError("Position should be either a string or a tuple")
                    # Color cv2's color is BGT not RGB
                    # mask.fill(0)
                    cv2.floodFill(copy_img, mask, (x, y), (int(b), int(g), int(r)), (50, 50, 50), (100, 100, 100), cv2.FLOODFILL_FIXED_RANGE)
                    copy_img = self.overlay_black_lines_on_image(copy_img, sketch)
                # marked_image = copy_img.copy()
                # for point in position_list:
                #     # 確保點的座標是整數
                #     x, y = int(point[0]), int(point[1])
                #     cv2.circle(marked_image, (x, y), radius=5, color=(0, 0, 255), thickness=-1)
                # print(f"key = {key}\nrgb = {rgb}\nposition = {position}")
                # cv2.namedWindow("Image", cv2.WINDOW_AUTOSIZE)
                # cv2.imshow(f"Image", marked_image)
                # cv2.waitKey(0) 
        copy_img = self.overlay_black_lines_on_image(copy_img, sketch)
        height, width, _ = copy_img.shape
        clear_points = [(0,0), (width-1,0), (width-1, height-1), (0,height-1)]
        for point in clear_points:
            mask.fill(0)
            cv2.floodFill(copy_img, None, point, (int(255), int(255), int(255)), (50, 50, 50), (50, 50, 50), cv2.FLOODFILL_FIXED_RANGE)
        # cv2.namedWindow("Block", cv2.WINDOW_AUTOSIZE)
        # cv2.imshow(f"Block", copy_img)
        # cv2.waitKey(0)
        return copy_img

    # Function for pick color in CHD and make a color dictionary
    def pick_color(self):
        # init
        images_dir = self.CHD_SAM_dir + "/images"
        images_path = self.get_images_path(images_dir)
        color_dictionary = {}

        # Pick colors for each segmentaions' parts
        for image_path in images_path:
            # Get second main color and change it into pyhton list
            image = cv2.imread(image_path)
            second_color = self.get_second_dominant_color(image).tolist()
            
            # Get file path ex: Hair_1.png
            file_name = os.path.basename(image_path)
            # Get class from file path ex : Hair
            name_part = file_name.split('_')[0]  # Hair
            image_key = str(name_part)
            # Put scond_color in to dictionary
            color_dictionary[image_key] = second_color
        print(color_dictionary)
        return color_dictionary

    # Function for coloring
    def color(self, color_dictionary):
        """
        1.CHS_Detect/{CH_Name}/取得每一張原圖，準備上色
        2.CHS_SAM/{CH_Name}/{image_name}/annotations/取得每一張圖片的class 與 inner main points
        3.對照dictionary上色
        """
        CHS_paths = []
        # Get all CHS path in folder, this is list
        CHS_paths = self.get_images_path(self.CHS_Detect_dir)
        # Deal with all CHS
        for CHS_path in CHS_paths:
            CHS_Name = os.path.splitext(os.path.basename(CHS_path))[0]
            CHS_image = cv2.imread(CHS_path)
            # Get CHS_SAM label
            CHS_annotations_dir = self.CHS_SAM_dir + "/" + f"{CHS_Name}/annotations"
            CHS_annotations_paths = self.get_files_path(CHS_annotations_dir)
            # Announce main points dictionary for coloring
            position_dictionary = {}
            class_count = 1
            old_cls = ""
            # Save all main points into position_dictionary
            for CHS_annotation_path in CHS_annotations_paths:
                cls, points = self.extract_class_and_points(CHS_annotation_path)
                if (old_cls != cls):
                    class_count = 1
                    old_cls = cls
                in_cls = old_cls + "_" + str(class_count)
                position_dictionary[in_cls] = points
                class_count += 1
            # Color and save image
            CHS_Finished = self.fill_color_demo(CHS_image, color_dictionary, position_dictionary)
            CHS_save_path = os.path.join(self.CHS_Finished_dir, f"{CHS_Name}_Fin.png")
            cv2.imwrite(CHS_save_path, CHS_Finished)
        return self.CHS_Finished_dir
    
def main(CH_Name):
    CH_Name = os.path.splitext(CH_Name)[0]
    color_dictionary , CHS_Finished_dir = get_colored(CH_Name)
    print("====2====")
    return color_dictionary ,"AI_Function/" + CHS_Finished_dir

def get_colored(CH_Name):
    CH_Name = os.path.splitext(CH_Name)[0]
    CH_Seg = CH_Segmentation(CH_Name)
    CH_Seg.CHD_SEG()
    CH_Seg.CHS_SEG()
    CH_Col = Coloring(CH_Name)
    color_dictionary = CH_Col.pick_color()
    CHS_Finished_dir = CH_Col.color(color_dictionary)
    return color_dictionary, CHS_Finished_dir          

if __name__ == "__main__":
    CH_Name = sys.argv[1]
    print("====1====")
    # CH_Name = "FamilyYO.pt"
    # CH_Name = "TestA005.pt"
    # CH_Name = "Anime008.pt"
    main(CH_Name)