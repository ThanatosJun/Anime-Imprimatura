const mongoose = require('mongoose')
const Schema = mongoose.Schema

//create schema
const coloring_videoSchema = new mongoose.Schema({
    coloring_video_id: {
        type: Number,
        required: true,
    }, 
    file_route: {
        data: Buffer,
        contentType: String,
    },
    downloable_content_id: {
        type: Number,
        required: true
    }
});

//define model
const coloring_videoModel = mongoose.model('Coloring_Video', coloring_videoSchema);

//export model
module.exports = coloring_videoModel