var express = require('express');
var router = express.Router();

/* GET team-gallery-t page. */
router.get('/', function(req, res, next) {
  res.render('team_gallery_t', { title: 'Team Gallery T' });
});

module.exports = router;
