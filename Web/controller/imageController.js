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