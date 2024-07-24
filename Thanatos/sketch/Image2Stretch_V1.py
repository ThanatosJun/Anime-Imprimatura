import math
import cv2
import numpy as np
import matplotlib.pyplot as plt

CannyKernel = 7
LaplacianKernel = 3
# Read the image
inputimage = cv2.imread("img/test2.png")
grayimage = cv2.cvtColor(inputimage, cv2.COLOR_BGR2GRAY)


# 模糊處理
blurimage = cv2.medianBlur(grayimage,CannyKernel)

# do apdative threshold for blurimage
ret, thresimage = cv2.threshold(blurimage, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 11 , 10)

# do apdative threshold for grayimage
ret, thresimage2 = cv2.threshold(grayimage, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 7 , 2)

# do guassian
guassianimage = cv2.GaussianBlur(grayimage, (5, 5), 0)

# do canny for grayimage
cannyimage = cv2.bitwise_not(cv2.Canny(grayimage, 100, 200))
# do canny for blurimage
cannyimage2 = cv2.bitwise_not(cv2.Canny(blurimage, 100, 200))
# do canny for guassianimage
cannyimage3 = cv2.bitwise_not(cv2.Canny(guassianimage, 100, 200))

# do Hough Transform stright line detection
linesP = cv2.HoughLinesP(cannyimage3, 1, np.pi / 180, 150, minLineLength=10, maxLineGap=100)

HoughImage = np.copy(cannyimage3)

if linesP is not None:
    for i in range(0, len(linesP)):
        l = linesP[i][0]
        cv2.line(HoughImage, (l[0], l[1]), (l[2], l[3]), (0,0,255), 1, cv2.LINE_AA)

# do laplacian
laplacian = cv2.Laplacian(guassianimage, cv2.CV_64F, ksize=LaplacianKernel)
laplacianimage = np.uint8(np.absolute(laplacian))

DilateKernel = np.ones((3,3),np.uint8)
delicatedlaplacianimage =255 - cv2.dilate(laplacianimage, DilateKernel, iterations=3)

laplacianimage = 255 - laplacianimage

# do combine canny and laplacian
edgeImage = cv2.bitwise_and(cannyimage3, laplacianimage)

# draw line on image
if linesP is not None:
    for i in range(0, len(linesP)):
        rho = linesP[i][0][0]
        theta = linesP[i][0][1]
        a = math.cos(theta)
        b = math.sin(theta)
        x0 = a * rho
        y0 = b * rho
        pt1 = (int(x0 + 50*(-b)), int(y0 + 50*(a)))
        pt2 = (int(x0 - 50*(-b)), int(y0 - 50*(a)))
cv2.line(HoughImage, pt1, pt2, (0,0,255), 3, cv2.LINE_AA)


# 圖像檢視1==================================================
plt.figure(figsize=(15, 10))
# 原圖
plt.subplot(2, 3, 1)  # 2 rows, 3 columns, 1st subplot
plt.imshow(inputimage, cmap='gray')
plt.title('Input Image')
plt.axis('off')

# 灰階
plt.subplot(2, 3, 2)  # 2 rows, 3 columns, 2nd subplot
plt.imshow(grayimage, cmap='gray')
plt.title('Gray Image')
plt.axis('off')

# 中值模糊
plt.subplot(2, 3, 3)  # 2 rows, 3 columns, 3rd subplot
plt.imshow(blurimage, cmap='gray')
plt.title('Blur Image')
plt.axis('off')

# adative threshold to blurimage
plt.subplot(2, 3, 4)  # 2 rows, 3 columns, 4th subplot
plt.imshow(thresimage, cmap='gray')
plt.title('Adaptive Threshold Image')
plt.axis('off')

# adative threshold to grayimage
plt.subplot(2, 3, 5)  # 2 rows, 3 columns, 5th subplot
plt.imshow(thresimage2, cmap='gray')
plt.title('Adaptive Threshold Image')
plt.axis('off')
# 顯示
plt.tight_layout()
plt.show()

# 圖像檢視2===============================================
plt.figure(figsize=(15, 10))
# Canny for grayimage
plt.subplot(2, 3, 1)  # 2 rows, 3 columns, 1st subplot
plt.imshow(cannyimage, cmap='gray')
plt.title('Canny Image for Gray Image')
plt.axis('off')

# Canny for blurimage
plt.subplot(2, 3, 2)  # 2 rows, 3 columns, 2nd subplot
plt.imshow(cannyimage2, cmap='gray')
plt.title('Canny Image for Blur Image')
plt.axis('off')

# Canny for guassianimage
plt.subplot(2, 3, 3)  # 2 rows, 3 columns, 3rd subplot
plt.imshow(cannyimage3, cmap='gray')
plt.title('Canny Image for Guassian Image')
plt.axis('off')

# Hough Transform on Canny for guassianimage
plt.subplot(2, 3, 4)  # 2 rows, 3 columns, 4th subplot
plt.imshow(HoughImage, cmap='gray')
plt.title('HoughImage')
plt.axis('off')

plt.subplot(2, 3, 5)  # 2 rows, 3 columns, 5th subplotA
plt.imshow(laplacian, cmap='gray')
plt.title('Half Laplacian')
plt.axis('off')

plt.subplot(2, 3, 6)  # 2 rows, 3 columns, 6th subplot
plt.imshow(laplacianimage, cmap='gray')
plt.title('Laplacian Image')
plt.axis('off')

# 顯示
plt.tight_layout()
plt.show()

# Show Delicated Laplacian Image
plt.figure(figsize=(15, 10))
plt.subplot(1, 2, 1)  # 2 rows, 3 columns, 1st subplot
plt.imshow(delicatedlaplacianimage, cmap='gray')
plt.title('Delicated Laplacian Image')
plt.axis('off')

# Show Combine Canny and Laplacian
plt.subplot(1, 2, 2)  # 2 rows, 3 columns, 2nd subplot
plt.imshow(edgeImage, cmap='gray')
plt.title('Canny X Laplacian')
plt.axis('off')

plt.tight_layout()
plt.show()