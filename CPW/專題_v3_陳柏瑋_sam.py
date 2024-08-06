import os
import torch
import cv2
import numpy as np
import matplotlib.pyplot as plt
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator
from ultralytics import YOLO
from ipywidgets import widgets
from IPython.display import display, clear_output

# 設定檔案路徑
CHECKPOINT_PATH = r"C:\\CNN\\SAM\\sam_vit_h_4b8939.pth"
CASCADE_PATH = r"C:\\CNN\\lbpcascade_animeface.xml"
LABELS_PATH = r"C:\\CNN\\SAM\\coverted_keras(face hair eye)\\labels(face hair eye).txt"
KERAS_MODEL_PATH = r"C:\\CNN\\SAM\\coverted_keras(face hair eye)\\keras_model(face hair eye).h5"
EYE_CASCADE_PATH = r"C:\\CNN\\haarcascade_eye.xml"
HAIR_MODEL_PATH = r"C:\\CNN\\SAM\\hair_model\\CHS_hair.pt"

# 檢查檔案是否存在
def check_file_exists(file_path):
    if os.path.isfile(file_path):
        print(f"檔案 {file_path} 已存在。")
    else:
        raise FileNotFoundError(f"找不到檔案: {file_path}")

check_file_exists(CHECKPOINT_PATH)
check_file_exists(CASCADE_PATH)
check_file_exists(LABELS_PATH)
check_file_exists(KERAS_MODEL_PATH)
check_file_exists(EYE_CASCADE_PATH)
check_file_exists(HAIR_MODEL_PATH)

# 設定裝置
DEVICE = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
MODEL_TYPE = "vit_h"

# 加載 SAM 模型
sam = sam_model_registry[MODEL_TYPE](checkpoint=CHECKPOINT_PATH).to(device=DEVICE)
mask_generator = SamAutomaticMaskGenerator(sam)

# 手動指定圖像檔案的路徑
IMAGE_PATH = r"C:\CNN\picture\chs\0100_CHS_1.png"

# 圖像預處理函數
def preprocess_image(image_path):
    image_bgr = cv2.imread(image_path)
    if image_bgr is None:
        raise ValueError(f"Image at path '{image_path}' could not be loaded. Please check the file path.")
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    return image_bgr, image_rgb

# 填充輪廓函數
def fill_contours(image, mask, color=(0, 255, 0), thickness=cv2.FILLED):
    if not isinstance(mask, np.ndarray):
        raise TypeError("mask must be a NumPy array")
    if mask.ndim != 2:
        raise ValueError("mask must be a 2D array")
    if mask.dtype != np.uint8:
        mask = mask.astype(np.uint8)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    image_with_filled_contours = image.copy()
    cv2.drawContours(image_with_filled_contours, contours, -1, color, thickness=thickness)

    return image_with_filled_contours, contours

# 加載和預處理圖像
image_bgr, image_rgb = preprocess_image(IMAGE_PATH)

# 使用 SAM 模型生成分割結果
sam_result = mask_generator.generate(image_rgb)

# 繪製分割結果
plt.figure(figsize=(15, 5))
plt.subplot(1, 3, 1)
plt.title('Original Image')
plt.imshow(cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB))
plt.axis('off')

plt.subplot(1, 3, 2)
plt.title('SAM Segmentation Result')
plt.imshow(sam_result[0]['segmentation'], cmap='gray')
plt.axis('off')

plt.show()

# 創建保存檔案的目錄
if not os.path.exists('C:\\CNN\\pic'):
    os.makedirs('C:\\CNN\\pic')

# 加載預訓練的 YOLOv8n-seg Segment 模型
model_mask = YOLO(HAIR_MODEL_PATH)

# 檢測上傳的圖像
result = model_mask.predict(source=IMAGE_PATH, save=False)[0]

# 獲取原始圖像
orig_img = result.orig_img

# 確保 segmentation_mask 與 orig_img 尺寸一致
segmentation_mask = result.masks.data[0].numpy()
segmentation_mask_resized = cv2.resize(segmentation_mask, (orig_img.shape[1], orig_img.shape[0]), interpolation=cv2.INTER_NEAREST).astype(np.uint8) * 255

