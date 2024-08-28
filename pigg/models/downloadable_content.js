const mongoose = require('mongoose')
const Schema = mongoose.Schema

//create schema
const gallerySchema = new mongoose.Schema({
    gallery_id: {
        type: String,
        required: true,
    }, 
    user_id: {
        type: String,
        required: true,
    },
    team_id: {
        type: String
    }
});

//define model
const galleryModel = mongoose.model('Gallery', gallerySchema);

//export model
module.exports = galleryModel