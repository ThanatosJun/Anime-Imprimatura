from flask import Flask, request, Response
from flask_pymongo import PyMongo
from gridfs import GridFS
from bson.objectid import ObjectId

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/user_images"
mongo = PyMongo(app)
fs = GridFS(mongo.db)

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' in request.files:
        image = request.files['image']
        content = image.read()
        image_id = fs.put(content, filename=image.filename)
        return f'Image uploaded successfully with id {image_id}'
    else:
        return 'No image found', 400

@app.route('/image/<image_id>', methods=['GET'])
def get_image(image_id):
    try:
        file = fs.get(ObjectId(image_id))
        response = Response(file.read(), mimetype='image/jpeg')
        response.headers.set('Content-Disposition', 'attachment', filename=file.filename)
        return response
    except:
        return 'File not found', 404

@app.route('/')
def home():
    return "Welcome to the Home Page!"

if __name__ == '__main__':
    app.run(debug=True)
