var express = require('express');
var router = express.Router();

/* GET team-gallery-f page. */
router.get('/', function(req, res, next) {
  res.render('team_gallery_f', { title: 'Team Gallery F' });
});

module.exports = router;
