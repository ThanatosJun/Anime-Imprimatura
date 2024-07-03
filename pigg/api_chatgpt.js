const express = require('express');
const router = express.Router();
const userModel = require('./models/user');
const teamModel = require('./models/team');

// create
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

// retrieve all users
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

// retrieve all teams
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

// delete user
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

// delete team
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

// update user
router.post('/user/update', function (req, res) {
    userModel.findByIdAndUpdate(req.body.user_id, { gmail: req.body.gmail }, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating data');
        } else {
            res.send(data);
            console.log("User data updated!");
        }
    });
});

// update team
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

module.exports = router;
