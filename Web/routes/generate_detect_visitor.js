var express = require('express');
var router = express.Router();

/* GET generate_detect_visitor page. */
router.get('/', function(req, res, next) {
  res.render('generate_detect_visitor', { title: 'Generate Detect Visitor' });
});

module.exports = router;
