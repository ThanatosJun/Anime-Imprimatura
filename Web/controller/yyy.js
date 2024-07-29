const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const axios = require('axios');

const upload = multer({ dest: 'controller/uploads/' });

router.post('/', upload.fields([{ name: 'chd', maxCount: 1 }]), (req, res) => {
    console.log('Received upload request');

    if (!req.files || !req.files.chd || req.files.chd.length === 0) {
        console.log('No files uploaded.');
        return res.status(400).send('No files were uploaded.');
    } else {
        console.log('Files uploaded successfully.');
    }

    const uploadedFilePath = req.files.chd[0].path;
    const chdName = req.body.character_name;

    console.log('Uploaded file path:', uploadedFilePath);
    console.log('CHD Name:', chdName);

    axios.post('http://localhost:5001/train', {
        image_path: uploadedFilePath,
        CHD_name: chdName
    })
    .then(response => {
        console.log('Train response:', response.data);
        res.status(200).json(response.data);
    })
    .catch(error => {
        console.error('Error during training:', error);
        res.status(500).json({ error: 'Error during training.' });
    });
});

module.exports = router;