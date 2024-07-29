require("dotenv").config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

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
    console.log("upload to dest succ");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // 文件名
  }
});

const upload = multer({ storage });

// 处理上传和生成操作的路由
router.post('/uploadAndGenerate', upload.fields('chs'), (req, res) => {
  // 处理上传的文件和生成操作
  const uploadedFilePath = req.file.path;
  console.log('Uploaded file path:', uploadedFilePath);

  // 假设生成操作完成后返回生成图片的路径
  const generatedImagePath = '/path/to/generated/image.png';

  res.json({ generatedImagePath });

  if (!req.file.path) {
    return res.status(400).send('No file uploaded.');
  }
  res.status(200).json({ message: 'File uploaded successfully' });
});

// 处理 /detect 请求的路由
router.post('/detect', (req, res) => {
  // 在这里处理检测逻辑
  console.log('Detect data:', req.body);

  res.json({ message: 'Detect successful' });
});

// 處理上傳和生成
exports.uploadAndGenerate = async (req, res) => {
  // 設定Multer處理多個文件上傳
  const uploadMiddleware = upload.fields([
    { name: 'chd', maxCount: 3 },
    { name: 'chs', maxCount: 1 }
  ]);

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: 'Failed to upload files.' });
    }

    try {
      // 在這裡調用AI模型，生成新圖片
      const generatedImagePath = await callAIApi(req.files.chd, req.files.chs);
      console.log("1");
      
      // 假設AI生成的圖片已經保存在某個路徑
      const generatedImage = generatedImagePath; // AI生成的圖片路徑
      console.log("1");

      // 如果使用者登入，將生成的圖片路徑保存到使用者的gallery中
      // if (req.isAuthenticated()) {
      //   const userId = req.user._id;
      //   await User.findByIdAndUpdate(userId, {
      //     $push: { gallery: generatedImage }
      //   });
      // }

      // 重定向到生成頁面
      res.json(generatedImagePath);
      // res.redirect('/generated_visitor');
      console.log("Upload successful");
    } catch (error) {
      console.error('Generation error:', error);
      res.status(500).json({ error: 'Failed to generate image.' });
    }
  });
};

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