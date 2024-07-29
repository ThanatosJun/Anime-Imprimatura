from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.route('/train', methods=['POST'])
def train_image():
    data = request.get_json()
    CHD_name = data.get('CHD_name')
    image_path = data.get('image_path')

    print('Now executing "Train". ')

    script_path = '/Users/pigg/Documents/GitHub/Anime-Imprimatura/Thanatos/yolov8_RPA_character_train_v3/PA_autoTraing_v5.py'

    try:
        print(f'Received train request with CHD_name: {CHD_name}, image_path: {image_path}')
        result = subprocess.run(['python', script_path, CHD_name, image_path], capture_output=True, text=True, check=True)
        output = result.stdout
        error = result.stderr
        print(f'Train script output: {output}')
        if error:
            print(f'Train script error: {error}')
        output += "\nTrain Completed."
        return jsonify({'status': 'success', 'output': output, 'error': error, 'CHD_name': CHD_name, 'image_path': image_path})
    except subprocess.CalledProcessError as e:
        print(f'Error during training: {e}')
        return jsonify({'status': 'error', 'error': str(e), 'CHD_name': CHD_name, 'image_path': image_path})
    except Exception as e:
        print(f'Unexpected error during training: {e}')
        return jsonify({'status': 'error', 'error': str(e), 'CHD_name': CHD_name, 'image_path': image_path})

if __name__ == '__main__':
    app.run(port=5001)