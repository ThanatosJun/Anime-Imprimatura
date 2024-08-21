// this file is to display images of one users' in the gallery

require("dotenv").config();
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const Colored_Chd = require('../models/colored_chd');
const Gallery = require('../models/gallery');

// fetching personl gallery
exports.getGalleryPersonal = async (req, res) => {
    try {
      // get message by user_id
      const images = await Colored_Chd.find({ user_id: Gallery.user_id }); 
      console.log('Fetched images:', images); 
      res.render('gallery', { images });
    } catch (err) {
      console.error('Error fetching gallery:', err);
      res.status(500).send('Error fetching gallery');
    }
};

// save image to personal gallery
exports.saveToGallery_perosonal = async (req, res) => {
  try {
    const { user_id, file_route } = req.body;
    console.log('Saving request: ', req.body);

    // check if the gallery exists
    const existingGallery = await Gallery.findOne({ user_id: Gallery.user_id});
    // the gallery does not exist
    if(!existingGallery){
      // create a new gallery
      const newGallery = new Gallery({
        user_id: user_id
      });
      await newGallery.save();
      console.log('Created a personal gallery: ', newGallery);
    }

    // save image to colored_chd
    const newColoredChd = new Colored_Chd({
      file_route: file_route,
      gallery_id: Gallery.gallery_id
    });
    await newColoredChd.save();
    console.log('saved image to colored_chd: ', newColoredChd)

    // success msg
    res.status(200).json({message: 'Image saved successfully to personal gallery'});

  } catch (error) {
    console.error("saveToGallery_perosonal error: ", error);
    res.status(500).json({ error: "An error occurred during saveToGallery_perosonal. Please try again." });
  }
}

// fetching team gallery
exports.getGalleryTeam = async (req, res) => {
  try {
    // get message by gallery_id
    const images = await Colored_Chd.find({ gallery_id: req.Colored_Chd.gallery_id }); 
    console.log('Fetched images:', images); 
    res.render('gallery', { images });
  } catch (err) {
    console.error('Error fetching gallery:', err);
    res.status(500).send('Error fetching gallery');
  }
};

// save image to team gallery
exports.saveToGallery_team = async (req, res) => {
  try {
    const { user_id, team_id } = req.body;
    console.log('Saving request: ', req.body);

    // check if the gallery exists
    const existingGallery = await Gallery.findOne({ team_id: Gallery.team_id});
    // the gallery does not exist
    if(!existingGallery){
      // create a new gallery
      const newGallery = new Gallery({
        team_id: team_id,
        user_id: user_id
      });
      await newGallery.save();
      console.log('Created a team gallery: ', newGallery);
    }

    // save image to colored_chd
    const newColoredChd = new Colored_Chd({
      file_route: file_route,
      gallery_id: Gallery.gallery_id
    });
    await newColoredChd.save();
    console.log('saved image to colored_chd: ', newColoredChd)

    // success msg
    res.status(200).json({message: 'Image saved successfully to team gallery'});

  } catch (error) {
    console.error("saveToGallery_team error: ", error);
    res.status(500).json({ error: "An error occurred during saveToGallery_team. Please try again." });
  }
}