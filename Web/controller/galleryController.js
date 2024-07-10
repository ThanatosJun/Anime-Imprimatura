// this file is to display image of one users' in the gallery

require("dotenv").config();
const image = require('../models/image');

exports.getGallery = async(req, res) =>{
    try{
        // acquire images by user_id
        const images = await Image.find({ userID: req.user._id });
        res.render('gallery', { image });
    }catch(err){
        console.error('Error fetching gallery: ', err);
        res.status(500).send('Error fetching gallery. ');
    }
}