var express = require('express');
var router = express.Router();

/* GET account management page. */
router.get('/', function(req, res, next) {
  res.render('account_management', { title: 'Account Management' });
});

module.exports = router;
