const mongoose = require('mongoose')
const Schema = mongoose.Schema
//automatically generate gallery_id
const { v4: uuidv4 } = require('uuid'); 

//create schema
const gallerySchema = new mongoose.Schema({
    gallery_id: {
        type: Number,
        required: true,
        default: uuidv4
    }, 
    user_id: {
        type: Number,
        required: true,
    },
    team_id: {
        type: Number
    }
});

//define model
const galleryModel = mongoose.model('Gallery', gallerySchema);

//export model
module.exports = galleryModel