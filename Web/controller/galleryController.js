// this file is to display images of one users' in the gallery

require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const { getGridFSBucket } = require('../database');
const fs = require('fs');
const path = require('path');
const Chd = require('../models/chd');
const Chs = require('../models/chs');
const Colored_Chd = require('../models/colored_chd');
const Gallery = require('../models/gallery');

// save chd to personal gallery
exports.saveToGallery_personal_chd = async (req, res) => {
  try {
    const { user_id, image_paths, character } = req.body;
    console.log('Saving request: ', req.body);

    let existingGallery = await Gallery.findOne({ user_id });
    if (!existingGallery) {
      existingGallery = new Gallery({ user_id });
      await existingGallery.save();
      console.log('Created a personal gallery: ', existingGallery);
    }

    const savedImages = [];

    for (const fileRoute of image_paths) {
      if (fs.existsSync(fileRoute)) {
        try {
          const gridFSBucket = getGridFSBucket(); // 確保在使用時正確地獲取 gridFSBucket

          if (!gridFSBucket) {
            throw new Error('GridFSBucket is not initialized');
          }

          const fileStream = fs.createReadStream(fileRoute);
          const uploadStream = gridFSBucket.openUploadStream(path.basename(fileRoute), {
            metadata: { user_id, character },
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
                  CHD_modelpt: '', // 這個字段根據需要填寫
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
    const { user_id, image_paths } = req.body;
    console.log('Saving request: ', req.body);

    // check if the gallery exists
    let existingGallery = await Gallery.findOne({ user_id });
    // the gallery does not exist
    if(!existingGallery){
      // create a new gallery
      existingGallery = new Gallery({
        user_id
      });
      await existingGallery.save();
      console.log('Created a personal gallery: ', existingGallery);
    }

    // save images to image
    const savedImages = [];
    for (const fileRoute of image_paths) {
      const newChs = new Chs({
        gallery_id: existingGallery._id,
        user_id: user_id,
        path: fileRoute
      });
      await newChs.save();
      savedImages.push(newChs);
    }
    console.log('saved image to image: ', savedImages)

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
    const gallery = await Gallery.findOne({ user_id: req.user.id }).populate('chds');
    if (!gallery || gallery.chds.length === 0) {
      return res.render('gallery', { images: [] });
    }

    const images = gallery.chds.map(chd => ({
      path: chd.path,
      character: chd.character,
      // 你可以根據需要添加更多字段
    }));

    res.render('gallery', { images });
    res.status(200).json({message: 'Image displayed successfully to personal gallery'});
  } catch (error) {
    console.error('Error retrieving gallery:', error);
    res.status(500).send('Error retrieving gallery');
  }
};