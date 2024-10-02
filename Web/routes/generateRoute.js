var express = require('express');
var router = express.Router();

/* GET generate_select page. */
router.get('/select', function(req, res, next) {
  res.render('generate_select', { title: 'Select' });
});

/* GET generate_train page. */
router.get('/train', function(req, res, next) {
  res.render('generate_train', { title: 'Train' });
});

/* GET generate_detect page. */
router.get('/detect', function(req, res, next) {
  res.render('generate_detect', { title: 'Detect'});
});

/* GET generate page. */
router.get('/segment', function(req, res, next) {
  res.render('generate_segment', { title: 'Generate' });
});

/* GET generated page. */
router.get('/generated', function(req, res, next) {
  res.render('generated', { title: 'Generated' });
});

/* GET generate_train_detect page. */
router.get('/train_detect', function(req, res, next) {
  res.render('generate_train_detect', { title: 'Train and Detect'});
});

module.exports = router;