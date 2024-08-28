const { MaxKey } = require('mongodb');
const mongoose = require('mongoose')
const Schema = mongoose.Schema

//create schema
const teamSchema = new mongoose.Schema({
    team_id: {
        type: String,
        required: true,
    }, 
    team_name: {
        type: String,
        required: true,
        min: 0,
        max: 45
    }
});

//define model
const teamModel = mongoose.model('Team', teamSchema);

//export model
module.exports = teamModel