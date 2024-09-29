const mongoose = require('mongoose')
const Schema = mongoose.Schema

//create schema
const downloadable_contentSchema = new mongoose.Schema({
    downloadable_content_id: {
        type: Number,
        required: true,
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
const downloadable_contentModel = mongoose.model('Downloadable_Content', downloadable_contentSchema);

//export model
module.exports = downloadable_contentModel