import os
import shutil
import sys
class class_CH_Upload():
    def __init__(self, CH_Name):
        self.CHS_Detect_dir = "CHS_Detect/" + CH_Name
        self.CHD_Detect_dir = "CHD_Detect/" + CH_Name
        clear_and_create_dir(self.CHS_Detect_dir)
        clear_and_create_dir(self.CHD_Detect_dir)  # create folder for save correct CHS
    def CH_Upload(self, input_dir_path, store_dir_path):
        i = 1
        # input image from uploads
        for file_path in input_dir_path:
            image_basename = os.path.basename(file_path)
            new_image_path = os.path.join(store_dir_path, image_basename)
            shutil.copy(file_path, new_image_path)
            print(f"{i}:move {file_path} to {store_dir_path}\n")
            i+=1
def clear_and_create_dir(directory):
    if os.path.exists(directory):
        shutil.rmtree(directory)
    os.makedirs(directory, exist_ok=True)
def main(CH_Name, CHD_Upload_path, CHS_Upload_path):
    CH_Upload = class_CH_Upload(CH_Name)
    CH_Upload.CH_Upload(CHS_Upload_path, CH_Upload.CHS_Detect_dir)
    CH_Upload.CH_Upload(CHD_Upload_path, CH_Upload.CHD_Detect_dir)
    return "AI_Function/" + CH_Upload.CHS_Detect_dir

if __name__ == "main":
    CH_Name = sys.argv[1]
    CHD_Upload_path = sys.argv[2]
    CHS_Upload_path = sys.argv[3]
    main(CH_Name, CHD_Upload_path, CHS_Upload_path)
    