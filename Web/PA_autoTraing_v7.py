"""
Reference:CHD_Name from frontEND
Return:CHD_Name.pt model path
Features:
1.Data Preprocess
2.RPA labeling
3.train CHD_Model
"""
import os
import shutil
import random
import cv2
from PIL import Image, ImageEnhance, ImageOps, ImageChops
from ultralytics import YOLO
import torch.nn as nn
import numpy as np
# some adjustments by pigg--
import sys
# import yolov8_RPA_character_train_v3.zero123_stable_api as zero123_stable_api
# 'til here

class CustomYOLO(YOLO):
    def __init__(self,pretrained_path):
        super().__init__(pretrained_path)
        # Get numbers of classes
        self.nc = self.model.model[-1].nc  # make sure class is initializing

        # Add new layers
        self.new_conv_layer = nn.Conv2d(128, 64, 1, 1)
        self.new_linear_layer1 = nn.Linear(64, 32)
        self.new_linear_layer2 = nn.Linear(32, self.nc)  # nc is number of class

    def forward(self, x):
        # forward sequency
        x = self.model.model[:-1](x)  # overlook last layer in the original model
        x = self.new_conv_layer(x)
        x = x.view(x.size(0), -1)  # flatten
        x = self.new_linear_layer1(x)
        x = self.new_linear_layer2(x)
        return x

class PA_init():
    # Function for initialize variables and datas
    def __init__(self, CHD_Name):
        # image dir
        self.image_dir = "CHD_Images/" + CHD_Name + "_Images" # Image dir for store CHD ,CHD_SK and mutiple CHD
        self.image_augmentation_outputdir = "CHD_Images/" + CHD_Name + "_AugImages" # Image after augmentated
        self.CHD_Detect = "CHD_Detect/" + CHD_Name
        # datasets dir for training
        self.dataset_train_dir = "datasets/" + CHD_Name # datasets for training
        self.dataset_train_train = self.dataset_train_dir + "/train"    # waiting for labeling images in train file
        self.dataset_train_test = self.dataset_train_dir + "/test"  # waiting for labeling images in test file
        self.dataset_train_valid = self.dataset_train_dir + "/valid" # waiting for labeling images in valid file
        # datasets dir for noMainCharacter
        self.dataset_train_noCH_dir = "datasets/Anime_noCH"  # waiting for move all images and labels into datasets/CHD_Name
        self.dataset_train_noCH_train = self.dataset_train_noCH_dir + "/train"
        self.dataset_train_noCH_test = self.dataset_train_noCH_dir + "/test"
        self.dataset_train_noCH_valid = self.dataset_train_noCH_dir + "/valid"
        # split image into datasets percent
        self.train_ratio = 0.8 # 80% images for training
        self.test_ratio = 0.1 # 10% images for testing
        self.valid_ratio = 0.1 # 10% images for valid
        
        # model dir
        self.CHD_modeldir = "CHD_Model" # trained model for detect maincharacter
        self.CHD_modelpt =  self.CHD_modeldir + "/" + CHD_Name + ".pt"
        # model for labeling
        self.label_fullbody = "model_CHD/CHD_fullbody.pt"  # predict model for predicting fullbody
        self.label_head = "model_CHD/CHD_head_AI.pt"   # predict model for predicting head

        # variables for function auto_training
        self.model_contruction = "yolov8n.yaml"  # model construction
        self.pretrained_model = "model_CHD/yolov8n.pt" # pretrained model for use
        # training yaml
        self.data_yaml = "CHD_yaml/autoTrain.yaml"
        # training parameters
        self.train_params = {
        'data': self.data_yaml,
        'epochs': 20,
        'batch': -1,
        'imgsz': 640,
        'save_period': -1,
        'workers': 0,
        'exist_ok': False,
        'project': 'CHD_Train',
        'name': CHD_Name + '_Train',
        'device': 0,
        'pretrained': True,
        'augment': True,
        } 


    # Function for getting all path in folder
    def get_image_path(self, dataset_train_path):
        image_paths = []
        # Go Through all files
        for root, dirs, files in os.walk(dataset_train_path):
            for file in files:
                # Check picture extension type
                if file.endswith(('.jpg', '.jpeg', '.png', '.bmp', '.gif')):
                    # store completed data path
                    image_paths.append(os.path.join(root, file))
        return image_paths
    
    # Function for recreate dir
    def clear_and_create_dir(self, directory):
        if os.path.exists(directory):
            shutil.rmtree(directory)
        os.makedirs(directory, exist_ok=True)

