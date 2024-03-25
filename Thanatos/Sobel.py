import cv2 as cv
from matplotlib import pyplot as plt
def main():
    """
    Sobel operator
    """
    # 讀取影像
    gray_img = cv.imread("img/0013.png", 0)
    if gray_img is None:
        print("Error: Failed to read the image.")
    # 顯示圖像
    else:
        plt.figure(figsize=(15, 10))
        plt.imshow(gray_img, cmap='gray')
        plt.title('Gray Image')
        plt.axis('off')  # 不顯示座標軸
        plt.show()
    
    plt.figure(figsize=(15,10))

    # 嘗試不同 size 的 mask
    for n in range(1, 4):
        # 使用 sobel 算子
        # 第一個參數是要作用的影像
        # 第二個參數是影像深度 使用 16 可避免 overflow 問題
        # 第三 & 四個參數是控制是否使用兩種面罩的參數
        # 第五個參數是 mask size
        kernel_size = 1+(n*2)
        x = cv.Sobel(gray_img, cv.CV_16S, 1, 0, ksize=kernel_size) 
        y = cv.Sobel(gray_img, cv.CV_16S, 0, 1, ksize=kernel_size)

        # 轉換為影像原本儲存的格式 uint8
        absX = cv.convertScaleAbs(x) 
        absY = cv.convertScaleAbs(y)

        # 將兩個軸向的測邊結果相加，形成完整輪廓
        dst = cv.addWeighted(absX, 0.5, absX,0.5,0)

        plt.subplot(330+n+(2*n)-2)
        plt.imshow(absX, cmap='gray')
        plt.title('Vertical line result  (mask size = ' + str(kernel_size) + ')')
        plt.xticks([])
        plt.yticks([])

        plt.subplot(330+n+(2*n)-1)
        plt.imshow(absY, cmap='gray')
        plt.title('Horizontal line result (mask size = ' + str(kernel_size) + ')')
        plt.xticks([])
        plt.yticks([])

        plt.subplot(330+n+(2*n))
        plt.imshow(dst, cmap='gray')
        plt.title('Complete result (mask size = ' + str(kernel_size) + ')')
        plt.xticks([])
        plt.yticks([])

    # 儲存所有輸出的圖像
    plt.savefig('./Sobel_operator_result.jpg', bbox_inches='tight', dpi=300)

if __name__ == "__main__":
    main()