const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { v4: uuidv4 } = require('uuid'); //automatically generate user_id

//create schema
const imageSchema = new mongoose.Schema({
    image_id:{
        type: String,
        default: uuidv4,
        required: true
    },
    character: {
        type: String,
        required: true
    }, 
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    path: {
        type: String,
        required: true
    }, 
    createdAt: {
        type: Date,
        dafault: Date.now
    }
});

//define model
const imageModel = mongoose.model('Image', imageSchema);

//export model
module.exports = imageModel