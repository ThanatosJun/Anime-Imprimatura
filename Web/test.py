from flask import Flask, request

app = Flask(__name__)

@app.route('/process_string', methods=['POST'])
def process_string():
    data = request.get_json()  # 获取POST请求的JSON数据
    dynamic_string = data.get('string', '')  # 从JSON数据中获取字符串

    # 在这里处理你的动态字符串
    processed_string = dynamic_string + ' 已经被处理过。'

    return {'processed_string': processed_string}  # 返回处理过的字符串

if __name__ == '__main__':
    app.run(port=5000)  # 在5000端口上启动服务