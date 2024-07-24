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

@app.route('/detect', methods=['POST'])
def process_image():
    data = request.get_json()  # 获取POST请求的JSON数据
    chd_name = data.get('CHD_name')
    image_path = data.get('image_path')

    # 使用subprocess调用CHD_detect.py中的main函数
    result = subprocess.run(['python', 'detect.py', chd_name, image_path], capture_output=True, text=True)
    # detect_output = json.loads(result.stdout)

    # chd_name = detect_output['CHD_name']
    # image_path = detect_output['image_path']
        
    subprocess.run(['python', 'CHD_detect.py', chd_name, image_path])

    return jsonify({'status': 'success', 'CHD_name': chd_name, 'image_path': image_path})



if __name__ == '__main__':
    app.run(port=5001, debug=True)  # 在5000端口上启动服务