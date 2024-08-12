require("dotenv").config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const fetch = require('node-fetch');

// Multer for Train
const storageTrain = multer.diskStorage({
  destination: function (req, file, cb) {
    // folder path
    const chdName = req.body.character_name;
    console.log(chdName)
    // console.log(str(chdName))
    const uploadPath = path.join(__dirname, 'uploads', chdName);

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

const uploadTrain = multer({ storage: storageTrain });

// Train
router.post('/uploadAndTrain', uploadTrain.fields([{ name: 'chd', maxCount: 3 }]), (req, res) => {
  console.log('Received upload request');

  if (!req.files || !req.files.chd || req.files.chd.length === 0) {
    console.log('No files uploaded.');
    return res.status(400).send('No files were uploaded.');
  } else {
    console.log('Files uploaded successfully.');
  }

  const uploadedFilePath = [];
  for(let i = 0; i < req.files.chd.length; i++) {
    uploadedFilePath[i] = req.files.chd[i].path;
  }

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

// Multer for Detect
const storageDetect = multer.diskStorage({
  destination: function (req, file, cb) {
    // folder path
    const options = req.body.options;
    console.log(options)
    const uploadPath = path.join(__dirname, 'uploadDetect', options);

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

const uploadDetect = multer({ storage: storageDetect });

// Detect
router.post('/uploadAndDetect', uploadDetect.fields([{ name: 'chs', minCount: 2 }]), (req, res) => {
  console.log('Received Detect Data');

  const options = req.body.options;
  const uploadedFilePath = [];

  for(let i = 0; i < req.files.chs.length; i++){
    uploadedFilePath[i] = req.files.chd[i].path;
  }

  console.log('chd_name: ', options);
  console.log('image_path: ', uploadedFilePath);

  fetch('http://localhost:5001/detect', {
    method: 'POST',
    body: JSON.stringify({ CHD_name: options, image_path: uploadedFilePath}),
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