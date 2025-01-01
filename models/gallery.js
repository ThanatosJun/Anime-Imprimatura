const mongoose = require('mongoose')
const Schema = mongoose.Schema
//automatically generate gallery_id
const { v4: uuidv4 } = require('uuid'); 

//create schema
const gallerySchema = new mongoose.Schema({
    gallery_id: {
        type: String,
        required: true,
        default: uuidv4
    }, 
    user_id: {
        type: String,
        required: true,
    },
    team_id: {
        type: String
    },
    chds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chd'
    }],
    chss: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chs'
    }],
    colored_chds:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colored_Chd'
    }]
});

//define model
const galleryModel = mongoose.model('Gallery', gallerySchema);

//export model
module.exports = galleryModel