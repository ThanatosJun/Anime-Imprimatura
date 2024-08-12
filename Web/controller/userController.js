// this file contains "login", "signin", and "logout".

require("dotenv").config();
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // hash password

// login
exports.login = async (req, res)=>{
    try{
        console.log('Log in request: ', req.body);

        //check if the account exsist
        const user = await User.findOne({gmail: req.body.gmail});
        if(!user){
            console.log('Account does not exist for gmail: ', req.body.gmail);
            return res.status(400).json({error: "Account does not exsist. "});
        }

        console.log('Account found: ', user);

        //check if the password is correct
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if(!isPasswordValid){
            console.log('Invalid password for user: ', user);
            return res.status(400).json({error: "Invalid password. "});
        }

        console.log('Password is valid for user: ', user);

        //generate jwt and return
        const token = await jwt.sign({gmail: user.gmail}, process.env.JWT_SECRET, {expiresIn: '1h'});
        
        //redirect to "gallery" page
        res.redirect('/index');

    }catch(error){
        console.error("Login error", error);
        res.status(500).json({error: "An error occurred during login. Please try again. "});
    }
}

// signin
exports.signin = async (req, res) => {
    try {
        const { user_name, gmail, password } = req.body;
        console.log('Received signin request: ', { user_name, gmail, password });

        // Check if all required fields are provided
        if (!user_name || !gmail || !password) {
            console.log("Missing fields");
            return res.status(400).json({ error: "All fields are required." });
        }

        // Check if the username exists
        const existingUsername = await User.findOne({ user_name });
        if (existingUsername) {
            console.log("Username already in use", existingUsername);
            return res.status(400).json({ error: "Username is already in use." });
        }

        // Check if the gmail exists
        const existingEmail = await User.findOne({ gmail });
        if (existingEmail) {
            console.log("Gmail already in use", existingEmail);
            return res.status(400).json({ error: "Email is already in use." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            user_name,
            gmail,
            password: hashedPassword
        });

        // Save the new user
        await newUser.save();
        console.log("New user saved: ", newUser);

        // Generate JWT
        const token = jwt.sign(
            { user_id: newUser._id, gmail: newUser.gmail, user_name: newUser.user_name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Return success response
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                user_name: newUser.user_name,
                gmail: newUser.gmail
            },
            token
        });

    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ error: "An error occurred during registration. Please try again." });
    }
};

//logout