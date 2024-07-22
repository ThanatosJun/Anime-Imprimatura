import requests
from flask import Flask, request, jsonify
import logging

app = Flask(__name__)

# Set up logging to output debug messages
logging.basicConfig(level=logging.DEBUG)

@app.route('/receive-file-path', methods=['POST'])
def receive_file_path():
    try:
        data = request.json # Receive JSON data from POST request
        app.logger.debug(f'Received data: {data}') # Log received data
        
        # Extract filePath from data
        file_path = data.get('filePath')
        
        if file_path:
            app.logger.debug(f'Received file path: {file_path}') # Log received filePath
            print(f'Received file path: {file_path}') # Print received filePath to console
            
            # # Prepare file data to upload
            # files = {'image': open(file_path, 'rb')}
            # url = 'http://localhost:3000/upload' # URL to upload file
            
            # # Send POST request to upload file
            # response = requests.post(url, files=files)
            
            # if response.status_code == 200:
            #     file_path = response.json().get('filePath')
            #     print(f'File uploaded to: {file_path}') # Print uploaded file path
            # else:
            #     print('Failed to upload file') # Print failure message if upload fails
                
            return 'File path received', 200 # Return success message
        else:
            app.logger.error('No file path received') # Log error if no filePath received
            return 'No file path received', 400 # Return error message if no filePath
        
    except Exception as e:
        app.logger.error(f'Error processing request: {e}') # Log error if exception occurs
        return jsonify(error=str(e)), 500 # Return error response with status code 500

# Start Flask application listening on port 5000    
if __name__ == '__main__':
    app.run(port=5000, debug=True)