const mongoose = require('mongoose')

//create schema
const userSchema = new mongoose.Schema({
    user_id: {
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
    }
    //personalGallery: Blob
});

//define model
const userModel = mongoose.model('User', userSchema);

//export model
module.exports = userModel