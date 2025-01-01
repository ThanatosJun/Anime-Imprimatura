var express = require('express');
var router = express.Router();

/* GET Create Account page. */
router.get('/', function(req, res, next) {
  res.render('create_account', { title: 'Create Account' });
});

module.exports = router;
