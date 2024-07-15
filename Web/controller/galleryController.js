// this file is to display image of one users' in the gallery

require("dotenv").config();
const image = require('../models/image');

exports.getGallery = async (req, res) => {
    try {
      const images = await Image.find({ userId: req.user._id }); // 根據用戶 ID 獲取圖片
      console.log('Fetched images:', images); // 添加日誌來檢查數據
      res.render('gallery', { images });
    } catch (err) {
      console.error('Error fetching gallery:', err);
      res.status(500).send('Error fetching gallery');
    }
  };