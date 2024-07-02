import os
import shutil
import random
import cv2
from PIL import Image, ImageEnhance, ImageOps
from ultralytics import YOLO
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

def CHD_augmentation(CHD_directory, output_directory, num_augmented_images):
    # 獲取資料夾中的所有文件
    files = os.listdir(CHD_directory)
    
    # 確保輸出目錄存在，如果不存在則創建它
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
    
    for file_name in files:
        # 檢查文件是否是 PNG 或 JPG 圖片
        if file_name.lower().endswith('.png') or file_name.lower().endswith('.jpg'):
            file_path = os.path.join(CHD_directory, file_name)
            
            # 打開圖像
            img = Image.open(file_path)
            
            # 生成指定數量的資料擴增圖像
            for i in range(num_augmented_images):
                augmented_img = img.copy()
                
                # 隨機選擇資料擴增操作
                augment_type = random.choice(['rotate', 'flip', 'brightness', 'contrast'])
                gray_type = random.choices(['raw', 'grayscale', 'sketch'], weights=[0.7, 0.2, 0.1])[0]
                
                # 旋轉圖像
                if augment_type == 'rotate':
                    angle = random.randint(-45, 45)
                    augmented_img = augmented_img.rotate(angle)
                
                # 翻轉圖像
                elif augment_type == 'flip':
                    augmented_img = ImageOps.mirror(augmented_img)
                
                # 調整亮度
                elif augment_type == 'brightness':
                    factor = random.uniform(0.5, 1.5)
                    enhancer = ImageEnhance.Brightness(augmented_img)
                    augmented_img = enhancer.enhance(factor)
                
                # 調整對比度
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

                # 保存資料擴增後的圖像
                output_file_name = f'{os.path.splitext(file_name)[0]}_aug_{i}.{file_name.split(".")[-1]}'
                output_file_path = os.path.join(output_directory, output_file_name)
                augmented_img.save(output_file_path)
                
                print(f'Saved augmented image: {output_file_name}')

def clear_and_create_dir(directory):
    if os.path.exists(directory):
        shutil.rmtree(directory)
    os.makedirs(directory, exist_ok=True)

def split_dataset(image_dir, annotation_dir, train_ratio=0.8, test_ratio=0.1, valid_ratio=0.1):
    # 確認比例總和為1
    assert train_ratio + test_ratio + valid_ratio == 1.0, "The sum of the ratios must be 1.0"

    # 獲取所有圖片文件名
    image_files = [f for f in os.listdir(image_dir) if os.path.isfile(os.path.join(image_dir, f))]
    
    # 打亂圖片文件順序
    random.shuffle(image_files)
    
    # 計算各資料夾的圖片數量
    total_images = len(image_files)
    train_count = int(total_images * train_ratio)
    test_count = int(total_images * test_ratio)
    valid_count = total_images - train_count - test_count
    
    # 創建輸出資料夾
    train_image_dir = os.path.join(annotation_dir, 'train/images')
    test_image_dir = os.path.join(annotation_dir, 'test/images')
    valid_image_dir = os.path.join(annotation_dir, 'valid/images')
    clear_and_create_dir(train_image_dir)
    clear_and_create_dir(test_image_dir)
    clear_and_create_dir(valid_image_dir)
    
    # 分割數據並移動文件
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

def get_image_path(annotation_path):
    image_paths = []
    # Go Through all files
    for root, dirs, files in os.walk(annotation_path):
        for file in files:
            # Check picture extension type
            if file.endswith(('.jpg', '.jpeg', '.png', '.bmp', '.gif')):
                # store completed data path
                image_paths.append(os.path.join(root, file))
    return image_paths

def auto_label(annotations_path, label_model_fullbody, label_model_head):
    # Load YOLOv8 model
    fullbody_model = YOLO(label_model_fullbody)
    head_model = YOLO(label_model_head)
    images_dir = os.path.join(annotations_path, 'images')
    labels_dir = os.path.join(annotations_path, 'labels')
    image_paths = get_image_path(images_dir)
    # Create annotations directory if it doesn't exist
    os.makedirs(labels_dir, exist_ok=True)

    print(image_paths)
    # Get predictions for each image
    for image_path in image_paths:
        # Predict with the model
        print(image_path)
        results_fullbody = fullbody_model(source=image_path)
        results_head = head_model(source=image_path)
        # Get the file name without extension
        image_name = os.path.splitext(os.path.basename(image_path))[0]
        # Generate label txt file
        annotation_file = os.path.join(labels_dir, f'{image_name}.txt')
        print(image_path)
        with open(annotation_file, 'w') as f:
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
        

def auto_training(pretrain_model,_yaml,_epochs, output_dir):
    # Load Pretrained model
    model = YOLO("yolov8s.yaml").load(pretrain_model)

    # Train the model using the 'coco8.yaml' dataset for 3 epochs
    results = model.train(data=_yaml, epochs=_epochs, workers=0, save_dir=output_dir)

    # Evaluate the model's performance on the validation set
    results = model.val()

    # Export the model to ONNX format
    success = model.export(format='onnx')

def __init__():
    global image_dir, annotation_dir, train_ratio, test_ratio, valid_ratio,\
        annotation_train, annotation_test, annotation_valid, label_fullbody, label_model_head, pretrain_model,\
        _yaml, _epochs
    image_dir = "TempImage" # Image File path for split
    annotation_dir = "datasets/tempDatasets" # split into this path
    train_ratio = 0.8 # 80% images for training
    test_ratio = 0.1 # 10% images for testing
    valid_ratio = 0.1 # 10% images for valid

    # variables for function get_image_path and auto_label
    annotation_train = annotation_dir + "/train"    # waiting for labeling images in train file
    annotation_test = annotation_dir + "/test"  # waiting for labeling images in test file
    annotation_valid = annotation_dir + "/valid" # waiting for labeling images in valid file
    label_fullbody = "model_CHD/CHD_fullbody.pt"  # predict model for predicting fullbody
    label_model_head = "model_CHD/CHD_head_AI.pt"   # predict model for predicting head

    # variables for function auto_training
    pretrain_model = "model/yolov8s.pt" # pretrain model for use
    _yaml = "yaml/autoTrain.yaml"  # .yaml file for train
    _epochs = 200   # how many steps

def main():
    __init__()
    CHD_resize(image_dir)
    CHD_augmentation("TempImage","OutputImage",5)
    split_dataset(image_dir, annotation_dir, train_ratio, test_ratio, valid_ratio)
    auto_label(annotation_train, label_fullbody, label_model_head)
    auto_label(annotation_test, label_fullbody, label_model_head)
    auto_label(annotation_valid, label_fullbody, label_model_head)
    auto_training(pretrain_model, _yaml, _epochs)

if __name__ == "__main__":
    main()
if not os.path.exists(pretrain_model):
        raise FileNotFoundError(f"The specified pretrain model file does not exist: {pretrain_model}")