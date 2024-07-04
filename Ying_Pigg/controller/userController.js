// this file contains "login", "signin", and "logout".

require("dotenv").config();
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // hash password
const router = require("express");

// login
exports.login = async (req, res)=>{
    try{
        //check if the account exsist
        const user = await User.findOne({gmail: req.body.gmail});
        if(!user){
            return res.status(400).json({error: "Account does not exsist. "});
        }
        //check if the password is correct
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({error: "Invalid password. "});
        }
        //generate jwt and return
        const token = await jwt.sign({gmail: user.gmail}, process.env.JWT_SECRET, {expiresIn: '1h'});
        res.json({message: "Log in successfully", token});
    }catch(error){
        console.error("Login error", error);
        res.status(500).json({error: "An error occurred during login. Please try again. "});
    }
}
// signin
exports.signin = async (req, res)=>{
    try{
        //check if the user exsist
        const user = await User.findOne({gmail: req.body.gmail});
        
    }
}
//logout