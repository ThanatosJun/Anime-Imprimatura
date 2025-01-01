// this file contains "login", "signin", and "logout".

require("dotenv").config();
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // hash password

// authenticate token
exports.authenticateToken = async (req, res, next) => {
    try {
        // Retrieve the 'Authorization' header from the request
        const authHeader = req.header('Authorization');
        
        // Check if the 'Authorization' header is undefined
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Please authenticate.' });
        }

        // Extract the token
        const token = authHeader.split(' ')[1];

        // 檢查 token 是否存在
        if (!token) {
            return res.status(401).json({ error: 'Token required' });
        }

        // 驗證 token
        const user = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
                if (err) reject(err);
                else resolve(decodedUser);
            });
        });

        // 將用戶信息附加到請求對象
        req.user = user;

        // 繼續處理請求
        next();

    } catch (error) {
        console.error("Authentication error:", error);
        res.status(403).json({ error: 'Invalid token' });
    }
};

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

        const rememberMe = req.body.remember;

        if(user&&isPasswordValid){
            //generate jwt and return
            const token = await jwt.sign({id: user._id.toString(), name: user.user_name, gmail: user.gmail}, process.env.JWT_SECRET, { expiresIn: rememberMe ? '7d' : '1h' });
            res.json({
                message: 'Login successful',
                token: token
            });
        }
        
    } catch(error) {
        console.error("Login error", error);
        res.status(500).json({error: "An error occurred during login. Please try again. "});
    }
}

// content
exports.content = async (req, res) => {
    try {
        if (!req.user || !req.user.gmail) {
            console.log('User not authenticated:', req.user);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        console.log('Authenticated user:', req.user);
        res.json({ message: 'This is a protected resource', user: req.user });
    } catch (error) {
        console.error('Error in content route:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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

        // Redirect to "final" page after "detect"

    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ error: "An error occurred during registration. Please try again." });
    }
};

//logout
exports.logout = (req, res) => {
    try {
        // Clear the user_id cookie
        res.clearCookie('user_id');
        
        // Redirect to login page or any other page
        res.redirect('/login');
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "An error occurred during logout. Please try again." });
    }
};

// editUser
exports.editUser = async (req, res) => {
    try {
        const id = req.body.id;
        const user_name = req.body.user_name;
        const gmail = req.body.gmail;
        // const password = req.body.password;

        // find by id
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // update user info
        if (user_name !== user.user_name) {
            user.user_name = user_name;  // 更新用戶名
        }
        if (gmail !== user.gmail) {
            user.gmail = gmail;  // 更新用戶郵箱
        }
        // if (password !== user.password) {
        //     user.password = await bcrypt.hash(password, 10);
        // }

        // save updated user info
        await user.save();

        res.status(200).json({
            message: "User updated successfully",
            updatedUser: {
                user_name: user.user_name,
                gmail: user.gmail
                // password: user.password
            }
        });

    } catch (error) {
        console.error("Error updating user", error);
        res.status(500).json({ error: "An error occurred while updating the user. Please try again." });
    }
};