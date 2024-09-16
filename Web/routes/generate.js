var express = require('express');
var router = express.Router();

/* GET generate page. */
router.get('/', function(req, res, next) {
  res.render('generate', { title: 'Generate' });
});

module.exports = router;