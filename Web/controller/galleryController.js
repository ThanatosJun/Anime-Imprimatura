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

          const fileStream = fs.createReadStream(fileRoute);
          const uploadStream = gridFSBucket.openUploadStream(path.basename(fileRoute), {
            metadata: { user_id, character, CHD_modelpt },
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

                const newChd = new Chd({
                  gallery_id: existingGallery._id,
                  user_id: user_id,
                  character: character,
                  path: file.filename || path.basename(fileRoute),
                  createdAt: new Date(),
                  CHD_modelpt: CHD_modelpt, 
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
    const { user_id, image_paths } = req.body;
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
    for (const fileRoute of image_paths) {
      if (fs.existsSync(fileRoute)) {
        try {
          const gridFSBucket = getGridFSBucket();

          if (!gridFSBucket) {
            throw new Error('GridFSBucket is not initialized');
          }

          const fileStream = fs.createReadStream(fileRoute);
          const uploadStream = gridFSBucket.openUploadStream(path.basename(fileRoute), {
            metadata: { user_id },
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
    const { user_id, image_paths } = req.body;
    console.log('Saving request: ', req.body);

    // check if the gallery exists
    const existingGallery = await Gallery.findOne({ user_id });
    // the gallery does not exist
    if(!existingGallery){
      // create a new gallery
      existingGallery = new Gallery({
        user_id
      });
      await existingGallery.save();
      console.log('Created a personal gallery: ', existingGallery);
    }

    // save images to colored_chd
    const savedImages = [];
    for (const fileRoute of image_paths) {
      const newColoredChd = new Colored_Chd({
        file_route: fileRoute,
        gallery_id: existingGallery._id
      });
      await newColoredChd.save();
      savedImages.push(newColoredChd);
    }
    console.log('saved image to colored_chd: ', savedImages)

    // success msg
    res.status(200).json({message: 'Image saved successfully to personal gallery'});

  } catch (error) {
    console.error("saveToGallery_perosonal error: ", error);
    res.status(500).json({ error: "An error occurred during saveToGallery_perosonal. Please try again." });
  }
}

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
      });
    });

    // 将图片数组作为响应返回
    res.status(200).json({ images });
  } catch (error) {
    console.error('Error retrieving gallery:', error);
    res.status(500).json({ message: 'Error retrieving gallery' });
  }
};