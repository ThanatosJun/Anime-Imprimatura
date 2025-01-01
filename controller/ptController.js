require("dotenv").config();
const express = require('express');
const router = express.Router();
const Chd = require('../models/chd');  

exports.getModel = async (req, res) => {
    try {
        const { user_id } = req.body; 
        console.log('Received user_id:', user_id);
        console.log('req.body: ', req.body);

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

exports.checkModelDuplicate = async (req, res) => {
    try {
        const existingDoc = await Chd.findOne({ CHD_modelpt: req.body.model_name });

        if (existingDoc) {
            return res.status(409).json({ message: 'Duplicate data' });
        } else {
            return res.status(200).json({ message: 'No duplicate' });
        }
    } catch (error) {
        console.error('(checkModelDuplicate) Error fetching data:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}