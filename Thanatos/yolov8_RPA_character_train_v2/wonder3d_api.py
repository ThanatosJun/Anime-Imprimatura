"""
Reference:image_dir from PA_autoTraing_v3.py
Return:6*CHD inputs images
Features:
1.Use Wonder3d api to generate multiviews
"""
from gradio_client import Client
import os
import shutil
def generate(image_dir): 
	files = os.listdir(image_dir)
	#@title Wonder3d API by flamehaze1115
	# Initialize the client with the demo space URL
	client = Client("https://flamehaze1115-wonder3d-demo.hf.space/--replicas/g7go3/")
	# for each CHD in folder for generating multiple views
	for file in files:
		if file.endswith('.jpg') or file.endswith('.png'):
			file_name, file_ext = os.path.splitext(file)
			result = client.predict(
					image_dir + '/' + file,	# str (filepath on your computer (or URL) of image) in 'parameter_11' Image component
					3,	# int | float (numeric value between 1 and 5) in 'Classifier Free Guidance Scale' Slider component
					75,	# int | float (numeric value between 15 and 100) in 'Number of Diffusion Inference Steps' Slider component
					42,	# int | float  in 'Seed' Number component
					192,	# int | float  in 'Crop size' Number component
					fn_index=2
			)
			#@title Save outputs
			# Save each output image with the specified names
			for i, temp_path in enumerate(result[0:6], 1):  # Limit to first 6 paths and enumerate starting from 1
				output_path = image_dir + "/" + file_name + f"_{i}.png" # Change name for desired output
				shutil.copy(temp_path, output_path)
				print(f"Saved {temp_path} as {output_path}")