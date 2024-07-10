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
from PIL import Image, ImageEnhance, ImageOps
from ultralytics import YOLO
import wonder3d_api

# Function for resize image into 640x640
def CHD_resize(CHD_directory):
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
            if(width > 640 or height > 640):
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

# Function for Data Augmentation
def CHD_augmentation(CHD_directory, output_directory, num_augmented_images):
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
                augment_type = random.choice(['rotate', 'flip', 'brightness', 'contrast'])
                # second layer
                gray_type = random.choices(['raw', 'grayscale', 'sketch'], weights=[0.3, 0.6, 0.1])[0]
                
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

                # Color Arrange
                if gray_type == 'raw':
                    pass
                
                # gray
                elif gray_type == 'grayscale':
                    augmented_img = augmented_img.convert('L')
                
                # sketch
                elif gray_type == 'sketch':
                    grayImage = cv2.imread(file_path,0)
                    gaussianImage = cv2.GaussianBlur(grayImage, (3, 3), 0)
                    edgeImage = 255 - cv2.Canny(gaussianImage, 50, 100)
                    # Store Sketch
                    output_file_name = f'{os.path.splitext(file_name)[0]}_aug_SK.{file_name.split(".")[-1]}'
                    output_file_path = os.path.join(output_directory, output_file_name)
                    cv2.imwrite(output_file_path, edgeImage)

                # save image after augmentating
                output_file_name = f'{os.path.splitext(file_name)[0]}_aug_{i}.{file_name.split(".")[-1]}'
                output_file_path = os.path.join(output_directory, output_file_name)
                augmented_img.save(output_file_path)
                
                print(f'Saved augmented image: {output_file_name}')

# Function for recreate dir
def clear_and_create_dir(directory):
    if os.path.exists(directory):
        shutil.rmtree(directory)
    os.makedirs(directory, exist_ok=True)

# Function for split data from A dir to B dir with test,train,valid
def split_dataset(image_dir, dataset_train_dir, train_ratio, test_ratio, valid_ratio):
    # check sum of proportion equals 1
    assert train_ratio + test_ratio + valid_ratio == 1.0, "The sum of the ratios must be 1.0"

    # get all names of images
    image_files = [f for f in os.listdir(image_dir) if os.path.isfile(os.path.join(image_dir, f))]
    
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
            shutil.copy(os.path.join(image_dir, file), os.path.join(train_image_dir, file))
        elif i < train_count + test_count:
            shutil.copy(os.path.join(image_dir, file), os.path.join(test_image_dir, file))
        else:
            shutil.copy(os.path.join(image_dir, file), os.path.join(valid_image_dir, file))
    
    print(f"Total images: {total_images}")
    print(f"Train images: {train_count}")
    print(f"Test images: {test_count}")
    print(f"Validation images: {valid_count}")

# Function for getting all path in folder
def get_image_path(dataset_train_path):
    image_paths = []
    # Go Through all files
    for root, dirs, files in os.walk(dataset_train_path):
        for file in files:
            # Check picture extension type
            if file.endswith(('.jpg', '.jpeg', '.png', '.bmp', '.gif')):
                # store completed data path
                image_paths.append(os.path.join(root, file))
    return image_paths

# Function for labeling CHD images in test,train,valid folder in datasets
def auto_label(dataset_train_path, label_model_fullbody, label_model_head):
    # Load YOLOv8 model
    fullbody_model = YOLO(label_model_fullbody)
    head_model = YOLO(label_model_head)
    images_dir = os.path.join(dataset_train_path, 'images')
    labels_dir = os.path.join(dataset_train_path, 'labels')
    image_paths = get_image_path(images_dir)
    # Create dataset_trains directory if it doesn't exist
    os.makedirs(labels_dir, exist_ok=True)

    print(image_paths)
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
            for result in results_fullbody:
                for box in result.boxes:
                    # Generate Label
                    class_id = int(box.cls.item())  # Get Class ID
                    x_center, y_center, width, height = box.xywhn[0].tolist()  # Get square area
                    # Write labels into label txt file
                    f.write(f"{class_id} {x_center} {y_center} {width} {height}\n")
            for result in results_head:
                for box in result.boxes:
                    class_id = int(box.cls.item())
                    x_center, y_center, width, height = box.xywhn[0].tolist()  # Get square area
                    f.write(f"{class_id} {x_center} {y_center} {width} {height}\n")
        # for face label       

# Function for train CHD_model with completely prepared dataset in auto_label
def auto_training(pretrain_model, train_params):
    # Load Pretrained model
    model = YOLO("yolov8n.yaml").load(pretrain_model)
    # Train the model
    results = model.train(**train_params)

    # Export the model to ONNX format
    onnxCHD_model_path = model.export(
        format='onnx',
        int8 = True,
        dynamic = True
        )
    CHD_model_path = str(results.save_dir) + "\\weights\\best.pt"
    return CHD_model_path , onnxCHD_model_path

