// this file is to display images of one users' in the gallery

require("dotenv").config();
const express = require('express');
const router = express.Router();
const Colored_Chd = require('../models/colored_chd');
const Gallery = require('../models/gallery');

// // fetching personl gallery
// exports.getGalleryPersonal = async (req, res) => {
//     try {
//       // get message by user_id
//       const images = await Colored_Chd.find({ user_id: Gallery.user_id }); 
//       console.log('Fetched images:', images); 
//       res.render('gallery', { images });
//     } catch (err) {
//       console.error('Error fetching gallery:', err);
//       res.status(500).send('Error fetching gallery');
//     }
// };

// save image to personal gallery
exports.saveToGallery_personal = async (req, res) => {
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