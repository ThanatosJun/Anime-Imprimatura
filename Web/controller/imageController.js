require("dotenv").config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const fetch = require('node-fetch');

// Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // folder path
    const chdName = req.body.chdName;
    const uploadPath = path.join(__dirname, 'uploads', `folder_${Date.now()}`);

    // check if the folder exsists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // pass file path to cb
    cb(null, uploadPath);
    console.log("upload to destination successfully. ");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
console.log('Multer Done');

// Train
router.post('/uploadAndTrain', upload.fields([{ name: 'chd', maxCount: 1 }]), (req, res) => {
  console.log('Received upload request');

  if (!req.files || !req.files.chd || req.files.chd.length === 0) {
    console.log('No files uploaded.');
    return res.status(400).send('No files were uploaded.');
  } else {
    console.log('Files uploaded successfully.');
  }

  const uploadedFilePath = req.files.chd[0].path;
  const chdName = req.body.character_name;
  
  console.log('Uploaded file path:', uploadedFilePath);
  console.log('CHD Name:', chdName);

  const generatedImagePath = uploadedFilePath;
  console.log('Generated image path:', generatedImagePath);

  fetch('http://localhost:5001/train', {
    method: 'POST',
    body: JSON.stringify({ image_path: generatedImagePath, CHD_name: chdName }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('(imageController.js) Train response:', data);
    res.status(200).json(data);
  })
  .catch(error => {
    console.error('Error during train process:', error);
    res.status(500).json({ error: 'An error occurred during the train process.' });
  });
});

// Simulate file processing function
function processFile(file) {
  return { fileName: file.originalname, processed: true };
}

/**
 * Handle CHD upload and initial processing
 * @route POST /uploadAndTrain
 * @desc Handle multiple file uploads and initial processing
 * @input Array of files with key 'files'
 * @output JSON array of processed file data
 */
exports.uploadAndTrain = async (req, res) => {
  try {
      const files = req.files;
      if (!files || files.length === 0) {
          return res.status(400).json({ message: 'No files uploaded' });
      }

      // Process the uploaded files and generate initial data for each file
      const processedData = files.map(file => processFile(file));

      // Send the processed data back to the client
      res.json(processedData);
  } catch (error) {
      console.error('Error in /uploadAndTrain:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// 假設一個調用AI模型的函數
async function callAIApi(chdFiles, chsFiles) {
  // 模擬AI模型API調用，返回生成圖片的路徑
  // 實際實現需要根據AI模型的API來編寫
  return 'path/to/generated/image.png';
}
// Detect
router.post('/uploadAndDetect', (req, res) => {
  const detectData = req.body;

  fetch('http://localhost:5001/detect', {
    method: 'POST',
    body: JSON.stringify(detectData),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('Detect response:', data);
    res.status(200).json(data);
  })
  .catch(error => {
    console.error('Error during detect process:', error);
    res.status(500).json({ error: 'An error occurred during the detect process.' });
  });
});

module.exports = router;
