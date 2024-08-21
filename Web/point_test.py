import cv2

# 讀取圖片
image_path = 'CHS_Detect/Anime008/1724171295430.png'  # 這裡替換成你的圖片路徑
image = cv2.imread(image_path)

# 確認圖片加載成功
if image is None:
    print("無法讀取圖片，請確認圖片路徑是否正確。")
    exit()

# 定義多組座標
points_str = input("座標：") # 替換為你的坐標列表
try:
    points = eval(points_str)  # 將字串轉換為 Python 對象
except (SyntaxError, NameError):
    print("無效的座標格式，請確認格式正確。")
    exit()

# 在圖片上標記所有點
marked_image = image.copy()
for point in points:
    # 確保點的座標是整數
    x, y = int(point[0]), int(point[1])
    cv2.circle(marked_image, (x, y), radius=5, color=(0, 0, 255), thickness=-1)
# # 保存結果圖片
# output_path = 'output_image.png'  # 這裡可以設定輸出的路徑和文件名
# cv2.imwrite(output_path, marked_image)
# print(f"標記後的圖片已保存至: {output_path}")

# # 顯示點的位置和圖片的大小
# height, width, _ = image.shape
# print(f"你選擇的座標點: {points}")
# print(f"圖片大小: 寬 {width}, 高 {height}")
cv2.imshow('Points', marked_image)
cv2.waitKey(0)
# import cv2

# # 讀取圖片
# image_path = 'CHS_Detect/Anime008/0142_CHS_2.png'  # 這裡替換成你的圖片路徑
# image = cv2.imread(image_path)

# # 確認圖片加載成功
# if image is None:
#     print("無法讀取圖片，請確認圖片路徑是否正確。")
#     exit()

# # 輸入多組座標
# points = []
# print("請輸入座標點（格式：x,y），輸入 'done' 結束：")
# while True:
#     input_str = input("座標: ")
#     if input_str.lower() == 'done':
#         break
#     try:
#         x, y = map(int, input_str.split(','))
#         points.append((x, y))
#     except ValueError:
#         print("無效的輸入，請輸入 'x,y' 格式的座標點或 'done' 結束。")

# # 在圖片上標記所有點
# marked_image = image.copy()
# for point in points:
#     cv2.circle(marked_image, point, radius=5, color=(0, 0, 255), thickness=-1)

# # 保存結果圖片
# output_path = 'output_image.png'  # 這裡可以設定輸出的路徑和文件名
# cv2.imwrite(output_path, marked_image)
# print(f"標記後的圖片已保存至: {output_path}")

# # 顯示點的位置和圖片的大小
# height, width, _ = image.shape
# print(f"你選擇的座標點: {points}")
# print(f"圖片大小: 寬 {width}, 高 {height}")