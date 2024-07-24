require("dotenv").config();
const multer = require('multer');
const path = require('path');

// 設定Multer存儲
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '...', 'Thanatos', 'yolov8_RPA_character_train_v2', 'CHD_images')); // 文件存儲路徑
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // 文件名
  }
});

const upload = multer({ storage: storage });

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
      
      // 假設AI生成的圖片已經保存在某個路徑
      const generatedImage = generatedImagePath; // AI生成的圖片路徑

      // 如果使用者登入，將生成的圖片路徑保存到使用者的gallery中
      if (req.isAuthenticated()) {
        const userId = req.user._id;
        await User.findByIdAndUpdate(userId, {
          $push: { gallery: generatedImage }
        });
      }

      // 重定向到生成頁面
      res.redirect('/generated-visitor');
    } catch (error) {
      console.error('Generation error:', error);
      res.status(500).json({ error: 'Failed to generate image.' });
    }
  });
};

// 假設一個調用AI模型的函數
async function callAIApi(chdFiles, chsFiles) {
  // 模擬AI模型API調用，返回生成圖片的路徑
  // 實際實現需要根據AI模型的API來編寫
  return 'path/to/generated/image.png';
}