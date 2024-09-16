var express = require('express');
var router = express.Router();

/* GET generate_detect page. */
router.get('/', function(req, res, next) {
  res.render('generate_detect', { title: 'Detect'});
});

module.exports = router;