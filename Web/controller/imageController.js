require("dotenv").config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const fetch = require('node-fetch');

// 設定Multer存儲
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 获取要保存的文件夹路径（例如，按时间或其他参数创建文件夹）
    const uploadPath = path.join(__dirname, 'uploads', `folder_${Date.now()}`);

    // 检查文件夹是否存在，如果不存在则创建
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // 将上传路径传递给 cb
    cb(null, uploadPath);
    console.log("upload to destination successfully. ");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // 文件名
  }
});

const upload = multer({ storage });
console.log('Multer Done');

// 处理上传和生成操作的路由
// 处理上传和生成操作的路由
router.post('/uploadAndTrain', upload.fields([{ name: 'chd', maxCount: 1 }]), (req, res) => {
  console.log('Received upload request');

  if (!req.files || !req.files.chd || req.files.chd.length === 0) {
    console.log('No files uploaded.');
    return res.status(400).send('No files were uploaded.');
  } else {
    console.log('Files uploaded successfully.');
  }

  const uploadedFilePath = req.files.chd[0].path;
  console.log('Uploaded file path:', uploadedFilePath);

  const generatedImagePath = uploadedFilePath;
  console.log('Generated image path:', generatedImagePath);

  fetch('http://localhost:5001/train', {
    method: 'POST',
    body: JSON.stringify({ image_path: generatedImagePath }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('Train response:', data);
    res.status(200).json(data);
  })
  .catch(error => {
    console.error('Error during train process:', error);
    res.status(500).json({ error: 'An error occurred during the train process.' });
  });
});

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