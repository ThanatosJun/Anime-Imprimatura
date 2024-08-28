require("dotenv").config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const fetch = require('node-fetch');
const crypto = require('crypto');

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
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadTrain = multer({ storage: storageTrain });

// Train
router.post('/uploadAndTrain', uploadTrain.fields([{ name: 'chd', maxCount: 3 }]), (req, res) => {
  console.log('req.body: ', req.body);
  const userId = req.body.user_id;
  console.log('user_id: ', userId);

  // normal train
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
    // save images to database
    if (userId) { 
      fetch('http://localhost:3000/saveToGallery_personal_chd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          image_paths: uploadedFilePath,
          character: chdName
        })
      })
      .then(saveResponse => saveResponse.json())
      .then(saveData => {
        console.log('Image saved to gallery:', saveData);
      })
      .catch(saveError => {
        console.error('Error saving image to gallery:', saveError);
      });
    }

    // clear the data
    const uploadDir = path.join(__dirname, 'uploads', chdName);
    fs.rmdir(uploadDir, { recursive: true }, (err) => {
      if (err) {
        console.error('Error while deleting directory:', err);
      } else {
        console.log('Upload directory successfully deleted:', uploadDir);
      }
    });
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
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadDetect = multer({ storage: storageDetect });

// Detect
router.post('/uploadAndDetect', uploadDetect.fields([{ name: 'chs', maxCount: 10 }]), (req, res) => {
  console.log('Received Detect Data');
  
  // Extract file paths from the uploaded files
  const options = req.body.options;
  const uploadedFilePath = [];

  for(let i = 0; i < req.files.chs.length; i++){
    uploadedFilePath[i] = req.files.chs[i].path;
  }

  console.log('chd_name: ', options);
  console.log('image_path: ', uploadedFilePath);

  // Send a POST request to the detect service
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
    // clear the data
    const uploadDir = path.join(__dirname, 'uploadDetect', options);
    fs.rmdir(uploadDir, { recursive: true }, (err) => {
      if (err) {
        console.error('Error while deleting directory:', err);
      } else {
        console.log('Upload directory successfully deleted:', uploadDir);
      }
    });
    res.status(200).json(data);
  })
  .catch(error => {
    console.error('Error during detect process:', error);
    res.status(500).json({ error: 'An error occurred during the detect process.' });
  });
});

// Segment
router.post('/uploadAndSegment', (req, res) => {
  console.log('Received Detect Data');

  // Check the content of req.body
  console.log('Request body:', req.body);
  console.log('Option value:', req.body.options);
  
  // Extract file paths from the uploaded files
  const CH_Name = req.body.options;
  console.log('CH_Name: ', CH_Name);

  // Send a POST request to the segment service
  fetch('http://localhost:5001/segment', {
    method: 'POST',
    body: JSON.stringify({ CH_Name: CH_Name}),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('Segment response:', data);
    res.status(200).json(data);
  })
  .catch(error => {
    console.error('Error during segment process:', error);
    res.status(500).json({ error: 'An error occurred during the segment process.' });
  });
});

module.exports = router;