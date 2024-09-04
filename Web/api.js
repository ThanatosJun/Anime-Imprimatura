const express = require('express');
const router = express.Router();
const userModel = require('./models/user');
const coloring_videoModel = require('./models/coloring_video');
const colored_chdModel = require('./models/colored_chd');
const galleryModel = require('./models/gallery');
const team_userModel = require('./models/team_user');
const teamModel = require('./models/team');
const imageModel = require('./models/image');
const chsModel = require('./models/chs');
const chdModel = require('./models/chd');

// User routes
const userController = require('./controller/userController');
router.post('/signin', (req, res, next) => {
    console.log('POST /api/signin', req.body);
    next();
  }, userController.signin);
  
router.post('/login', (req, res, next) => {
    console.log('POST /api/login', req.body);
    next();
}, userController.login);

router.get('/content', userController.authenticateToken, userController.content);

// Image routes
const imageController = require('./controller/imageController');
router.post('/uploadAndGenerate', (req, res, next) => {
    console.log('POST /api/upload', req.body);
    next();
}, imageController);

// Train route
router.post('/train', (req, res) => {
    script_path = 'yolov8_RPA_character_train_v3/PA_autoTraing_v5.py'
    const { CHD_name, image_path } = req.body;

    const options = {
        args: [CHD_name, image_path]
    };

    PythonShell.run(script_path, options, (err, results) => {
        if (err) {
            console.error(`Error: ${err}`);
            res.status(500).send(err);
        } else {
            console.log(`(api.js) Results: ${results}`);
            res.send(results.join('\n'));
        }
    });
});

// Detect route
router.post('/detect', (req, res) => {
    script_path = '/Users/pigg/Documents/GitHub/Anime-Imprimatura/Thanatos/yolov8_RPA_character_train_v3/CHD_detect.py'
    const { CHS_Name } = req.body;
    const { image_path } = req.body;

    const options = {
        args: [CHS_Name],
        args: [image_path]
    };

    PythonShell.run(script_path, options, (err, results) => {
        if (err) {
            console.error(`Error: ${err}`);
            res.status(500).send(err);
        } else {
            console.log(`Results: ${results}`);
            res.send(results.join('\n'));
        }
    });
});

// personal gallery routes
const galleryController = require('./controller/galleryController');
router.get('/saveToGallery_personal_chd', galleryController.saveToGallery_personal_chd);
router.get('/saveToGallery_personal_chs', galleryController.saveToGallery_personal_chs);
router.post('/saveToGallery_personal_final', galleryController.saveToGallery_personal_final);
router.post('/getPersonalGallery', galleryController.getPersonalGallery);

// create
// (1)-user
router.post('/user/save', function (req, res) {
    const newUser = new userModel(req.body);
    newUser.save(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error inserting data');
        } else {
            res.send("User data inserted.");
        }
    });
});
// (2)-coloring_video
router.post('/coloring_video/save', function (req, res) {
    const newColoring_Video = new coloring_videoModel(req.body);
    newColoring_Video.save(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error inserting data');
        } else {
            res.send("coloring_video data inserted.");
        }
    });
});
// (3)-colored_chd
router.post('/colored_chd/save', function (req, res) {
    const newColored_Chd = new colored_chdModel(req.body);
    newColored_Chd.save(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error inserting data');
        } else {
            res.send("colored_chd data inserted.");
        }
    });
});
// (4)-Gallery
router.post('/Gallery/save', function (req, res) {
    const newGallery = new galleryModel(req.body);
    newGallery.save(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error inserting data');
        } else {
            res.send("Gallery data inserted.");
        }
    });
});
// (5)-team_user
router.post('/team_user/save', function (req, res) {
    const newTeam_User = new team_userModel(req.body);
    newTeam_User.save(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error inserting data');
        } else {
            res.send("team_user data inserted.");
        }
    });
});
// (6)-team
router.post('/team/save', function (req, res) {
    const newTeam = new teamModel(req.body);
    newTeam.save(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error inserting data');
        } else {
            res.send("Team data inserted.");
        }
    });
});
// (7)-chs
router.post('/chs/save', function (req, res) {
    const newChs = new chsModel(req.body);
    newChs.save(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error inserting data');
        } else {
            res.send("chs data inserted.");
        }
    });
});
// (8)-chd
router.post('/chd/save', function (req, res) {
    const newChd = new chdModel(req.body);
    newChd.save(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error inserting data');
        } else {
            res.send("chd data inserted.");
        }
    });
});
// (9)-image
router.post('/image/save', function (req, res) {
    const newImage = new imageModel(req.body);
    newImage.save(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error inserting data');
        } else {
            res.send("image data inserted.");
        }
    });
});

// retrieve
// (1)-user
router.get('/user/findall', function (req, res) {
    userModel.find(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving data');
        } else {
            res.send(data);
        }
    });
});
// (2)-coloring_video
router.get('/coloring_video/findall', function (req, res) {
    coloring_videoModel.find(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving data');
        } else {
            res.send(data);
        }
    });
});
// (3)-colored_chd
router.get('/colored_chd/findall', function (req, res) {
    colored_chdModel.find(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving data');
        } else {
            res.send(data);
        }
    });
});
// (4)-Gallery
router.get('/Gallery/findall', function (req, res) {
    galleryModel.find(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving data');
        } else {
            res.send(data);
        }
    });
});
// (5)-team_user
router.get('/team_user/findall', function (req, res) {
    team_userModel.find(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving data');
        } else {
            res.send(data);
        }
    });
});
// (6)-team
router.get('/team/findall', function (req, res) {
    teamModel.find(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving data');
        } else {
            res.send(data);
        }
    });
});
// (7)-chs
router.get('/chs/findall', function (req, res) {
    chsModel.find(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving data');
        } else {
            res.send(data);
        }
    });
});
// (8)-chd
router.get('/chd/findall', function (req, res) {
    chdModel.find(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving data');
        } else {
            res.send(data);
        }
    });
});
// (9)-image
router.get('/image/findall', function (req, res) {
    imageModel.find(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving data');
        } else {
            res.send(data);
        }
    });
});


