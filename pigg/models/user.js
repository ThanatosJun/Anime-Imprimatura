const mongoose = require('mongoose')
const Schema = mongoose.Schema

//create schema
const userSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    }, 
    gmail: {
        type: String,
        required: true,
    }, 
    password: {
        type: String,
        required: true,
    },
    personalGallery: Blob
});

//define model
const userModel = mongoose.model('User', userSchema);

//export model
module.exports = userModel