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

/* GET generate_detect page. */
router.get('/generate_detect', function(req, res, next) {
    const characterName = decodeURIComponent(req.query.character_name);
  
    if(!window.user_id){
      options = [
        { value: characterName, text: characterName }
      ]
      res.render('generate_detect', { options });
    } else {
      res.render('generate_detect')
    }
    
});

module.exports = router;