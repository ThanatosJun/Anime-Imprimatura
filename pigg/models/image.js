const mongoose = require('mongoose')
const Schema = mongoose.Schema

//create schema
const imageSchema = new mongoose.Schema({
    chs_id: {
        type: String,
        required: true,
    }, 
    chd_id: {
        type: String,
    },
    upload_user_id: {
        type: String
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