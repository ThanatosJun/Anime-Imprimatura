# v0.0.2 by babaochou
import cv2
import numpy as np
import gradio as gr

class ImageProcesser:
    def __init__(self):
        pass

    # Function -- Turn Image into Sketch with modes select-able
    def sketch_image(self, image, pencilShadow, outlineSimplify, R, G, B, mode):
        try:
            outlineBlur = (2*outlineSimplify)+1

            lineColour = (R, G, B)

            # if (bgMode == 'Remove Background'):
            #     # image = removeBackground(image)
            #     None
            # elif (bgMode == 'Keep Background'):
            #     None

            # Turn image into grayscale
            gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            # Make a inverted grayscale for after-processing
            gray_image_inverted = cv2.bitwise_not(gray_image)
            # Apply GaussianBlur to the inverted image
            blurred_inverted_gray = cv2.GaussianBlur(
                gray_image_inverted, (pencilShadow, pencilShadow), 0)
            # Make a inverted GaussianBlur for after-processing
            inverted_blurred_image = cv2.bitwise_not(blurred_inverted_gray)
           
            # For Canny-Algorithm
            edgeFindingImage = cv2.GaussianBlur(
                gray_image, (outlineBlur, outlineBlur), 0)
            # Using Canny-Algorithm to get better outline from the grayscale
            edges = cv2.bitwise_not(cv2.Canny(edgeFindingImage, 100, 200))

            cv2.normalize(edges, edges, 0, 255, norm_type=cv2.NORM_MINMAX)
            # Craete a mask for outline colouring
            edge_mask = np.zeros_like(image)
            edge_mask[:, :] = lineColour
            # Changing outline colour
            edges = cv2.bitwise_or(
                edge_mask, cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR))
            # # Split the 3-channels
            # _b, _g, _r = cv2.split(edges)
            # # Create a alpha channel
            # _a = np.full(image.shape, A)
            # # Merge into a RGBA
            # edges = cv2.merge((_b, _g, _r, _a))
            # # Changing back to 3-channels
            # edges = cv2.cvtColor(edges, cv2.COLOR_BGRA2BGR)

            # If user want shadow from the grayscale as well
            if (mode == 'With Shadow'):
                pencil_sketch_image = cv2.divide(
                    gray_image, inverted_blurred_image, scale=226.0)
                # Chaning the image into 4-channels
                pencil_sketch_image = cv2.cvtColor(
                    pencil_sketch_image, cv2.COLOR_GRAY2BGR)
                # Giving a better outline
                combined_image = cv2.bitwise_and(pencil_sketch_image, edges)
                return combined_image
            # If user want outline only
            elif (mode == 'Outline Only'):
                return edges
            # If user want Negative only
            elif (mode == 'Negative'):
                pencil_sketch_image = cv2.divide(
                    gray_image, inverted_blurred_image, scale=226.0)
                # Giving a better outline then make a negative
                combined_image = cv2.bitwise_not(pencil_sketch_image, edges)
                return combined_image
            # If user want gray image
            elif (mode == 'GrayScale'):
                return gray_image
            # if user want inverted gray image
            elif (mode == 'Inverted GrayScale'):
                return gray_image_inverted
            # If user want blurred inverted gray image
            elif (mode == 'Blurred Inverted GrayScale'):
                return blurred_inverted_gray
            elif (mode == 'Inverted Blurred Inverted GrayScale'):
                return inverted_blurred_image
            elif (mode == 'Canny'):
                return edgeFindingImage
        except Exception as error:
            return None
        

class GradioInterface:
    def __init__(self):

        self.imageProcesser = ImageProcesser()

        with gr.Blocks() as input_blocks:
            with gr.Row():
                imageInput = gr.Image(label="Original")
                imageOutput = gr.Image(label='Processed')
            btnGenerate = gr.Button(value='Generate')
            with gr.Row():
                sliderShadow = gr.Slider(minimum=1, maximum=27, value=9, step=2,
                                         label="Shadow Strengthen", info="9 is for outline only, 21 is with shadows")
                sliderOutline = gr.Slider(minimum=0, maximum=7, value=0, step=1,
                                          label="Outline Simplify", info="")
            with gr.Row():
                sldierR = gr.Slider(label='R', minimum=0,
                                    maximum=255, step=1, value=0)
                sliderG = gr.Slider(label='G', minimum=0,
                                    maximum=255, step=1, value=0)
                sliderB = gr.Slider(label='B', minimum=0,
                                    maximum=255, step=1, value=0)
                # sliderA = gr.Slider(label='A', minimum=0,
                #                     maximum=255, step=1, value=0)
            radioMode = gr.Radio(["With Shadow", "Negative", "GrayScale", "Inverted GrayScale","Blurred GrayScale", "Blurred Inverted GrayScale", "Inverted Blurred Inverted GrayScale", "Canny", "Outline Only"],
                                 label="Mode", value='With Shadow')

            # radioBackground = gr.Radio(['Keep Background', 'Remove Background'],
            #                            value='Keep Background')
            # button to start processing
            btnGenerate.click(fn=self.imageProcesser.sketch_image,
                              inputs=[imageInput, sliderShadow, sliderOutline, sldierR, sliderG, sliderB, radioMode], outputs=imageOutput)

        input_blocks.launch()

if __name__ == "__main__":
    gradio_interface = GradioInterface()