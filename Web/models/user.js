const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); //automatically generate user_id

//create schema
const userSchema = new mongoose.Schema({
    user_id: {
        type: String,
        default: uuidv4, 
        required: true,
    }, 
    user_name:{
        type: String,
        required: true
    },
    gmail: {
        type: String,
        required: true,
        unique: true
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