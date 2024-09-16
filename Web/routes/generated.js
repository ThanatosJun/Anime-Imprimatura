var express = require('express');
var router = express.Router();

/* GET generated_visitor page. */
router.get('/', function(req, res, next) {
  res.render('generated', { title: 'Generated' });
});

module.exports = router;