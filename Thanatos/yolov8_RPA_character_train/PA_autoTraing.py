import os
import shutil
import random
from ultralytics import YOLO
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
    os.makedirs(train_image_dir, exist_ok=True)
    os.makedirs(test_image_dir, exist_ok=True)
    os.makedirs(valid_image_dir, exist_ok=True)
    
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

def auto_label(annotations_path, label_model):
    # Load YOLOv8 model
    model_detect = YOLO(label_model)

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
        results = model_detect(source=image_path)
        # Get the file name without extension
        image_name = os.path.splitext(os.path.basename(image_path))[0]
        # Generate label txt file
        annotation_file = os.path.join(labels_dir, f'{image_name}.txt')
        print(image_path)
        for result in results:
            with open(annotation_file, 'w') as f:
                for box in result.boxes:
                    # Generate Label
                    class_id = int(box.cls.item())  # Get Class ID
                    x_center, y_center, width, height = box.xywhn[0].tolist()  # Get square area
                    # Write labels into label txt file
                    f.write(f"{class_id} {x_center} {y_center} {width} {height}\n")

def auto_training(pretrain_model,_yaml,_epochs):
    # Load Pretrained model
    model = YOLO(pretrain_model)

    # Train the model using the 'coco8.yaml' dataset for 3 epochs
    results = model.train(data=_yaml, epochs=_epochs, workers=0)

    # Evaluate the model's performance on the validation set
    results = model.val()

    # Export the model to ONNX format
    success = model.export(format='onnx')

def __init__():
    global image_dir, annotation_dir, train_ratio, test_ratio, valid_ratio,\
        annotation_train, annotation_test, annotation_valid, label_model, pretrain_model,\
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
    label_model = "model/animePerson.pt"  # predict model for use

    # variables for function auto_training
    pretrain_model = "model/yolov8s.pt" # pretrain model for use
    _yaml = "yaml/autoTrain.yaml"  # .yaml file for train
    _epochs = 200   # how many steps

def main():
    __init__()
    split_dataset(image_dir, annotation_dir, train_ratio, test_ratio, valid_ratio)
    auto_label(annotation_train, label_model)
    auto_label(annotation_test, label_model)
    auto_label(annotation_valid, label_model)
    auto_training(pretrain_model, _yaml, _epochs)

if __name__ == "__main__":
    main()
if not os.path.exists(pretrain_model):
        raise FileNotFoundError(f"The specified pretrain model file does not exist: {pretrain_model}")