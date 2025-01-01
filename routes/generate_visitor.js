var express = require('express');
var router = express.Router();

/* GET generate_train_visitor page. */
router.get('/', function(req, res, next) {
  res.render('generate_visitor', { title: 'Generate Visitor' });
});

module.exports = router;