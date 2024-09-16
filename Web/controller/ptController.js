require("dotenv").config();
const express = require('express');
const router = express.Router();
const Chd = require('../models/chd');  

exports.getModel = async (req, res) => {
    try {
        const { user_id } = req.body; 
        console.log('Received user_id:', user_id);

        const chdData = await Chd.find({ user_id }).select('CHD_modelpt -_id');

        const modelptList = chdData.map(doc => doc.CHD_modelpt);

        if (modelptList.length === 0) {
            return res.status(404).json({ message: 'No data found for this user.' });
        }

        res.status(200).json(modelptList);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Error fetching data' });
    }
}