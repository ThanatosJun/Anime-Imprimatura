const mongoose = require('mongoose')
const Schema = mongoose.Schema

//create schema
const team_userSchema = new mongoose.Schema({
    team_id: {
        team:[{
            type: mongoose.Schema.Types.ObjectId, ref: 'team'
        }]
    }, 
    user_id: {
        user: [{
            type: mongoose.Schema.Types.ObjectId, ref: 'user'
        }]
    }
});

//define model
const team_userModel = mongoose.model('Team_User', team_userSchema);

//export model
module.exports = team_userModel