const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const userModel = require('./userSchema');
const coloring_videoModel = require('./coloring_videoSchema');
const colored_chdModel = require('./colored_chdSchema');
const downloadable_contentModel = require('./downloadable_contentSchema');
const team_userModel = require('./team_userSchema');
const teamModel = require('./teamSchema');
const imageModel = require('./imageSchema');
const chsModel = require('./chsSchema');
const chdModel = require('./chdSchema');

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
// (4)-downloadable_content
router.post('/downloadable_content/save', function (req, res) {
    const newDownloadable_Content = new downloadable_contentModel(req.body);
    newdownloadable_content.save(function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error inserting data');
        } else {
            res.send("downloadable_content data inserted.");
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
// (4)-downloadable_content
router.get('/downloadable_content/findall', function (req, res) {
    downloadable_contentModel.find(function (err, data) {
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
// (4)-downloadable_content
router.post('/downloadable_content/delete', function (req, res) {
    downloadable_contentModel.findByIdAndDelete(req.body.downloadable_content_id, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting data');
        } else {
            res.send(data);
            console.log("downloadable_content data deleted!");
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

// update
// (1)-user
router.post('/user/update', function (req, res) {
    const updateData = {
        gmail: req.body.gmail,
        password: req.body.password,
        personal_gallery: req.body.personal_gallery
    };
    
    userModel.findByIdAndUpdate(req.body.user_id, updateData, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating data');
        } else {
            res.send(data);
            console.log("User data updated!");
        }
    });
});
// (2)-coloring_video
router.post('/coloring_video/update', function (req, res) {
    coloring_videoModel.findByIdAndUpdate(req.body.coloring_video_id, { gmail: req.body.gmail }, function (err, data) {
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
    colored_chdModel.findByIdAndUpdate(req.body.colored_chd_id, { gmail: req.body.gmail }, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating data');
        } else {
            res.send(data);
            console.log("colored_chd data updated!");
        }
    });
});
// (4)-downloadable_content
router.post('/downloadable_content/update', function (req, res) {
    downloadable_contentModel.findByIdAndUpdate(req.body.downloadable_content_id, { gmail: req.body.gmail }, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating data');
        } else {
            res.send(data);
            console.log("downloadable_content data updated!");
        }
    });
});
// (5)-team_user
router.post('/team_user/update', function (req, res) {
    team_userModel.findByIdAndUpdate(req.body.team_user_id, { name: req.body.name }, function (err, data) {
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
    chsModel.findByIdAndUpdate(req.body.chs_id, { name: req.body.name }, function (err, data) {
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
    chdModel.findByIdAndUpdate(req.body.chd_id, { name: req.body.name }, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating data');
        } else {
            res.send(data);
            console.log("chd data updated!");
        }
    });
});

// collection
// (1)-user
// (2)-coloring_video
// (3)-colored_chd
// (4)-downloadable_content
// (5)-team_user
// (6)-team
// (7)-chs
// (8)-chd

module.exports = router;