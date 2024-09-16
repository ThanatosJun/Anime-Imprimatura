var express = require('express');
var router = express.Router();

/* GET generate_train page. */
router.get('/train', function(req, res, next) {
  res.render('generate_train', { title: 'Train' });
});

/* GET generate_detect page. */
router.get('/detect', function(req, res, next) {
  res.render('generate_detect', { title: 'Detect'});
});

/* GET generate page. */
router.get('/', function(req, res, next) {
  res.render('generate', { title: 'Generate' });
});

/* GET generated page. */
router.get('/generated', function(req, res, next) {
  res.render('generated', { title: 'Generated' });
});

module.exports = router;