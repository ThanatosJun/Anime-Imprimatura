import cv2
import numpy as np
import gradio as gr
import os
import tempfile
import tkinter as tk
from tkinter import filedialog

class ImageProcesser:
    # initialization
    def __init__(self) -> None:
        self.edge_linking = Edge_Linking()
    
    def sketch_image(self,imageInputs, sliderGaussian, sliderCannyLow, sliderCannyHigh, sliderLaplacianKernel, sliderErosionKernel, sliderDilationKernel, mode, contours,lineLinkMode):
        # announce variables
        gaussianKernel = sliderGaussian
        CannyLow = sliderCannyLow
        CannyHigh = sliderCannyHigh
        LaplacianKernel = sliderLaplacianKernel
        ErosionKernel = cv2.getStructuringElement(cv2.MORPH_CROSS, (sliderErosionKernel, sliderErosionKernel))
        DilationKernel = cv2.getStructuringElement(cv2.MORPH_CROSS, (sliderDilationKernel, sliderDilationKernel))
        # output path list
        sketch_paths = []
        # temp storage
        temp_dir = tempfile.mkdtemp()
        # print(sliderGaussian, imageInputs, sliderCannyLow, sliderCannyHigh, sliderLaplacianKernel, sliderErosionKernel, sliderDilationKernel, mode, contours,lineLinkMode)
        for i, imagePath in enumerate(imageInputs):
            try:
                canny_contoursImage = None
                imageInput = cv2.imread(imagePath)
                # Change into gray
                grayImage = cv2.cvtColor(imageInput, cv2.COLOR_BGR2GRAY)
                # do gaussian
                gaussianImage = cv2.GaussianBlur(grayImage, (gaussianKernel, gaussianKernel), 0)
                if mode == "Canny":
                    edgeImage = cv2.Canny(gaussianImage, CannyLow, CannyHigh)
                    cannyImage = edgeImage.copy()
                elif mode == "Laplacian":
                    edgeImage = self.laplacian_edge(gaussianImage,LaplacianKernel)
                    cannyImage = cv2.Canny(gaussianImage, CannyLow, CannyHigh)
                else:
                    # do canny and laplacian
                    edgeImage,cannyImage = self.canny_laplacian_edge(gaussianImage, CannyLow, CannyHigh,LaplacianKernel,ErosionKernel,DilationKernel)
                
                # do contours
                if contours == "True":
                    sketch = self.do_contours(edgeImage)
                elif contours == "Canny Only":
                    canny_contoursImage = self.do_contours(cannyImage)
                    sketch = cv2.bitwise_or(edgeImage,canny_contoursImage)
                else: 
                    sketch = edgeImage

                # do Hough_Transform
                if lineLinkMode == "Hough Transform":              
                    sketch = self.do_hough_transform(sketch)
                # do Hough_Transform
                elif lineLinkMode == "Hough Transform(Canny)":                
                    sketch = self.do_hough_transform(sketch)
                # do edge_linking from class Edge_Linking
                elif lineLinkMode == "Edge Linking(Canny Only)" and canny_contoursImage != None: 
                    sketch = cv2.bitwise_or(sketch,self.do_edge_linking(canny_contoursImage))
                elif lineLinkMode == "Edge Linking(Canny Only)":
                    sketch = cv2.bitwise_or(sketch,self.do_edge_linking(cannyImage))
                else:
                    pass

                sketch = 255 - sketch
                # store imagefile
                sketch_filepath = self.store_filepath(imagePath, temp_dir)

                # rewrite sketch file
                cv2.imwrite(sketch_filepath, sketch)
                sketch_paths.append(sketch_filepath)

            except Exception as error:
                print("Error processing image:",error)
        return sketch_paths
    # function for laplacian process
    def laplacian_edge(self,gaussianImage,LaplacianKernel):
        # do laplacian
        laplacian = cv2.Laplacian(gaussianImage, cv2.CV_64F, ksize=LaplacianKernel)
        # do change to 0 ~ 255
        laplacianImage = np.uint8(np.absolute(laplacian))
        return laplacianImage

    # function for combine canny and laplacian process
    def canny_laplacian_edge(self,gaussianImage, CannyLow, CannyHigh,LaplacianKernel,ErosionKernel,DilationKernel):
        # do canny for gaussianimage
        cannyImage = cv2.Canny(gaussianImage, CannyLow, CannyHigh)
        
        # do laplacian
        laplacian = cv2.Laplacian(gaussianImage, cv2.CV_64F,ksize=LaplacianKernel)
        # do change to 0 ~ 255
        laplacianImage = np.uint8(np.absolute(laplacian))
        # do Erosion
        erosionImage = cv2.erode(laplacianImage, ErosionKernel, iterations=1)
        # do Dilation
        dilationImage = cv2.dilate(erosionImage, DilationKernel, iterations=1)
        
        # Cannt AND Laplacian with E&D
        edgeImage = cv2.bitwise_or(cannyImage, dilationImage)
        return edgeImage, cannyImage

    # function for doing contours
    def do_contours(self,edgeImage):
        # do contours
        contours, hierarchy = cv2.findContours(edgeImage,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
        contoursImage = np.uint8(np.absolute(edgeImage))
        contoursImage = cv2.drawContours(contoursImage,contours,-1,(255,255,255),2)
        return contoursImage
    
    # function for Edge Linking from another class
    def do_edge_linking(self,edge_image):
        # 連接線段
        linked_lines = self.edge_linking.link_edges(edge_image)
        # 可視化
        edge_image[np.nonzero(edge_image)] = 0  # 重置邊緣像素值為 0
        for line in linked_lines:
            for x, y in line:
                x_int, y_int = int(round(x)), int(round(y))  # 四捨五入為整數
                edge_image[y_int, x_int] = 255  # 將連接的線段像素值設置為 255
        return edge_image
    
    # function for Hough Transform
    def do_hough_transform(self,edge_image):
        lines = cv2.HoughLinesP(edge_image, 1, np.pi/180, 50, minLineLength=2, maxLineGap=2)
        lines_image = np.zeros_like(edge_image)
        for line in lines:
            x1, y1, x2, y2 = line[0]
            cv2.line(lines_image, (x1, y1), (x2, y2), (255, 255, 255), 2)

        edge_image = cv2.addWeighted(edge_image, 1, lines_image, 1, 0)
        return edge_image

    # function for store temp file
    def store_filepath(self,imagePath, temp_dir):
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
        return output_filepath


class Edge_Linking:
    def __init__(self) -> None:
        pass
    def get_neighbors(self,edges, x, y):
    # 定義鄰居相對位置
        offsets = np.array([[-1, -1], [-1, 0], [-1, 1],
                            [0, -1],           [0, 1],
                            [1, -1], [1, 0], [1, 1]])
        # 計算鄰居座標
        nx = np.round(x + offsets[:, 0]).astype(int)
        ny = np.round(y + offsets[:, 1]).astype(int)
        # 篩選有效的鄰居座標並且鄰居像素值大於 0
        valid = (nx >= 0) & (nx < edges.shape[1]) & (ny >= 0) & (ny < edges.shape[0]) & (edges[ny, nx] > 0)
        neighbors = [(nx[i], ny[i]) for i in range(len(nx)) if valid[i]]
        return neighbors

    def calculate_angle(self,neighbors):
        """
        根據鄰居點的位置，計算並返回角度。
        Args:
            neighbors: 鄰居點的列表，每個元素是一對 (x, y) 座標。
        Returns:
            angle: 角度值。
        """
        # 這裡是示例實現，您需要根據實際情況修改或擴展。
        # 在這個示例中，我們假設鄰居點只有一個，並且以相對位置判斷角度。
        dx = neighbors[0][0] - neighbors[0][0]
        dy = neighbors[0][1] - neighbors[0][1]
        
        # 根據 dx 和 dy 的值計算角度
        angle = np.rad2deg(np.arctan2(dy, dx))
        return angle

    def get_next_point(self,x, y, angle):
        """
        根據當前點的位置和角度，計算並返回下一個點的位置。
        Args:
            x: 當前點的 x 座標。
            y: 當前點的 y 座標。
            angle: 當前點的角度。
        Returns:
            next_x: 下一個點的 x 座標。
            next_y: 下一個點的 y 座標。
        """
        # 根據角度計算下一個點的位置
        next_x = x + np.cos(np.deg2rad(angle))
        next_y = y + np.sin(np.deg2rad(angle))
        
        return next_x, next_y

    def trace_line(self,edges, x, y):
        line = [(x, y)]
        prev_angle = None
        while True:
            neighbors = self.get_neighbors(edges, x, y)
            if not neighbors:
                break
            angle = self.calculate_angle(neighbors)
            if angle != prev_angle and prev_angle is not None:
                break
            prev_angle = angle
            x, y = self.get_next_point(x, y, angle)
            line.append((x, y))
        return line

    # 定義鏈接函數
    def link_edges(self,edges):
        # # 找出邊緣像素的索引
        # y_coords, x_coords = np.nonzero(edges)
        # # 以索引為基礎，計算每個邊緣像素的連接線段
        # lines = [trace_line(edges, x, y) for x, y in zip(x_coords, y_coords)]
        
        # 找出邊緣像素的索引
        y_coords, x_coords = np.nonzero(edges)
        # 初始化空列表
        lines = []
        # 使用普通迴圈遍歷每個邊緣像素
        for x, y in zip(x_coords, y_coords):
            line = self.trace_line(edges, x, y)
            lines.append(line)
        return lines

class GradioInterface:
    # initialization
    def __init__(self):
        # instanitation ImageProcesser
        self.imageProcesser = ImageProcesser()

        with gr.Blocks() as input_blocks:
            # image inputs and outputs
            with gr.Row():
                imageInputs = gr.File(label = "Mulitple Inputs", file_count = "multiple")
                imageOutputs = gr.File(label = "Mutlple Outputs", file_count = "multiple")
            # button area
            with gr.Row():
                btnGenerate = gr.Button(value="Generate")
                btnDownloadOutputs = gr.Button(value="Download Outputs")
            # reference area
            with gr.Row():
                sliderGaussian = gr.Slider(minimum=1, maximum=9, value=1, step=2,
                                               label="Gaussian Kernel", info="3 is suitale")
                sliderCannyLow = gr.Slider(minimum=25, maximum=300, value=50, step=5,
                                               label="Canny Kernel Low", info="50 is suitale")
                sliderCannyHigh = gr.Slider(minimum=25, maximum=300, value=100, step=5,
                                               label="Canny Kernel High", info="100 is suitale")
                sliderLaplacianKernel = gr.Slider(minimum=1, maximum=15, value=3, step=2,
                                               label="Laplacian Kernel", info="3 is the suitale")
                sliderErosionKernel = gr.Slider(minimum=1, maximum=15, value=3, step=2,
                                               label="Erosion Strength", info="for shrink the line. 3 is suitable")
                sliderDilationKernel = gr.Slider(minimum=1, maximum=15, value=5, step=2,
                                               label="Dilation Strength", info="for dilate the line. 5 is suitable")
            with gr.Row():
                mode = gr.Radio(["Canny", "Laplacian", "Canny and Laplacian"],
                    label="Edge Detectiing Mode", value='Canny')
                contours = gr.Radio(["True", "False", "Canny Only"],
                                    label="Contours", value='True')
                lineLinkMode = gr.Radio(["Hough Transform", "Hough Transform(Canny)","Edge Linking(Canny Only)", "None"],
                                    label="Line Linking", value='Hough Transform')
            # Generate stretch images
            btnGenerate.click(fn=self.imageProcesser.sketch_image,
                               inputs=[imageInputs, sliderGaussian, sliderCannyLow, sliderCannyHigh, sliderLaplacianKernel, sliderErosionKernel, sliderDilationKernel, mode, contours, lineLinkMode], outputs=imageOutputs)    
            
            # download all ouput_images
            btnDownloadOutputs.click(fn=self.download_outputs, inputs=imageOutputs)

        input_blocks.launch()

    # download all output_images function
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