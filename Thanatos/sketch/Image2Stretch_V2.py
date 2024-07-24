import cv2
import numpy as np
import matplotlib.pyplot as plt

# Set square Kernel
LaplacianKernel = 3
ErosionKernel = np.ones((3,3),np.uint8)
DilationKernel = np.ones((5,5),np.uint8)
# Set circle Kernel
# kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2*radius + 1, 2*radius + 1))


# Read the image
inputImage = cv2.imread("img/0005-CH-04.png")
grayImage = cv2.cvtColor(inputImage, cv2.COLOR_BGR2GRAY)

# do guassian
guassianImage = cv2.GaussianBlur(grayImage, (5, 5), 0)

# do canny for guassianimage
cannyImage = cv2.bitwise_not(cv2.Canny(guassianImage, 100, 200))

# do laplacian
laplacian = cv2.Laplacian(guassianImage, cv2.CV_64F, ksize=LaplacianKernel)
# do change to 0 ~ 255
laplacianImage = np.uint8(np.absolute(laplacian))

# do Erosion
erosionImage = cv2.erode(laplacianImage, ErosionKernel, iterations=1)

# do Dilation
dilationImage = cv2.dilate(erosionImage, DilationKernel, iterations=1)

# do negative film from dark to light
laplacianImage = 255 - laplacianImage
erosionImage = 255 - erosionImage
dilationImage = 255 - dilationImage

# Cannt AND Laplacian with E&D
edgeImage = cv2.bitwise_and(cannyImage, dilationImage)

# do contours
contours, hierarchy = cv2.findContours(cannyImage,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)  
contoursImage = np.uint8(np.absolute(edgeImage))
cv2.drawContours(contoursImage,contours,-1,(0,0,0),2)  

plt.figure(figsize=(15, 10))
# Input Image
plt.subplot(2, 3, 1)  # 2 rows, 3 columns, 1st subplot
plt.imshow(inputImage, cmap='gray')
plt.title('Input Image')
plt.axis('off')

# Laplacian Image without Erosion and Dilation
plt.subplot(2, 3, 2)  # 2 rows, 3 columns, 2nd subplot
plt.imshow(laplacianImage, cmap='gray')
plt.title('Laplacian Image')
plt.axis('off')

# Laplacian with Erosion
plt.subplot(2, 3, 3)  # 2 rows, 3 columns, 3rd subplot
plt.imshow(erosionImage, cmap='gray')
plt.title('with Erosion')
plt.axis('off')

# Laplacian with Erosion and Dilation
plt.subplot(2, 3, 4)  # 2 rows, 3 columns, 4th subplot
plt.imshow(dilationImage, cmap='gray')
plt.title('with Erosion and Dilation')
plt.axis('off')

# Canny AND Laplacian
plt.subplot(2, 3, 5)  # 2 rows, 3 columns, 5th subplot
plt.imshow(edgeImage, cmap='gray')
plt.title('Canny X Laplacian with E&D')
plt.axis('off')

# Linked Image
plt.subplot(2, 3, 6)  # 2 rows, 3 columns, 6th subplot
plt.imshow(contoursImage, cmap='gray')
plt.title('contours Image')
plt.axis('off')

# 顯示
plt.tight_layout()
plt.show()