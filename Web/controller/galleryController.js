// this file is to display images of one users' in the gallery

require("dotenv").config();
const express = require('express');
const router = express.Router();
const Image = require('../models/image');
const Colored_Chd = require('../models/colored_chd');
const Gallery = require('../models/gallery');

// save final image to personal gallery
exports.saveToGallery_personal_chd = async (req, res) => {
  try {
    const { user_id, image_paths, character } = req.body;
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
      const newImage = new Image({
        file_route: fileRoute,
        gallery_id: existingGallery._id,
        user_id: user_id,
        character: character,
        path: fileRoute
      });
      await newImage.save();
      savedImages.push(newImage);
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