// delete
// (1)-user
router.post('/user/delete', function (req, res) {
    userModel.findByIdAndDelete(req.body.user_id, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting data');
        } else {
            res.send(data);
            console.log("User data deleted!");
        }
    });
});
// (2)-coloring_video
router.post('/coloring_video/delete', function (req, res) {
    coloring_videoModel.findByIdAndDelete(req.body.coloring_video_id, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting data');
        } else {
            res.send(data);
            console.log("coloring_video data deleted!");
        }
    });
});
// (3)-colored_chd
router.post('/colored_chd/delete', function (req, res) {
    colored_chdModel.findByIdAndDelete(req.body.colored_chd_id, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting data');
        } else {
            res.send(data);
            console.log("colored_chd data deleted!");
        }
    });
});
// (4)-Gallery
router.post('/Gallery/delete', function (req, res) {
    galleryModel.findByIdAndDelete(req.body.gallery_id, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting data');
        } else {
            res.send(data);
            console.log("Gallery data deleted!");
        }
    });
});
// (5)-team_user
router.post('/team_user/delete', function (req, res) {
    team_userModel.findByIdAndDelete(req.body.team_user_id, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting data');
        } else {
            res.send(data);
            console.log("team_user data deleted!");
        }
    });
});
// (6)-team
router.post('/team/delete', function (req, res) {
    teamModel.findByIdAndDelete(req.body.team_id, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting data');
        } else {
            res.send(data);
            console.log("Team data deleted!");
        }
    });
});
// (7)-chs
router.post('/chs/delete', function (req, res) {
    chsModel.findByIdAndDelete(req.body.chs_id, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting data');
        } else {
            res.send(data);
            console.log("chs data deleted!");
        }
    });
});
// (8)-chd
router.post('/chd/delete', function (req, res) {
    chdModel.findByIdAndDelete(req.body.chd_id, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting data');
        } else {
            res.send(data);
            console.log("chd data deleted!");
        }
    });
});
// (9)-image
router.post('/image/delete', function (req, res) {
    imageModel.findByIdAndDelete(req.body.image_id, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting data');
        } else {
            res.send(data);
            console.log("image data deleted!");
        }
    });
});

// update
// (1)-user
router.post('/user/update', async (req, res) => {
    try {
        const { user_id, gmail, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); // 假設你想要哈希密碼
        const updateData = {
            gmail: gmail,
            password: hashedPassword
        };
        const updatedUser = await userModel.findByIdAndUpdate(user_id, updateData, { new: true });
        res.send(updatedUser);
        console.log("User data updated!");
    } catch (err) {
        console.error('Error updating data', err);
        res.status(500).send('Error updating data');
    }
});
// (2)-coloring_video
router.post('/coloring_video/update', function (req, res) {
    coloring_videoModel.findByIdAndUpdate(req.body.coloring_video_id, { file_route: req.body.file_route }, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating data');
        } else {
            res.send(data);
            console.log("coloring_video data updated!");
        }
    });
});
// (3)-colored_chd
router.post('/colored_chd/update', function (req, res) {
    colored_chdModel.findByIdAndUpdate(req.body.colored_chd_id, { file_route: req.body.file_route }, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating data');
        } else {
            res.send(data);
            console.log("colored_chd data updated!");
        }
    });
});
// (4)-Gallery
router.post('/Gallery/update', function (req, res) {
    const updateData = {
        user_id: req.body.user_id,
        team_id: req.body.team_id
    };

    galleryModel.findByIdAndUpdate(req.body.gallery_id, updateData, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating data');
        } else {
            res.send(data);
            console.log("Gallery data updated!");
        }
    });
});
// (5)-team_user
router.post('/team_user/update', function (req, res) {
    const updateData = {
        user_id: req.body.user_id,
        team_id: req.body.team_id
    };

    team_userModel.findByIdAndUpdate(req.body.team_user_id, updateData, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating data');
        } else {
            res.send(data);
            console.log("Team_User data updated!");
        }
    });
});
// (6)-team
router.post('/team/update', function (req, res) {
    teamModel.findByIdAndUpdate(req.body.team_id, { name: req.body.name }, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating data');
        } else {
            res.send(data);
            console.log("Team data updated!");
        }
    });
});
// (7)-chs
router.post('/chs/update', function (req, res) {
    chsModel.findByIdAndUpdate(req.body.chs_id, { file_route: req.body.file_route }, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating data');
        } else {
            res.send(data);
            console.log("chs data updated!");
        }
    });
});
// (8)-chd
router.post('/chd/update', function (req, res) {
    chdModel.findByIdAndUpdate(req.body.chd_id, { file_route: req.body.file_route }, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating data');
        } else {
            res.send(data);
            console.log("chd data updated!");
        }
    });
});
// (9)-image
router.post('/image/update', function (req, res) {
    imageModel.findByIdAndUpdate(req.body.image_id, { file_route: req.body.file_route }, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating data');
        } else {
            res.send(data);
            console.log("image data updated!");
        }
    });
});

// export model
module.exports = router;