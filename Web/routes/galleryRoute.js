var express = require('express');
var router = express.Router();

/* GET Gallery page. */
router.get('/personal', function(req, res, next) {
  res.render('gallery', { title: 'Gallery' });
});

/* GET team-gallery page. */
router.get('/team', function(req, res, next) {
  res.render('team_gallery', { title: 'Team Gallery' });
});

module.exports = router;