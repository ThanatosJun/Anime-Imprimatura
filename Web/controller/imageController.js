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
router.post('/uploadAndTrain', uploadTrain.fields([{ name: 'chd', maxCount: 3 }]), async (req, res) => {
  try {
    console.log('req.body: ', req.body);
    const userId = req.body.user_id;
    console.log('user_id: ', userId);

    console.log('Received upload request');
    if (!req.files || !req.files.chd || req.files.chd.length === 0) {
      console.log('No files uploaded.');
      return res.status(400).send('No files were uploaded.');
    } else {
      console.log('Files uploaded successfully.');
    }

    const uploadedFilePath = [];
    for (let i = 0; i < req.files.chd.length; i++) {
      uploadedFilePath[i] = req.files.chd[i].path;
    }

    const chdName = req.body.character_name;
    console.log('Uploaded file path:', uploadedFilePath);
    console.log('CHD Name:', chdName);

    const generatedImagePath = uploadedFilePath;
    console.log('Generated image path:', generatedImagePath);

    // post to test.py
    const trainResponse = await fetch('http://localhost:5001/train', {
      method: 'POST',
      body: JSON.stringify({ image_path: generatedImagePath, CHD_name: chdName }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const trainData = await trainResponse.json();
    console.log('(imageController.js) Train response:', trainData);

    // get CHD_modelpt
    const CHD_modelpt = trainData.CHD_modelpt;

    // save chd if logged in
    if (userId) { 
      try {
        const saveResponse = await fetch('http://localhost:3000/saveToGallery_personal_chd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            image_paths: uploadedFilePath,
            character: chdName, 
            CHD_modelpt: CHD_modelpt
          })
        });

        const saveData = await saveResponse.json();
        console.log('Image saved to gallery:', saveData);
      } catch (saveError) {
        console.error('Error saving image to gallery:', saveError);
      }
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

    res.status(200).json(trainData);
  } catch (error) {
    console.error('Error during upload and train process:', error);
    res.status(500).json({ error: 'An error occurred during the upload and train process.' });
  }
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
router.post('/uploadAndDetect', uploadDetect.fields([{ name: 'chs', maxCount: 10 }]), async (req, res) => {
  try {
    console.log('Received Detect Data');
    const userId = req.body.user_id;
    console.log('user_id: ', userId);

    // Extract file paths from the uploaded files
    const options = req.body.options;
    const uploadedFilePath = [];

    for(let i = 0; i < req.files.chs.length; i++){
      uploadedFilePath[i] = req.files.chs[i].path;
    }

    console.log('chd_name: ', options);
    console.log('image_path: ', uploadedFilePath);

    // post to test.py
    const detectResponse = await fetch('http://localhost:5001/detect', {
      method: 'POST',
      body: JSON.stringify({ CHD_name: options, image_path: uploadedFilePath }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const detectData = await detectResponse.json();
    console.log('(imageController.js) Detect response:', detectData);

    const CHS_save_dir = detectData.CHS_save_dir;
    let imagePaths = [];

    // 定義一個函數來遍歷資料夾並獲取圖片路徑
    function getImagePaths(dir) {
      return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
          if (err) {
            return reject('Error reading directory: ' + err);
          }

          // 建立圖片路徑的陣列
          let imagePaths = [];

          // 將每個文件的完整路徑存入陣列
          files.forEach(file => {
            const filePath = path.join(dir, file);
            imagePaths.push(filePath);
          });

          // 返回圖片路徑陣列
          resolve(imagePaths);
        });
      });
    }

    // 遍歷 CHS_save_dir 資料夾並獲取所有圖片路徑
    imagePaths = await getImagePaths(CHS_save_dir);
    console.log('Image paths:', imagePaths);
    
    // save chs if logged in
    if (userId) { 
      try {
        const saveResponse = await fetch('http://localhost:3000/saveToGallery_personal_chs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            CHS_save_dir: imagePaths
          })
        });

        const saveData = await saveResponse.json();
        console.log('Image saved to gallery:', saveData);
      } catch (saveError) {
        console.error('Error saving image to gallery:', saveError);
      }
    }

    // clear the data
    const uploadDir = path.join(__dirname, 'uploadDetect', options);
    fs.rmdir(uploadDir, { recursive: true }, (err) => {
      if (err) {
        console.error('Error while deleting directory:', err);
      } else {
        console.log('Upload directory successfully deleted:', uploadDir);
      }
    });

    res.status(200).json(detectData);
  } catch (error) {
    console.error('Error during upload and detect process:', error);
    res.status(500).json({ error: 'An error occurred during the upload and detect process.' });
  }
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