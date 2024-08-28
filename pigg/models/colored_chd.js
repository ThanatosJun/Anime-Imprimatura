const mongoose = require('mongoose')
const Schema = mongoose.Schema

//create schema
const colored_chdSchema = new mongoose.Schema({
    colored_chd_id: {
        type: String,
        required: true
    }, 
    file_route: {
        data: Buffer,
        contentType: String,
    },
    download_size: {
        type: Number
    },
    gallery_id: {
        type: String,
        required: true
    }
});

//define model
const colored_chdModel = mongoose.model('Colored_Chd', colored_chdSchema);

//export model
module.exports = colored_chdModel