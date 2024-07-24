import cv2
import numpy as np
import gradio as gr
import os
import tempfile

class ImageProcesser:
    def __init__(self) -> None:
        pass
    def sketch_image(self,imageInputs, sliderCannyLow, sliderCannyHigh, sliderLaplacianKernel, sliderErosionKernel, sliderDilationKernel, mode):
        CannyLow = sliderCannyLow
        CannyHigh = sliderCannyHigh
        LaplacianKernel = sliderLaplacianKernel
        ErosionKernel = cv2.getStructuringElement(cv2.MORPH_CROSS, (sliderErosionKernel, sliderErosionKernel))
        DilationKernel = cv2.getStructuringElement(cv2.MORPH_CROSS, (sliderDilationKernel, sliderDilationKernel))
        CHSImages_paths = []
        temp_dir = tempfile.mkdtemp()
        # announce CHSImage is array and turn it into numpy array
        for i, imagePath in enumerate(imageInputs):
            try:
                imageInput = cv2.imread(imagePath)
                # Change into gray
                grayImage = cv2.cvtColor(imageInput, cv2.COLOR_BGR2GRAY)
                # do guassian
                guassianImage = cv2.GaussianBlur(grayImage, (5, 5), 0)

                # Set outputImage type
                if (mode == "Canny Only"):
                    outputImage = self.canny_edge(guassianImage, CannyLow, CannyHigh)
                elif (mode == "Laplacian Only"):
                    outputImage = self.laplacian_edge(guassianImage, LaplacianKernel)
                elif (mode == "Canny & Laplacian"):
                    outputImage = self.canny_laplacian_edge(guassianImage, CannyLow, CannyHigh,LaplacianKernel,ErosionKernel,DilationKernel)
                else:
                    edgeImage = self.canny_laplacian_edge(guassianImage, CannyLow, CannyHigh,LaplacianKernel,ErosionKernel,DilationKernel)
                    # do contours
                    contours, hierarchy = cv2.findContours(edgeImage,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
                    CHSImage = np.uint8(np.absolute(edgeImage))
                    CHSImage = cv2.drawContours(CHSImage,contours,-1,(0,0,0),2)
                    outputImage = CHSImage

                # store imagefile
                # Get imagePath from the input files
                input_filename = os.path.basename(imagePath)
                # divide the file name
                base_filename , ext = os.path.splitext(input_filename)
                # if "CHD", change into "CHS"
                if "CHD" in base_filename:
                    output_filename = base_filename.replace("CHD", "CHS")
                else:
                    output_filename = base_filename

                # set a temp filepath for sthoring image
                output_filepath = os.path.join(temp_dir, output_filename + ext)

                cv2.imwrite(output_filepath, outputImage)
                CHSImages_paths.append(output_filepath)
            except Exception as error:
                print("Error processing image:",error)
        return CHSImages_paths
    
    # function for canny process
    def canny_edge(self,guassianImage, CannyLow, CannyHigh):
        # do canny for guassianimage
        cannyImage = cv2.bitwise_not(cv2.Canny(guassianImage, CannyLow, CannyHigh))
        return cannyImage
    
    # function for laplacian process
    def laplacian_edge(self,guassianImage,LaplacianKernel):
        # do laplacian
        laplacian = cv2.Laplacian(guassianImage, cv2.CV_64F, ksize=LaplacianKernel)
        # do change to 0 ~ 255
        laplacianImage = np.uint8(np.absolute(laplacian))
        # do negative film from dark to light
        laplacianImage = 255 - laplacianImage
        return laplacianImage
    
    # function for combine canny and laplacian process
    def canny_laplacian_edge(self,guassianImage, CannyLow, CannyHigh,LaplacianKernel,ErosionKernel,DilationKernel):
        # do canny for guassianimage
        cannyImage = cv2.bitwise_not(cv2.Canny(guassianImage, CannyLow, CannyHigh))
        
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
        return edgeImage

class GradioInterface:
    def __init__(self):
        # instanitation ImageProcesser
        self.imageProcesser = ImageProcesser()

        with gr.Blocks() as input_blocks:
            # Image input and generate
            with gr.Row():
                imageInputs = gr.File(label = "Mulitple Inputs", file_count = "multiple")
                imageOutputs = gr.File(label = "Mutlple Outputs", file_count = "multiple")
                # imageInput = gr.Image(label = "Original")
                # imageOutput = gr.Image(label="Stretch", type="numpy")  # 添加 type="numpy"
            btnGenerate = gr.Button(value="Generate")
            btnDownloadOutputs = gr.Button(value="Download Outputs")
            # choose Kenerl
            with gr.Row():
                sliderCannyLow = gr.Slider(minimum=25, maximum=300, value=50, step=5,
                                               label="Canny Kernel", info="50 is suitale")
                sliderCannyHigh = gr.Slider(minimum=25, maximum=300, value=150, step=5,
                                               label="Canny Kernel", info="150 is suitale")
                sliderLaplacianKernel = gr.Slider(minimum=1, maximum=15, value=3, step=2,
                                               label="Laplacian Kernel", info="3 is the suitale")
                sliderErosionKernel = gr.Slider(minimum=1, maximum=15, value=3, step=2,
                                               label="Erosion Strength", info="for shrink the line. 3 is suitable")
                sliderDilationKernel = gr.Slider(minimum=1, maximum=15, value=5, step=2,
                                               label="Dilation Strength", info="for dilate the line. 5 is suitable")

            radioMode = gr.Radio(["Canny Only", "Laplacian Only", "Canny & Laplacian", "CHSImage"],
                                 label="Mode", value='CHSImage')
            btnGenerate.click(fn=self.imageProcesser.sketch_image,
                               inputs=[imageInputs, sliderCannyLow, sliderCannyHigh, sliderLaplacianKernel, sliderErosionKernel, sliderDilationKernel, radioMode], outputs=imageOutputs)    
            btnDownloadOutputs.click(fn=self.download_outputs, inputs=imageOutputs)
        input_blocks.launch()

    def download_outputs(self, imageOutputs):
        try:
            # 確定下載圖像的保存路徑
            output_dir = "downloaded_images"
            if not os.path.exists(output_dir):
                os.makedirs(output_dir)

            # 逐個保存圖像到本地
            for i, image_path in enumerate(imageOutputs):
                image_name = os.path.basename(image_path)  # 假設圖像名為 output_image_{i}.png
                save_path = os.path.join(output_dir, image_name)
                os.rename(image_path, save_path)  # 將圖像移動到指定路徑並修改文件名

            # 提供適當的反饋已告知使用者下載成功
            print("Images downloaded successfully to:", output_dir)

        except Exception as error:
            # 如果出現任何錯誤，提供適當的錯誤訊息給用戶
            print("Error occurred wh1ile downloading images:", error)

if __name__ == "__main__":
    gradio_interface = GradioInterface()


# import gradio as gr

# # 创建多个图像输入组件，类型为文件
# image_inputs = gr.File(label="Multiple Inputs", file_count="multiple")

# # 创建多个图像输出组件，类型为文件
# image_outputs = gr.File(label="Multiple Outputs", file_count="multiple")

# # 定义处理图像的函数
# def process_images(input_images):
#     # 在这里编写图像处理逻辑
#     # 这里简单地将输入图像列表返回作为输出
#     return input_images

# # 创建 Gradio 交互式界面
# gr.Interface(fn=process_images, inputs=image_inputs, outputs=image_outputs).launch()
