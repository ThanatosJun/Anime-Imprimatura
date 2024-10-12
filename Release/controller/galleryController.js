// this file is to display images of one users' in the gallery

const dotenv = require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const { getGridFSBucket } = require('../database');
const fs = require('fs');
const path = require('path');
const Chd = require('../models/chd');
const Chs = require('../models/chs');
const Colored_Chd = require('../models/colored_chd');
const Gallery = require('../models/gallery');
const g = require("gridfs-stream");

// save chd to personal gallery
exports.saveToGallery_personal_chd = async (req, res) => {
  try {
    console.log('---start saving chd---');
    const { user_id, image_paths, character, CHD_modelpt } = req.body;
    console.log('Saving request: ', req.body);

    let existingGallery = await Gallery.findOne({ user_id });
    if (!existingGallery) {
      existingGallery = new Gallery({ user_id });
      await existingGallery.save();
      console.log('Created a personal gallery: ', existingGallery);
    }

    const savedImages = [];

    // loading multiple chd with for loop
    for (const fileRoute of image_paths) {
      if (fs.existsSync(fileRoute)) {
        try {
          const gridFSBucket = getGridFSBucket();

          if (!gridFSBucket) {
            throw new Error('GridFSBucket is not initialized');
          }
          const file_type = 'chd';
          const fileStream = fs.createReadStream(fileRoute);
          const uploadStream = gridFSBucket.openUploadStream(path.basename(fileRoute), {
            metadata: { user_id, character, CHD_modelpt, file_type },
          });

          await new Promise((resolve, reject) => {
            fileStream.pipe(uploadStream);

            uploadStream.on('error', (err) => {
              console.error(`Error in upload stream for file ${fileRoute}:`, err);
              reject(err);
            });

            uploadStream.on('finish', async (file) => {
              try {
                if (!file) {
                  console.error(`File object is undefined for ${fileRoute}`);
                  return reject(new Error(`File object is undefined for ${fileRoute}`));
                }

                console.log('File upload finished. File object:', file);

                const chdModelptString = CHD_modelpt.join(',');

                const newChd = new Chd({
                  gallery_id: existingGallery._id,
                  user_id: user_id,
                  character: character,
                  path: file.filename || path.basename(fileRoute),
                  createdAt: new Date(),
                  CHD_modelpt: character, 
                });

                await newChd.save();
                savedImages.push(newChd);
                console.log('Saved image to database: ', newChd);
                resolve();
              } catch (err) {
                console.error(`Error saving CHD for file ${fileRoute}:`, err);
                reject(err);
              }
            });
          });
        } catch (err) {
          console.error(`Error processing file ${fileRoute}:`, err);
        }
      } else {
        console.error(`File not found: ${fileRoute}`);
      }
    }

    res.status(200).json({ message: 'Images saved successfully to personal gallery', savedImages });
  } catch (error) {
    console.error("saveToGallery_personal error: ", error);
    res.status(500).json({ error: "An error occurred during saveToGallery_personal_chd. Please try again." });
  }
};

// save chs to personal gallery
exports.saveToGallery_personal_chs = async (req, res) => {
  try {
    console.log('---start saving chs---');
    const { user_id, CHS_save_dir } = req.body;
    console.log('Saving request: ', req.body);

    // check if the gallery exists
    let existingGallery = await Gallery.findOne({ user_id });
    if (!existingGallery) {
      // create a new gallery
      existingGallery = new Gallery({ user_id });
      await existingGallery.save();
      console.log('Created a personal gallery: ', existingGallery);
    }

    // save images to image
    const savedImages = [];

    // loading multiple chd with for loop
    for (const fileRoute of CHS_save_dir) {
      if (fs.existsSync(fileRoute)) {
        try {
          const gridFSBucket = getGridFSBucket();

          if (!gridFSBucket) {
            throw new Error('GridFSBucket is not initialized');
          }

          const file_type = 'chs';
          const fileStream = fs.createReadStream(fileRoute);
          const uploadStream = gridFSBucket.openUploadStream(path.basename(fileRoute), {
            metadata: { user_id, file_type },
          });

          await new Promise((resolve, reject) => {
            fileStream.pipe(uploadStream);

            uploadStream.on('error', (err) => {
              console.error(`Error in upload stream for file ${fileRoute}:`, err);
              reject(err);
            });

            uploadStream.on('finish', async (file) => {
              try {
                if (!file) {
                  console.error(`File object is undefined for ${fileRoute}`);
                  return reject(new Error(`File object is undefined for ${fileRoute}`));
                }

                console.log('File upload finished. File object:', file);

                const fileRoute = CHS_save_dir.join(',');
                const newChs = new Chs({
                  gallery_id: existingGallery._id,
                  user_id: user_id,
                  path: fileRoute
                });
                await newChs.save();
                savedImages.push(newChs);
                console.log('Saved image to database: ', newChs);
                resolve();
              } catch (err) {
                console.error(`Error saving CHD for file ${fileRoute}:`, err);
                reject(err);
              }
            });
          });
        } catch (err) {
          console.error(`Error processing file ${fileRoute}:`, err);
        }
      } else {
        console.error(`File not found: ${fileRoute}`);
      }
    }

    // success msg
    res.status(200).json({message: 'Image saved successfully to personal gallery'});
  } catch (error) {
    console.error("saveToGallery_perosonal error: ", error);
    res.status(500).json({ error: "An error occurred during saveToGallery_perosonal_chd. Please try again." });
  }
}

