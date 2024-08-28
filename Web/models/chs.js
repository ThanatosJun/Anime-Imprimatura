const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { v4: uuidv4 } = require('uuid'); //automatically generate user_id

//create schema
const chsSchema = new mongoose.Schema({
    chs_id: {
        type: String,
        default: uuidv4,
        required: true,
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
const chsModel = mongoose.model('Chs', chsSchema);

//export model
module.exports = chsModel