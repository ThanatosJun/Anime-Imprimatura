#!/usr/bin/env python
# coding: utf-8

# In[6]:


import cv2
import numpy as np
import random

def get_major_color(image):
    pixels = image.reshape(-1, 3)
    n_colors = 5  # 增加主要顏色分析的顏色數量
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 200, .1)
    _, labels, centers = cv2.kmeans(pixels.astype(np.float32), n_colors, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    label_counts = np.bincount(labels.flatten())
    major_label = np.argmax(label_counts)
    return centers[major_label]

def get_random_point_in_mask(mask):
    nonzero_points = np.transpose(np.nonzero(mask))
    if len(nonzero_points) == 0:
        return None
    random_index = random.randint(0, len(nonzero_points) - 1)
    random_point = tuple(nonzero_points[random_index])
    
    # 檢查種子點是否超出圖像範圍，如果超出範圍則重新選擇
    while random_point[0] >= mask.shape[1] or random_point[1] >= mask.shape[0]:
        random_index = random.randint(0, len(nonzero_points) - 1)
        random_point = tuple(nonzero_points[random_index])
    
    return random_point

def flood_fill(image, point, color):
    mask = np.zeros((image.shape[0] + 2, image.shape[1] + 2), np.uint8)
    new_color = (int(color[0]), int(color[1]), int(color[2]))
    cv2.floodFill(image, mask, point, new_color, (100, 100, 100), (100,100,100), cv2.FLOODFILL_FIXED_RANGE)

# 讀取彩圖和黑白線稿圖
image_a = cv2.imread('boy_part_color.png')
image_b = cv2.imread('boy_part_color_sketch.png')

# 分析彩圖中佔比最大的顏色
major_color = get_major_color(image_a).astype(int)

# 創建一個與彩圖大小相同的黑白圖像，並將佔比最大顏色的區域填充為白色（255）
mask = np.all(image_a == major_color, axis=-1)
image_mask = np.zeros_like(image_a, dtype=np.uint8)
image_mask[mask] = (0, 0, 0)

# 在佔比最大顏色的區域中隨機取一個點
random_point = get_random_point_in_mask(mask)

# 如果隨機點為 None，則顯示相應的消息並退出程式
if random_point is None:
    print("找不到符合條件的隨機點！請檢查圖像和分析方法。")
    exit()

# 在黑白線稿圖中以 floodfill 進行上色
flood_fill(image_b, random_point, major_color)

# 在黑白線稿圖上以綠色點標記出隨機點
#image_b_with_point = cv2.circle(image_b, random_point, 5, (0, 255, 0), -1) # 將圓填充為綠色

# 顯示結果
cv2.imshow('original_image',image_a)
cv2.imshow('sketch_image', image_b)
cv2.waitKey(0)
cv2.destroyAllWindows()