class PA_preprocess(PA_init):
    # init
    def __init__(self, CHD_Name):    
        super().__init__(CHD_Name)
        # change dataset path in .yaml
        change_yaml_path(self.data_yaml, CHD_Name)

    # Function for resize image into 640x640
    def CHD_resize(self, CHD_directory):
        # Get all files in the folder path
        files = os.listdir(CHD_directory)
        for file_name in files:
            if file_name.endswith(('.jpg', '.jpeg', '.png')):
                # Get file path
                file_path = os.path.join(CHD_directory, file_name)
                # Open the image
                cond = Image.open(file_path) # local image
                # Get the current dimensions
                width, height = cond.size
                # Resize
                shrink_percent = 640 / max(width, height)
                width = int(width * shrink_percent)
                height = int(height * shrink_percent)
                cond = cond.resize((width, height), Image.LANCZOS)

                # Create a new background image with white color
                new_img = Image.new("RGB", (640, 640), (255, 255, 255))

                # Paste the original image onto the center of the new background
                x_offset = (640 - width) // 2
                y_offset = (640 - height) // 2
                new_img.paste(cond, (x_offset, y_offset))
                new_img.save(file_path)
                print(f'Processed {file_name} and saved as resized_{file_name}')

    # Function for CHD_sketch
    def CHD_sketch(self, CHD_directory):
        files = os.listdir(CHD_directory)
        for file_name in files:
            if file_name.lower().endswith('.png') or file_name.lower().endswith('.jpg'):
                file_path = os.path.join(CHD_directory, file_name)
                # sketch for basic preprocess
                grayImage = cv2.imread(file_path,0)
                gaussianImage = cv2.GaussianBlur(grayImage, (3, 3), 0)
                # save for canny image
                edgeImage = 255 - cv2.Canny(gaussianImage, 50, 100)
                output_file_name_canny = f'{os.path.splitext(file_name)[0]}_SK_0.{file_name.split(".")[-1]}'
                output_file_path = os.path.join(CHD_directory, output_file_name_canny)
                cv2.imwrite(output_file_path, edgeImage)
                # save for laplacian image
                laplacian = cv2.Laplacian(gaussianImage, cv2.CV_64F, ksize=3)
                laplacianImage = np.uint8(np.absolute(laplacian))
                laplacianImage = 255 - laplacianImage
                output_file_name = f'{os.path.splitext(file_name)[0]}_SK_1.{file_name.split(".")[-1]}'
                output_file_path = os.path.join(CHD_directory, output_file_name)
                cv2.imwrite(output_file_path, laplacianImage)

                print("CHD to Sketch OK!!")

    # Function for Data Augmentation
    def CHD_augmentation(self, CHD_directory, output_directory, num_augmented_images):
        # get all files in this folder
        files = os.listdir(CHD_directory)
        # augmentate each file in files x times 
        for file_name in files:
            # check file is .png or .jpg
            if file_name.lower().endswith('.png') or file_name.lower().endswith('.jpg'):
                file_path = os.path.join(CHD_directory, file_name)
                # open image
                img = Image.open(file_path)
                
                # generate x times augmentation data
                for i in range(num_augmented_images):
                    augmented_img = img.copy()
                    
                    # random augmentattion operation, first layer
                    augment_type = random.choice(['rotate', 'flip', 'brightness', 'contrast', 'translate', 'crop', 'affine'])
                    # second layer
                    gray_type = random.choices(['raw', 'grayscale'], weights=[0.5, 0.5])[0]
                    
                    # adjust rotation
                    if augment_type == 'rotate':
                        angle = random.randint(-45, 45)
                        augmented_img = augmented_img.rotate(angle)
                    
                    # adjust flip
                    elif augment_type == 'flip':
                        augmented_img = ImageOps.mirror(augmented_img)
                    
                    # adjust brightness
                    elif augment_type == 'brightness':
                        factor = random.uniform(0.5, 1.5)
                        enhancer = ImageEnhance.Brightness(augmented_img)
                        augmented_img = enhancer.enhance(factor)
                    
                    # adjust contrast
                    elif augment_type == 'contrast':
                        factor = random.uniform(0.5, 1.5)
                        enhancer = ImageEnhance.Contrast(augmented_img)
                        augmented_img = enhancer.enhance(factor)

                    # adjust position
                    elif augment_type == 'translate':
                        dx = random.randint(-200, 200)
                        dy = random.randint(-10, 10)
                        augmented_img = ImageChops.offset(augmented_img, dx, dy)
                    
                    # adjust object size
                    elif augment_type == 'crop':
                        width, height = augmented_img.size
                        left = random.randint(0, width // 4)
                        top = random.randint(0, height // 4)
                        right = width - random.randint(0, width // 4)
                        bottom = height - random.randint(0, height // 4)
                        augmented_img = augmented_img.crop((left, top, right, bottom))
                        augmented_img = augmented_img.resize((width, height))
                    
                    # adjust position,rotate
                    elif augment_type == 'affine':
                        matrix = [1, 0, random.randint(-200, 200), 0, 1, random.randint(-10, 10)]
                        augmented_img = augmented_img.transform(img.size, Image.AFFINE, matrix)

                    # Color Arrange
                    if gray_type == 'raw':
                        pass
                    # gray
                    else:
                        augmented_img = augmented_img.convert('L')

                    # save image after augmentating
                    output_file_name = f'{os.path.splitext(file_name)[0]}_aug_{i}.{file_name.split(".")[-1]}'
                    output_file_path = os.path.join(output_directory, output_file_name)
                    augmented_img.save(output_file_path)

                    print(f'Saved augmented image: {output_file_name}')
                    
    # Function for split data from A dir to B dir with test,train,valid
    def split_dataset(self, sorceImage_dir, dataset_train_dir, train_ratio, test_ratio, valid_ratio):
        # check sum of proportion equals 1
        assert train_ratio + test_ratio + valid_ratio == 1.0, "The sum of the ratios must be 1.0"

        # get all names of images
        image_files = [f for f in os.listdir(sorceImage_dir) if os.path.isfile(os.path.join(sorceImage_dir, f))]
        
        # shuffle images
        random.shuffle(image_files)
        
        # count numbers of images in every folder
        total_images = len(image_files)
        train_count = int(total_images * train_ratio)
        test_count = int(total_images * test_ratio)
        valid_count = total_images - train_count - test_count
        
        # create ouput folders
        train_image_dir = os.path.join(dataset_train_dir, 'train/images')
        test_image_dir = os.path.join(dataset_train_dir, 'test/images')
        valid_image_dir = os.path.join(dataset_train_dir, 'valid/images')
        os.makedirs(train_image_dir, exist_ok=True)
        os.makedirs(test_image_dir, exist_ok=True)
        os.makedirs(valid_image_dir, exist_ok=True)
        
        # split images and transparent them without delete
        for i, file in enumerate(image_files):
            if i < train_count:
                shutil.copy(os.path.join(sorceImage_dir, file), os.path.join(train_image_dir, file))
            elif i < train_count + test_count:
                shutil.copy(os.path.join(sorceImage_dir, file), os.path.join(test_image_dir, file))
            else:
                shutil.copy(os.path.join(sorceImage_dir, file), os.path.join(valid_image_dir, file))
        
        print(f"Total images: {total_images}")
        print(f"Train images: {train_count}")
        print(f"Test images: {test_count}")
        print(f"Validation images: {valid_count}")

    # PA_preprocess Main process
    def main(self):
        # Data Preprocess
        self.CHD_resize(self.image_dir)
        import zero123_stable_api
        zero123_stable_api.main(self.image_dir)
        self.CHD_resize(self.image_dir)
        self.CHD_sketch(self.image_dir)
        self.CHD_augmentation(self.image_dir,self.image_augmentation_outputdir,10)
        self.split_dataset(self.image_dir, self.dataset_train_dir, self.train_ratio, self.test_ratio, self.valid_ratio)
        self.split_dataset(self.image_augmentation_outputdir, self.dataset_train_dir, self.train_ratio, self.test_ratio, self.valid_ratio) 

class PA_train(PA_init):
    # init
    def __init__(self, CHD_Name):    
        super().__init__(CHD_Name)

    # Function for move all files in one folder to another
    def move_noCHFiles(self, sorce_dir, destination_dir):
        source_images = sorce_dir + "/images"
        destination_images = destination_dir + "/images"
        source_labels = sorce_dir + "/labels"
        destination_labels = destination_dir + "/labels"
        # For move noCH images to training datasets
        files = [f for f in os.listdir(source_images) if os.path.isfile(os.path.join(source_images, f))]
        for i, file in enumerate(files):
            shutil.copy(os.path.join(source_images, file), os.path.join(destination_images, file))
        # For move noCH labels to training datasets
        files = [f for f in os.listdir(source_labels) if os.path.isfile(os.path.join(source_labels, f))]
        for i, file in enumerate(files):
            shutil.copy(os.path.join(source_labels, file), os.path.join(destination_labels, file))

    # Function for labeling CHD images in test,train,valid folder in datasets
    def auto_label(self, dataset_train_path, label_model_fullbody, label_head):
        # Load YOLOv8 model
        fullbody_model = YOLO(label_model_fullbody)
        head_model = YOLO(label_head)
        images_dir = os.path.join(dataset_train_path, 'images')
        labels_dir = os.path.join(dataset_train_path, 'labels')
        image_paths = self.get_image_path(images_dir)
        # Create dataset_trains directory if it doesn't exist
        os.makedirs(labels_dir, exist_ok=True)

        print(self, image_paths)
        # Get predictions for each image
        for image_path in image_paths:
            # Predict with the model
            results_fullbody = fullbody_model(source=image_path)
            results_head = head_model(source=image_path)
            # Get the file name without extension
            image_name = os.path.splitext(os.path.basename(image_path))[0]
            # Generate label txt file
            dataset_train_file = os.path.join(labels_dir, f'{image_name}.txt')
            with open(dataset_train_file, 'w') as f:
                # for labeling fullbody
                for result in results_fullbody:
                    for box in result.boxes:
                        if box.conf > 0.5:
                            # Generate Label
                            class_id = int(box.cls.item())  # Get Class ID
                            x_center, y_center, width, height = box.xywhn[0].tolist()  # Get square area
                            # Write labels into label txt file
                            f.write(f"{class_id} {x_center} {y_center} {width} {height}\n")
                # for labeling head
                for result in results_head:
                    for box in result.boxes:
                        if box.conf > 0.5:
                            class_id = int(box.cls.item())
                            x_center, y_center, width, height = box.xywhn[0].tolist()  # Get square area
                            f.write(f"{class_id} {x_center} {y_center} {width} {height}\n")
                # for labeling background
                class_id = 2
                f.write(f"{class_id} 0.5 0.5 1 1\n")

    # Function for train CHD_model with completely prepared dataset in auto_label
    def auto_training(self, model_contruction,pretrained_model, train_params):
        # Load Pretrained model
        model = CustomYOLO(model_contruction).load(pretrained_model)
        # Train the model
        results = model.train(**train_params)
        print("====Finish Training====")
        CHD_model_path = str(results.save_dir) + "\\weights\\best.pt"
        return CHD_model_path
    
    # Function for getting a new file name if the names were the same
    def get_new_file_path(file_path):
        base, ext = os.path.splitext(file_path)
        i = 1
        new_file_path = file_path
        while os.path.exists(new_file_path):
            new_file_path = f"{base}({i}){ext}"
            i += 1
        return new_file_path
    
    # PA_train Main process
    def main(self):
        # RPA Labeling
        self.auto_label(self.dataset_train_train, self.label_fullbody, self.label_head)
        self.auto_label(self.dataset_train_test, self.label_fullbody, self.label_head)
        self.auto_label(self.dataset_train_valid, self.label_fullbody, self.label_head)
        # Add noCH into datasets
        self.move_noCHFiles(self.dataset_train_noCH_train, self.dataset_train_train)
        self.move_noCHFiles(self.dataset_train_noCH_test, self.dataset_train_test)
        self.move_noCHFiles(self.dataset_train_noCH_valid, self.dataset_train_valid)
        # Train
        CHD_model_path = self.auto_training(self.model_contruction, self.pretrained_model, self.train_params)
        # rename and move .pt
        CHD_modelpt =  self.CHD_modelpt
        if os.path.exists(CHD_modelpt):
            CHD_modelpt = self.get_new_file_path(CHD_modelpt)
        os.rename(CHD_model_path, CHD_modelpt)
        print("Successful Model:" + CHD_modelpt)
        return CHD_modelpt 

class Upload_images(PA_init):
    def __init__(self, CHD_Name):
        super().__init__(CHD_Name)
        # create dir
        os.makedirs(self.CHD_modeldir, exist_ok=True)
        os.makedirs(self.image_dir, exist_ok=True)
        os.makedirs(self.CHD_Detect, exist_ok=True)
        self.clear_and_create_dir(self.image_augmentation_outputdir)
        self.clear_and_create_dir(self.dataset_train_dir)
    
    def receive_images(self, file_paths):
        # input CHD images from uploads
        for file_path in file_paths:
            image_basename = os.path.basename(file_path)
            new_image_path = os.path.join(self.image_dir, image_basename)
            shutil.copy(file_path, new_image_path)
        # input a CHD image preparing for segmentation
        image_basename = os.path.basename(file_paths[0])
        new_image_path = os.path.join(self.CHD_Detect, image_basename)
        shutil.copy(file_path, new_image_path)
        
# Function for change autoTrain.yaml along with user input CHD_Name
def change_yaml_path(data_yaml, newpath):
    import ruamel.yaml
    # read original YAML and keep raw orders
    yaml = ruamel.yaml.YAML()
    yaml.indent(mapping=2, sequence=4, offset=2)
    with open(data_yaml, 'r') as file:
        data = yaml.load(file)
    # Get present absolute path
    current_directory = os.getcwd()
    # rewrite path
    data['path'] = current_directory + "/datasets/" + newpath
    # rewrite all data into YAML and still in the former orders
    with open(data_yaml, 'w') as file:
        yaml.dump(data, file)
    print("YAML file updated successfully.")

# Function for main process
def main(CHD_Name, file_paths):
    Up_img = Upload_images(CHD_Name)
    Up_img.receive_images(file_paths)
    PA_pre = PA_preprocess(CHD_Name)
    PA_tra = PA_train(CHD_Name)
    PA_pre.main()
    CHD_modelpt = PA_tra.main()
    return CHD_modelpt



# Run this .py for main file must run this
if __name__ == "__main__":
    # some adjustments by pigg--
    if len(sys.argv) != 3:
        print("Usage: python PA_autoTraing_v7.py <CHD_name> <image_path>")
        sys.exit(1)

    CHD_name = sys.argv[1]
    image_path = sys.argv[2]
    print(image_path)
    main(CHD_name, image_path)
    # 'til here