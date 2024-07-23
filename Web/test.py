from flask import Flask, request, jsonify 
from flask_cors import CORS
import subprocess
import os

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

@app.route('/process_image', methods=['POST'])
def process_image():
    data = request.get_json()  # 获取POST请求的JSON数据
    image_path = data.get('image_path', '')  # 从JSON数据中获取图片路径
    CHD_Name = data.get('CHD_Name', 'default_CHD_Name')

    if not image_path or not os.path.exists(image_path):
        return jsonify({'error': 'Invalid image path'}), 400

    # 使用subprocess调用CHD_detect.py中的main函数
    result = subprocess.run(['python', 'CHD_detect.py', CHD_Name, image_path], capture_output=True, text=True)

    if result.returncode != 0:
        return jsonify({'error': 'Failed to process image', 'details': result.stderr}), 500

    processed_image_path = result.stdout.strip()

    return jsonify({'message': 'Image processed successfully', 'processed_image_path': processed_image_path})


if __name__ == '__main__':
    app.run(port=5001, debug=True)  # 在5000端口上启动服务