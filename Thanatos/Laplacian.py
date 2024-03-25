import cv2 as cv
from matplotlib import pyplot as plt

def main():
    """
    Laplacian operator
    """
    # 讀取影像
    gray_img = cv.imread("img/0013.png", 0)

    # 初始化輸出影像
    plt.figure(figsize=(7,5))
    plt.subplot(221)
    plt.imshow(gray_img, cmap='gray')
    plt.title('Input image')
    plt.xticks([])
    plt.yticks([])

    # 嘗試不同 size 的 mask
    for n in range(1, 4):
        # 使用拉普拉斯算子
        # 第一個參數是要作用的影像
        # 第二個參數是影像深度 使用 16 可避免 overflow 問題
        # 第三個參數是 mask size
        kernel_size = 1+(n*2)
        gray_lap = cv.Laplacian(gray_img, cv.CV_16S, ksize=kernel_size)

        # 轉換為影像原本儲存的格式 uint8
        abs_lap = cv.convertScaleAbs(gray_lap)
        plt.subplot(221+n)
        plt.imshow(abs_lap, cmap='gray')
        plt.title('Result (mask size = ' + str(kernel_size) + ')')
        plt.xticks([])
        plt.yticks([])

    # 儲存所有輸出的圖像
    plt.savefig('./Laplacian_operator_result.jpg', bbox_inches='tight', dpi=300)

if __name__ == "__main__":
    main()