# Function for moving model dir
# def move_model(source_path, destination_path):
#     # check source
#     if not os.path.exists(source_path):
#         print(f"Source path {source_path} does not exist.")
#         return
    
#     # make sure dir exist
#     if not os.path.exists(destination_path):
#         os.makedirs(destination_path)
    
#     # make sure source file name
#     model_filename = os.path.basename(source_path)
    
#     # make sure completed source file path
#     destination_file_path = os.path.join(destination_path, model_filename)
    
#     # move file
#     shutil.move(source_path, destination_file_path)
#     print(f"Model moved from {source_path} to {destination_file_path}")

# Function for change autoTrain.yaml along with user input CHD_Name
def change_yaml_path(data_yaml, newpath):
    import ruamel.yaml
    # read original YAML and keep raw orders
    yaml = ruamel.yaml.YAML()
    yaml.indent(mapping=2, sequence=4, offset=2)

    with open(data_yaml, 'r') as file:
        data = yaml.load(file)

    # rewrite path
    data['path'] = newpath

    # rewrite all data into YAML and still in the former orders
    with open(data_yaml, 'w') as file:
        yaml.dump(data, file)

    print("YAML file updated successfully.")

# Function for initialize variables and datas
def __init__(CHD_Name):
    # global variables
    global image_dir, dataset_train_dir, train_ratio, test_ratio, valid_ratio, image_augmentation_outputdir, train_params, CHD_modeldir,\
        dataset_train_train, dataset_train_test, dataset_train_valid, label_fullbody, label_model_head, pretrain_model
    image_dir = "CHD_Images/" + CHD_Name + "_Images" # Image File path for split
    image_augmentation_outputdir = "CHD_Images/" + CHD_Name + "_AugImages" # Image after augmentated
    dataset_train_dir = "datasets/" + CHD_Name # split into this path
    train_ratio = 0.8 # 80% images for training
    test_ratio = 0.1 # 10% images for testing
    valid_ratio = 0.1 # 10% images for valid
    CHD_modeldir = "CHD_Model" # trained model for detect maincharacter

    # variables for function get_image_path and auto_label
    dataset_train_train = dataset_train_dir + "/train"    # waiting for labeling images in train file
    dataset_train_test = dataset_train_dir + "/test"  # waiting for labeling images in test file
    dataset_train_valid = dataset_train_dir + "/valid" # waiting for labeling images in valid file
    label_fullbody = "model_CHD/CHD_fullbody.pt"  # predict model for predicting fullbody
    label_model_head = "model_CHD/CHD_head_AI.pt"   # predict model for predicting head

    # variables for function auto_training
    pretrain_model = "model_CHD/yolov8n.pt" # pretrain model for use
    # training yaml
    data_yaml = "CHD_yaml/autoTrain.yaml"
    # change dataset path in .yaml
    change_yaml_path(data_yaml, CHD_Name)
    # training parameters
    train_params = {
    'data': data_yaml,
    'epochs': 100,
    'batch': -1,
    'imgsz': 640,
    'save_period': -1,
    'workers': 0,
    'exist_ok': True,
    'project': 'CHD_Train',
    'name': CHD_Name + '_Train',
    'device': 0,
    }

# Function for main process
def main(CHD_Name):
    __init__(CHD_Name) # initialize
    # create dir
    os.makedirs(CHD_modeldir, exist_ok=True)
    os.makedirs(image_dir, exist_ok=True)
    clear_and_create_dir(image_augmentation_outputdir)
    clear_and_create_dir(dataset_train_dir)
    # Data Preprocess
    CHD_resize(image_dir)
    wonder3d_api.generate(image_dir)
    CHD_resize(image_dir)
    CHD_augmentation(image_dir,image_augmentation_outputdir,5)
    split_dataset(image_dir, dataset_train_dir, train_ratio, test_ratio, valid_ratio)
    split_dataset(image_augmentation_outputdir, dataset_train_dir, train_ratio, test_ratio, valid_ratio)
    # RPA Labeling
    auto_label(dataset_train_train, label_fullbody, label_model_head)
    auto_label(dataset_train_test, label_fullbody, label_model_head)
    auto_label(dataset_train_valid, label_fullbody, label_model_head)
    # Train
    CHD_model_path, onnxCHD_model_path = auto_training(pretrain_model,train_params)
    # rename and move .pt and .onnx
    CHD_modelpt =  CHD_modeldir + "\\" + CHD_Name + ".pt"
    CHD_modelonnx =  CHD_modeldir + "\\" + CHD_Name + ".onnx"
    os.rename(CHD_model_path, CHD_modelpt)
    os.rename(onnxCHD_model_path, CHD_modelonnx )
    # move_model(CHD_model_path, CHD_modelpt)
    # move_model(onnxCHD_model_path, CHD_modelonnx)
    return CHD_modelpt

# Function for get .pt path for detetion
def re_ptmodel_path(CHD_Name):
    __init__(CHD_Name)
    return CHD_modeldir + "\\" + CHD_Name + ".pt"

# Run this .py for main file must run this
if __name__ == "__main__":
    main(CHD_Name="Anime001")