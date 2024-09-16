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

/* GET register page */
router.get('/register', function(req, res, next) {
    res.render('account_management', { title: 'Account Management' });
});

/* GET generate_detect_visitor page. */
router.get('/generate_detect', function(req, res, next) {
    const characterName = decodeURIComponent(req.query.character_name);
  
    if(!window.user_id){
      options = [
        { value: characterName, text: characterName }
      ]
      res.render('generate_detect_visitor', { options });
    } else {
      res.render('generate_detect_visitor')
    }
    
});

module.exports = router;