from flask import Flask, request, jsonify 
from flask_cors import CORS
import subprocess
import os
import json
from yolov8_RPA_character_train_v3.PA_autoTraing_v5 import main


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
    
    # route of PA_autoTraing_v5.py
    script_path = 'yolov8_RPA_character_train_v3/PA_autoTraing_v5.py'
    try:
        print(f'Received train request with CHD_name: {CHD_name}, image_path: {image_path}')
        result = subprocess.run(['python', script_path, CHD_name, image_path], capture_output=True, text=True, check=True)
        output = result.stdout
        error = result.stderr
        print(f'Train script output: {output}')
        if error:
            print(f'Train script error: {error}')
        # Append "Train Completed." to the output
        output += "\nTrain Completed."
        return jsonify({'status': 'success', 'output': output, 'error': error, 'CHD_name': CHD_name, 'image_path': image_path})
    except subprocess.CalledProcessError as e:
        print(f'Error during training: {e}')
        return jsonify({'status': 'error', 'error': str(e), 'CHD_name': CHD_name, 'image_path': image_path})
    except Exception as e:
        print(f'Unexpected error during training: {e}')
        return jsonify({'status': 'error', 'error': str(e), 'CHD_name': CHD_name, 'image_path': image_path})

# detect
@app.route('/detect', methods=['POST'])
def detect_image():
    data = request.get_json()  # 获取POST请求的JSON数据
    CHD_name = data.get('CHD_name')
    image_path = data.get('image_path')

    try:
        print(f'Received detect request with CHD_name: {CHD_name} and image_path: {image_path}')
        result = subprocess.run(['python', 'CHD_detect.py', CHD_name, image_path], capture_output=True, text=True, check=True)
        output = result.stdout
        error = result.stderr
        print(f'Detect script output: {output}')
        if error:
            print(f'Detect script error: {error}')
        return jsonify({'status': 'success', 'output': output, 'error': error, 'CHD_name': CHD_name, 'image_path': image_path})
    except subprocess.CalledProcessError as e:
        print(f'Error during detection: {e}')
        return jsonify({'status': 'error', 'error': str(e), 'CHD_name': CHD_name, 'image_path': image_path})
    except Exception as e:
        print(f'Unexpected error during detection: {e}')
        return jsonify({'status': 'error', 'error': str(e), 'CHD_name': CHD_name, 'image_path': image_path})
    
if __name__ == '__main__':
    app.run(port=5001, debug=True)  # 在5000端口上启动服务