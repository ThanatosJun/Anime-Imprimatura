const mongoose = require('mongoose')
const Schema = mongoose.Schema

//create schema
const imageSchema = new mongoose.Schema({
    chs_id: {
        type: Number,
        required: true,
    }, 
    chd_id: {
        type: Number,
    },
    upload_user_id: {
        type: Number
    },
    character: {
        type: String,
        required: true
    }
});

//define model
const imageModel = mongoose.model('Image', imageSchema);

//export model
module.exports = imageModel