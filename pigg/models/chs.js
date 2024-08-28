const mongoose = require('mongoose')
const Schema = mongoose.Schema

//create schema
const chsSchema = new mongoose.Schema({
    chs_id: {
        type: String,
        required: true,
    }, 
    file_route: {
        data: Buffer,
        contentType: String,
    }
});

//define model
const chsModel = mongoose.model('Chs', chsSchema);

//export model
module.exports = chsModel