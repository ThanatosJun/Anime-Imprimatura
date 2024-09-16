var express = require('express');
var router = express.Router();

/* GET generate_train page. */
router.get('/', function(req, res, next) {
  res.render('generate_train', { title: 'Train' });
});

module.exports = router;
