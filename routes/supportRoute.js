var express = require('express');
var router = express.Router();

/* GET Support page. */
router.get('/', function(req, res, next) {
  res.render('support', { title: 'Support Center' });
});

/* GET Contact page. */
router.get('/contact', function(req, res, next) {
    res.render('contact', { title: 'Contact Us' });
});

module.exports = router;