// save final image to personal gallery
exports.saveToGallery_personal_final = async (req, res) => {
  try {
    console.log('---start saving final_img---');
    const { user_id, image_paths } = req.body;
    console.log('Saving request: ', req.body);

    // 檢查或建立使用者的圖庫
    let existingGallery = await Gallery.findOne({ user_id });
    if (!existingGallery) {
      existingGallery = new Gallery({ user_id });
      await existingGallery.save();
      console.log('Created a personal gallery: ', existingGallery);
    }

    const savedImages = [];
    const resolvedPaths = [];

    // 逐一解析每個路徑
    for (const imagePath of image_paths) {
      if (typeof imagePath === 'string') {
        const resolvedPath = path.resolve(imagePath);
        console.log('Resolved path:', resolvedPath);

        // 檢查該路徑是否存在
        if (!fs.existsSync(resolvedPath)) {
          console.error(`Path does not exist: ${resolvedPath}`);
          return res.status(400).json({ error: `Path does not exist: ${resolvedPath}` });
        }

        resolvedPaths.push(resolvedPath);
      } else {
        console.error('Invalid path, expected a string:', imagePath);
        return res.status(400).json({ error: 'Invalid path format.' });
      }
    }

    console.log('All resolved paths:', resolvedPaths);

    // 上傳每個檔案
    for (const fileRoute of resolvedPaths) {
      try {
        if (fs.existsSync(fileRoute) && fs.lstatSync(fileRoute).isFile()) {
          const gridFSBucket = getGridFSBucket();
          if (!gridFSBucket) throw new Error('GridFSBucket is not initialized');

          const fileStream = fs.createReadStream(fileRoute);
          const uploadStream = gridFSBucket.openUploadStream(path.basename(fileRoute), {
            metadata: { user_id, file_type: 'finalImg' },
          });

          await new Promise((resolve, reject) => {
            fileStream.pipe(uploadStream);

            uploadStream.on('error', (err) => {
              console.error(`Error in upload stream for ${fileRoute}:`, err);
              reject(err);
            });

            uploadStream.on('finish', async (file) => {
              if (!file) {
                const errorMsg = `File object is undefined for ${fileRoute}`;
                console.error(errorMsg);
                return reject(new Error(errorMsg));
              }

              console.log('File upload finished. File object:', file);

              const newColored_Chd = new Colored_Chd({
                gallery_id: existingGallery._id,
                user_id: user_id,
                path: file.filename,
              });

              await newColored_Chd.save();
              savedImages.push(newColored_Chd);
              console.log('Saved image to database: ', newColored_Chd);
              resolve();
            });
          });
        } else {
          console.error(`File not found or not a valid file: ${fileRoute}`);
        }
      } catch (err) {
        console.error(`Error processing file ${fileRoute}:`, err);
      }
    }

    res.status(200).json({ message: 'Image saved successfully to personal gallery' });
  } catch (error) {
    console.error('saveToGallery_personal_final error:', error);
    res.status(500).json({ error: 'An error occurred during saveToGallery_personal_final. Please try again.' });
  }
};

// display gallery
exports.getPersonalGallery = async (req, res) => {
  try {
    const gridFSBucket = getGridFSBucket(); // 假设你有一个函数来获取 GridFSBucket
    const { user_id } = req.body;

    // 在 GridFS 中找到与该 user_id 相关的所有文件
    const cursor = gridFSBucket.find({ "metadata.user_id": user_id });

    // 用于存储图片信息的数组
    const images = [];

    // 遍历 cursor，并将每个文件的信息加入数组中
    await cursor.forEach(file => {
      images.push({
        _id: file._id, // 确保返回图片的 _id
        filename: file.filename,
        contentType: file.contentType,
        uploadDate: file.uploadDate,
        file_type: file.metadata.file_type,
      });
    });

    // 将图片数组作为响应返回
    res.status(200).json({ images });
  } catch (error) {
    console.error('Error retrieving gallery:', error);
    res.status(500).json({ message: 'Error retrieving gallery' });
  }
};

exports.deleteImageGallery = async (req, res) => {
  try {
    console.log('---start deleting img---');
    const file_id = mongoose.Types.ObjectId(req.body.image_id);
    console.log('file_id: ', file_id);
    console.log('req.body: ', req.body);
    
    if(!file_id){
      return res.status(400).json({ error: 'File ID is required' });
    }

    const gridFSBucket = getGridFSBucket();
    if(!gridFSBucket){
      throw new Error('GridFSBucket is not initialize');
    }
    
    // delete the file from gfs by file_id
    await gridFSBucket.delete(new mongoose.Types.ObjectId(file_id), (err) => {
      if (err) {
        console.error('Error deleting file from GridFS:', err);
        return res.status(500).json({ error: 'Failed to delete file from GridFS' });
      }

      console.log(`File ${file_id} deleted from GridFS`);
      res.status(200).json({ success: true, message: 'Image deleted successfully from GridFS' });
    });

  } catch (error) {
    console.error('Error deleting image: ', error);
    res.status(500).json({ message: 'Error deleting image' });
  }
}