const mongoose = require('mongoose')
const Schema = mongoose.Schema

//create schema
const chdSchema = new mongoose.Schema({
    chd_id: {
        type: String,
        required: true,
    }, 
    file_route: {
        data: Buffer,
        contentType: String,
    }
});

//define model
const chdModel = mongoose.model('Chd', chdSchema);

//export model
module.exports = chdModel