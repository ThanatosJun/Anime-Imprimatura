from flask import Flask, request, jsonify 
from flask_cors import CORS
import subprocess
import os
import json

app = Flask(__name__)
CORS(app)

@app.route('/process_string', methods=['POST'])
def process_string():
    data = request.get_json()  # 获取POST请求的JSON数据
    dynamic_string = data.get('string', '')  # 从JSON数据中获取字符串

    # 在这里处理你的动态字符串
    processed_string = dynamic_string + ' 已经被处理过。'

    # return {'processed_string': processed_string}  # 返回处理过的字符串
    return jsonify({'message': processed_string, 'data': data})

# train
@app.route('/train', methods=['POST'])
def train_image():
    data = request.get_json()
    CHD_name = data.get('CHD_name')
    image_path = data.get('image_path')
    
    print('Now executing "Train". ')
    import PA_autoTraing_v7
    try:
        print(f'Received train request with CHD_name: {CHD_name}, image_path: {image_path}')
        PA_autoTraing_v7.main(CHD_name, image_path)

        output = "Train script executed successfully."
        return jsonify({'status': 'success', 'output': output, 'CHD_name': CHD_name, 'image_path': image_path})
    except Exception as e:
        print(f'Error during training: {e}')
        return jsonify({'status': 'error', 'error': str(e), 'CHD_name': CHD_name, 'image_path': image_path})
    
# detect
@app.route('/detect', methods=['POST'])
def detect_image():
    data = request.get_json()  # 获取POST请求的JSON数据
    CHD_name = data.get('CHD_name')
    image_path = data.get('image_path')

    print('Now executing "Detect". ')
    import CHD_detect_v2
    CHS_save_dir = None
    try:
        print(f'Received detect request with CHD_name: {CHD_name}, image_path: {image_path}')
        CHS_save_dir = CHD_detect_v2.main(CHD_name, image_path)
        print(CHS_save_dir)            
        
        output = "Detect script executed successfully."
        return jsonify({'status': 'success', 'output': output, 'CHD_name': CHD_name, 'CHS_save_dir': CHS_save_dir})
    except Exception as e:
        print(f'Error during detecting: {e}')
        return jsonify({'status': 'error', 'error': str(e), 'CHD_name': CHD_name, 'CHS_save_dir': CHS_save_dir})
    
# segment
@app.route('/segment', methods=['POST'])
def segment_image():
    data = request.get_json()  # 获取POST请求的JSON数据
    CH_Name = data.get('CH_Name')

    print('Now executing "Segmentation". ')
    import CH_Segmentation
    color_dictionary = None
    CHS_Finished_dir = None
    try:
        print(f'Received segment request with CH_Name: {CH_Name}')
        color_dictionary, CHS_Finished_dir  = CH_Segmentation.main(CH_Name)
        print("Color Dictionary: ", color_dictionary)
        print("CHS Finished dir: ", CHS_Finished_dir)
        
        output = "Segment script executed successfully."
        return jsonify({'status': 'success', 'output': output, 'color_dictionary': color_dictionary, 'CHS_Finished_dir': CHS_Finished_dir})
    except Exception as e:
        print(f'Error during segmenting: {e}')
        return jsonify({'status': 'error', 'error': str(e), 'color_dictionary': color_dictionary, 'CHS_Finished_dir': CHS_Finished_dir})
    
if __name__ == '__main__':
    app.run(port=5001, debug=True)  # 在5001端口上启动服务