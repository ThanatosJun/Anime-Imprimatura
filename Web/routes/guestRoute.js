var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Log In' });
});

/* GET create_account page */
router.get('/create_account', function(req, res, next) {
    res.render('create_account', { title: 'Create Account' });
});

module.exports = router;