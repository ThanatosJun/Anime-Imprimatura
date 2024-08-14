import os 
import cv2
import numpy as np
from ultralytics import YOLO
from pathlib import Path
import numpy as np
from shapely.geometry import Point, Polygon
from sklearn.cluster import KMeans

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
    
    # Function for YOLO segmentation
    def yolov8_detect(self, detect_dir, save_dir, CH_Type):
        # Segmentate with each model in list
        for detect in self.detect_list:
            results = detect.predict(detect_dir, save = False)
            # Announce whether this model's detection class has been save or not
            class_store = False
            # Solve the results' informations
            for i, result in enumerate(results):
                if result.masks == None:
                    pass
                else:
                    image_path = result.path    # image path
                    image = cv2.imread(image_path)  # Change image_path to image which is available for dealing
                    image_name = os.path.splitext(os.path.basename(image_path))[0]  # Get image's name
                    detect_class = result.names[0]  # Get class
                    mask_points = result.masks.xy[0]    # Get mask points
                    inner_points = self.find_random_points_within_polygon(mask_points,5)    # Get Main points for coloring
                    # Check input images are CHD or CHS
                    if (CH_Type == "CHD"):
                        # Set save dir
                        output_image_dir = save_dir + "/images"
                        output_annotation_dir = save_dir + "/annotations"
                        # Create all white background
                        masked_image = np.ones_like(image) * 255
                        # Check wheather is this class been saved
                        if (class_store == False):
                            self.class_list.append(detect_class)
                            class_store = True      
                    else:
                        # Set save dir
                        output_image_dir = save_dir + "/" + f"{image_name}/images"
                        output_annotation_dir = save_dir + "/" + f"{image_name}/annotations"
                        # Create all black background
                        masked_image = np.zeros_like(image)
                    os.makedirs(output_image_dir, exist_ok=True)
                    os.makedirs(output_annotation_dir, exist_ok=True)
                    # Announce txt path
                    txt_filename = os.path.join(output_annotation_dir + "/", f"{detect_class}_{i+1}.txt")
                    
                    with open(txt_filename, 'w') as file:
                        file.write(f"Image_Name: {image_name}\n")
                        file.write(f"Class: {detect_class}\n")
                        file.write(f"Inner Main Points: {inner_points}\n")
                        file.write(f"Mask Points:\n{mask_points}\n")
                    print(f"Finish input data into {txt_filename}")

                    # Get first mask data
                    mask = result.masks.data[0].cpu().numpy()
                    # Resize mask image size
                    mask_resized = cv2.resize(mask.squeeze(), (result.orig_shape[1], result.orig_shape[0]), interpolation=cv2.INTER_LINEAR)
                    mask_bool = mask_resized.astype(bool)  # Change into booling type


                    # Copy original image's mask to new image
                    masked_image[mask_bool] = image[mask_bool] 
                    # Save new image for show mask
                    output_image_path = os.path.join(output_image_dir + "/", f"{detect_class}_{i+1}.png")
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
        
        # Get n radndom points
        while len(random_points) < num_points:
            # Generate radndom point in polygon
            minx, miny, maxx, maxy = polygon.bounds
            random_point = Point(np.random.uniform(minx, maxx), np.random.uniform(miny, maxy))

            # Check whether random point is in polyhon
            if polygon.contains(random_point):
                random_points.append((random_point.x, random_point.y))
        return random_points

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
        os.makedirs(self.CHS_Finished_dir, exist_ok=True)
    
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
        # print(image)
        # print(f"color:{kmeans.cluster_centers_[unique[sorted_indices]]}")
        # print(f"second_dominant_color = {second_dominant_color}")
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
    
    # Function for fill color in CHS
    def fill_color_demo(self, sketch, color_dictionary, position_dictionary):
        copy_img = sketch.copy()
        h, w = sketch.shape[:2]
        mask = np.zeros([h+2, w+2], np.uint8)
        # Color CHS with color_dictionary and points
        for key, position_list in position_dictionary.items():
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
                    # Color
                    cv2.floodFill(copy_img, mask, (x, y), (int(b), int(g), int(r)), (100, 100, 100), (100, 100, 100), cv2.FLOODFILL_FIXED_RANGE)
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
            # Save all main points into position_dictionary
            for CHS_annotation_path in CHS_annotations_paths:
                cls, points = self.extract_class_and_points(CHS_annotation_path)
                position_dictionary[cls] = points
            # Color and save image
            CHS_Finished = self.fill_color_demo(CHS_image, color_dictionary, position_dictionary)    
            CHS_save_path = os.path.join(self.CHS_Finished_dir, f"{CHS_Name}_Fin.png")
            cv2.imwrite(CHS_save_path, CHS_Finished)
        return self.CHS_Finished_dir
    
def main(CH_Name):
    # ==請在以下從前端給 CH_Name，也就是使用者輸入的CHD名字==

    # ====
    color_dictionary , CHS_Finished_dir = get_colored(CH_Name)
    return color_dictionary , CHS_Finished_dir

def get_colored(CH_Name):
    CH_Seg = CH_Segmentation(CH_Name)
    CH_Seg.CHD_SEG()
    CH_Seg.CHS_SEG()
    CH_Col = Coloring(CH_Name)
    color_dictionary = CH_Col.pick_color()
    CHS_Finished_dir = CH_Col.color(color_dictionary)
    return color_dictionary, CHS_Finished_dir          

# if __name__ == "__main__":
#     CH_Name = "Anime008"
#     CH_Seg = CH_Segmentation(CH_Name)
#     CH_Seg.CHD_SEG()
#     CH_Seg.CHS_SEG()
#     CH_Col = Coloring(CH_Name)
#     color_dictionary = CH_Col.pick_color()
#     CHS_Finished_dir = CH_Col.color(color_dictionary)

# """
# # 顯示顏色預覽(不重要可以不用寫)
# import matplotlib.pyplot as plt
# def show_color_previews(color_dict):
#     fig, axs = plt.subplots(1, len(color_dict), figsize=(12, 3))
#     if len(color_dict) == 1:
#         axs = [axs]
#     for ax, (title, color) in zip(axs, color_dict.items()):
#         color_array = np.array(color) / 255.0
#         ax.imshow([[color_array]])
#         ax.set_title(f'{title}: {color}')
#         ax.axis('off')
#     plt.show()
# combined_dict = {'Eye': [57, 37, 17], 'Face': [198, 222, 253], 'Hair': [102, 95, 128]}
# show_color_previews(combined_dict)
# """

                



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