# 創建只顯示著色部分的圖像
colored_part = cv2.bitwise_and(orig_img, orig_img, mask=segmentation_mask_resized)

# 創建一個黑色背景的圖像
black_background = np.zeros_like(orig_img)

# 將著色部分疊加到黑色背景上
highlighted_img = cv2.addWeighted(colored_part, 1, black_background, 1, 0)

# 保存強調的圖像
highlighted_output_path = r"C:\CNN\save\highlighted_image.png"
cv2.imwrite(highlighted_output_path, highlighted_img)

# 顯示 Highlighted 圖像
plt.figure(figsize=(10, 10))
plt.imshow(cv2.cvtColor(highlighted_img, cv2.COLOR_BGR2RGB))
plt.title('Highlighted Image')
plt.axis('off')
plt.show()

print(f"Highlighted 圖片已保存至: {highlighted_output_path}")

# 將 masks 圖像顯示為網格
def plot_images_grid(images, grid_size=(4, 4), size=(10, 10)):
    fig, axes = plt.subplots(grid_size[0], grid_size[1], figsize=size)
    for i, ax in enumerate(axes.flat):
        if i < len(images):
            ax.imshow(images[i], cmap='gray')
        ax.axis('off')
    plt.tight_layout()
    plt.show()

# 使用 SAM 模型生成的分割結果
masks = [
    mask['segmentation']
    for mask
    in sorted(sam_result, key=lambda x: x['area'], reverse=True)
]

# 顯示圖像網格
plot_images_grid(
    images=masks,
    grid_size=(8, int(len(masks) / 8)),
    size=(16, 16)
)

# 創建保存檔案的目錄
output_image_dir = r"C:\\CNN\\save\\images"
output_txt_dir = r"C:\\CNN\\save\\annotations"
if not os.path.exists(output_image_dir):
    os.makedirs(output_image_dir)
if not os.path.exists(output_txt_dir):
    os.makedirs(output_txt_dir)

# 清單用來保存選擇的索引
selected_indices = []

# 最大處理的圖像數量
max_display_count = 12

# 生成勾選框
def on_button_clicked(b):
    global selected_indices
    selected_indices = [i for i, cb in enumerate(checkboxes) if cb.value]
    print("已選擇的索引：", selected_indices)
    for idx in selected_indices:
        mask = masks[idx]
        masked_image, contours = fill_contours(image_bgr, mask.astype('uint8'))
        mask_image_path = os.path.join(output_image_dir, f"figure_{idx + 1}.png")
        cv2.imwrite(mask_image_path, masked_image)
        print(f"已保存分割 {idx + 1} 至 {mask_image_path}")

        # 生成包含類別和座標的 TXT 檔案
        txt_path = os.path.join(output_txt_dir, f"figure_{idx + 1}.txt")
        with open(txt_path, 'w') as f:
            for contour in contours:
                for point in contour:
                    x, y = point[0]
                    f.write(f"ClassID X:{x} Y:{y}\n")  # 替換 ClassID 為實際的類別ID
        print(f"已保存分割 {idx + 1} 的類別和座標至 {txt_path}")
    
    clear_output(wait=True)
    print("選擇完成，保存的索引為：", selected_indices)

# 顯示前 max_display_count 張分割區塊，並用勾選框讓使用者選擇要保存的照片
checkboxes = []
for idx in range(min(len(masks), max_display_count)):
    mask = masks[idx]
    masked_image, _ = fill_contours(image_bgr, mask.astype('uint8'))
    plt.figure()
    plt.imshow(cv2.cvtColor(masked_image, cv2.COLOR_BGR2RGB))
    plt.title(f"Image {idx + 1}")
    plt.axis('off')
    plt.show()

    cb = widgets.Checkbox(description=f"Image {idx + 1}", value=False)
    display(cb)
    checkboxes.append(cb)

button = widgets.Button(description="確認選擇")
button.on_click(on_button_clicked)
display(button)
