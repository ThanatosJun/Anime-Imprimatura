require("dotenv").config();
const express = require('express');
const fetch = require('node-fetch');
const Team = require('../models/team');
const Team_User = require('../models/team_user');

// create a team
exports.createAteam = async (req, res)=>{
    try{
        const { team_name, user_id } = req.body;
        console.log('Received createAteam request: ', { team_name, user_id });

        // check if all required fields are provided
        if(!team_name || !user_id){
            console.log("Missing fields");
            return res.status(400).json({ error: "All fields are required. " });
        }

        // check if team_name exists
        const existingTeamName = await Team.findOne({ team_name });
        if(existingTeamName){
            console.log("Team name already in use", existingTeamName);
            return res.status(400).json({ error: "Team name is already in use." });
        }

        // create a new team
        const newTeam = Team({ team_name });
        await newTeam.save();
        console.log("New team saved: ", newTeam);

        // create a new record in team_user
        const newTeamUser = new Team_User({
            team_id: newTeam.team_id,
            user_id: user_id
        });
        await newTeamUser.save();
        console.log("New team_user saved: ", newTeamUser);

        // Return success response
        res.status(201).json({
            message: "Team registered successfully",
            team: {
                team_id: newTeam.team_id,
                team_name: newTeam.team_name
            },
        });
    }catch (error){
        console.error("createAteam error: ", error);
        res.status(500).json({ error: "An error occurred during creating. Please try again." });
    }
}

// join a team
exports.joinAteam = async(req, res)=>{
    try{
        const { team_name, user_id } = req.body;
        console.log('Joining request: ', req.body);

        //check if the team exsist
        const team = await Team.findOne({ team_name });
        if(!team){
            console.log('Team does not exist: ', team_name);
            return res.status(400).json({error: "Team does not exsist. "});
        }
        console.log('Team found: ', team);

        // check if the user is already in the team
        const existingTeamUser = await Team_User.findOne({ team_id: team.team_id, user_id});
        if(existingTeamUser){
            console.log('User is already in the team');
            return res.status(400).json({ error: "User is already in the team." });
        }

        // add user to the team
        const newTeamUser = new Team_User({
            team_id: team.team_id,
            user_id: user_id
        });
        await newTeamUser.save();
        console.log("User added to the team: ", newTeamUser);

        // return success response
        res.status(200).json({
            message: "User joined the team successfully",
            team:{
                team_id: team.team_id,
                team_name: team.team_name
            },
            user_id: user_id
        });
    }catch (error){
        console.error("joinAteam error: ", error);
        res.status(500).json({ error: "An error occurred during joining. Please try again." });
    }
}