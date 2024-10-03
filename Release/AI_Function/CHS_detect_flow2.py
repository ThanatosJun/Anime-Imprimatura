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
# Function for recreate dir
def clear_and_create_dir(directory):
    if os.path.exists(directory):
        shutil.rmtree(directory)
    os.makedirs(directory, exist_ok=True)
class CHS_Detect():
    def __init__(self, CHD_Name, User_ID):
        self.CHD_Name = os.path.splitext(CHD_Name)[0]
        self.CHD_Detect_dir = os.path.join("CHD_Detect", self.CHD_Name)
        self.CHS_dir = os.path.join("CHS", self.CHD_Name)
        self.CHS_Detect_dir = os.path.join("CHS_Detect", self.CHD_Name)
        self.model_path = os.path.join("CHD_Model", User_ID, self.CHD_Name + ".pt")

    # Function for detect 
    def CHS_detect(self, model_path, CHS_dir):
        # load CHD_Name.pt for predict
        model_detect = YOLO(model_path)
        print(f"CHS_dir = {CHS_dir}")
        print(f"self.CHS_dir = {self.CHS_dir}")
        # predict
        results = model_detect.predict(
            source = CHS_dir,  #predict folder
            save = False,   # do not save
            workers=0   # single thread
            )
        return results

    # Function for save correct CHS in CHS_Detect/CHD_Name/
    def CHS_save(self, results, CHS_save_dir):
        CHS_yes = False
        #   for each result of an image
        for result in results:
            # for each confidence of a detected box in an image
            for box in result.boxes:
                #   if there is a confidence from a box > 0.9, this image will be saved
                if box.cls.item() == 0 and box.conf.item() > 0.5 and CHS_yes == False:
                    path = result.path
                    shutil.move(path, CHS_save_dir)
                    CHS_yes = True
            CHS_yes = False

    def main(self, CHD_upload_image_path, CHS_upload_image_path):
        clear_and_create_dir(self.CHS_dir)
        clear_and_create_dir(self.CHS_Detect_dir)  # create folder for save correct CHS
        CH_Upload(CHD_upload_image_path, self.CHD_Detect_dir)
        CH_Upload(CHS_upload_image_path, self.CHS_dir)
        results = self.CHS_detect(self.model_path, self.CHS_dir)    # detect
        self.CHS_save(results, self.CHS_save_dir)  # save CHS
        return self.CHS_save_dir
    
def CH_Upload(input_dir_path, store_dir_path):
    i = 1
    # input image from uploads
    for file_path in input_dir_path:
        image_basename = os.path.basename(file_path)
        new_image_path = os.path.join(store_dir_path, image_basename)
        shutil.copy(file_path, new_image_path)
        print(f"{i}:move {file_path} to {store_dir_path}\n")
        i+=1 

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
def main(CHD_Name, CHD_upload_image_path, CHS_upload_image_path, User_ID):
    CHS_detect = CHS_Detect(CHD_Name, User_ID)
    CHS_save_dir = CHS_detect.main(CHD_upload_image_path, CHS_upload_image_path)
    print("Finish SAVE CHS\n")
    
    return "AI_Function/" + CHS_save_dir # let Next part keep continuous

# Run this .py for main file must run this
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python CHD_detect.py <CHD_name> <image_path>")
        sys.exit(1)
    print("====1====")
    CHD_name = sys.argv[1]
    CHD_upload_image_path = sys.argv[2]
    CHS_upload_image_path = sys.argv[3]
    User_ID = sys.argv[4]

    main(CHD_name, CHD_upload_image_path, CHS_upload_image_path, User_ID)