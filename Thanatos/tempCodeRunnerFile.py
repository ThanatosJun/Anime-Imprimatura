import cv2
import numpy as np

# 載入影像
img = cv2.imread('Image2Stretch/img/0013.png')

# 設定感興趣區域
r = cv2.selectROI(img)
roi = img[int(r[1]):int(r[1]+r[3]), int(r[0]):int(r[0]+r[2])]

# 創建掩碼
mask = np.zeros(roi.shape[:2], np.uint8)

# 初始化GrabCut
bgdModel = np.zeros((1, 65), np.float64)
fgdModel = np.zeros((1, 65), np.float64)
rect = (int(r[0]), int(r[1]), int(r[2]), int(r[3]))
cv2.grabCut(img, mask, rect, bgdModel, fgdModel, 5, cv2.GC_INIT_WITH_RECT)

# 分割前景和背景
mask2 = np.where((mask==2)|(mask==0), 0, 1).astype('uint8')
img = img*mask2[:,:,np.newaxis]

# 顯示結果
cv2.imshow('GrabCut', img)
cv2.waitKey(0)
cv2.destroyAllWindows()