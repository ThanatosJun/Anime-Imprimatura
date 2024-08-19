"""
Reference:
1.CHD_Name.pt from PA_autoTraing_v3.py
2.CHD_Name from front END
Return:
Features:
1.Use CHD_Name.pt model to detect MainCharacter in CHS and move these CHS to CHD_Detect/CHD_Name
"""
from ultralytics import YOLO
import shutil
import os
import sys

# Function for detect 
def CHS_detect(model_path, CHS_dir):
    # load CHD_Name.pt for predict
    # model_detect = YOLO(model_path)
    model_detect = YOLO(model_path)
    
    # predict
    results = model_detect.predict(
        source = CHS_dir,  #predict folder
        save = False,   # do not save
        workers=0   # single thread
        )
    return results

# Function for save correct CHS in CHD_Detect/CHD_Name/
def CHS_save(results, CHD_Name):
    CHS_yes = False
    file_path = "CHS_Detect/" + CHD_Name
    #   for each result of an image
    for result in results:
        # for each confidence of a detected box in an image
        for box in result.boxes:
            #   if there is a confidence from a box > 0.9, this image will be saved
            if box.cls.item() == 0 and box.conf.item() > 0.9 and CHS_yes == False:
                path = result.path
                shutil.move(path, file_path)
                print(path)
                CHS_yes = True
        CHS_yes = False
    #   return CHD_Detect/CHD_Name dir path
    return file_path

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

# Function for main process
def main(CHD_Name, image_path):
    os.makedirs("CHS_Detect/" + CHD_Name, exist_ok = True)  # create folder for save correct CHS
    CHS_Dir = "CHS/" + CHD_Name
    os.makedirs(CHS_Dir, exist_ok = True)
    
    # input image from uploads
    for file_path in image_path:
        image_basename = os.path.basename(file_path)
        new_image_path = os.path.join(CHS_Dir, image_basename)
        shutil.copy(file_path, new_image_path)
    model_path = "CHD_Model/" + CHD_Name + ".pt"
    results = CHS_detect(model_path, CHS_dir = CHS_Dir)    # detect
    CHS_save_dir = CHS_save(results, CHD_Name)  # save CHS

    # CHS_save_dir = CHS_save(results, CHD_Name)  # save CHS
    # CHS_relist = get_image_path(CHS_save_dir)
    
    return CHS_save_dir # let Next part keep continuous

# Run this .py for main file must run this
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python CHD_detect.py <CHD_name> <image_path>")
        sys.exit(1)

    CHD_name = sys.argv[1]
    image_path = sys.argv[2]

    main(CHD_name, image_path)