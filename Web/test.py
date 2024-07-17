import requests

# 上传文件并获取文件路径
def upload_file(file_path):
    url = 'http://localhost:3000/upload'
    files = {'upload-box': open(file_path, 'rb')}
    response = requests.post(url, files=files)
    if response.status_code == 200:
        file_path = response.json().get('filePath')
        return file_path
    else:
        raise Exception(f"Failed to upload file: {response.text}")

# 示例使用
file_path = 'path/to/your/image.jpg'
uploaded_file_path = upload_file(file_path)
print('Uploaded file path:', uploaded_file_path)