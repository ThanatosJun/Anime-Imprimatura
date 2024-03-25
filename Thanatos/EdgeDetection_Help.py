import cv2
import numpy as np
import matplotlib.pyplot as plt

# Read the image
image = cv2.imread('img/0013.png')
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Apply Canny edge detection
edges_canny = cv2.Canny(gray, 50, 150)

# Apply Sobel operator
sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
edges_sobel = cv2.magnitude(sobel_x, sobel_y)
edges_sobel = np.uint8(edges_sobel)

# Apply Laplacian edge detection
laplacian = cv2.Laplacian(gray, cv2.CV_64F, ksize=3)
edges_laplacian = np.uint8(np.absolute(laplacian))

# Apply thresholding
_, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)

# Plotting
plt.figure(figsize=(12, 10))

# Original Image
plt.subplot(2, 3, 1)
plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
plt.title('Original')
plt.axis('off')

# Grayscale Image
plt.subplot(2, 3, 2)
plt.imshow(gray, cmap='gray')
plt.title('Grayscale')
plt.axis('off')

# Thresholding
plt.subplot(2, 3, 3)
plt.imshow(thresh, cmap='gray')
plt.title('Thresholding')
plt.axis('off')

# Canny Edge Detection
plt.subplot(2, 3, 4)
plt.imshow(edges_canny, cmap='gray')
plt.title('Canny Edge Detection')
plt.axis('off')

# Sobel Edge Detection
plt.subplot(2, 3, 5)
plt.imshow(edges_sobel, cmap='gray')
plt.title('Sobel Edge Detection')
plt.axis('off')

# Laplacian Edge Detection
plt.subplot(2, 3, 6)
plt.imshow(edges_laplacian, cmap='gray')
plt.title('Laplacian Edge Detection')
plt.axis('off')

plt.tight_layout()
plt.show()