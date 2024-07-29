var express = require('express');
var router = express.Router();

/* GET generate_detect_visitor page. */
router.get('/', function(req, res, next) {
  const data = JSON.parse(req.query.data);
  
  res.render('generate_detect_visitor', { title: 'Generate Detect Visitor' });
});

app.get('/generate_detect_visitor', (req, res) => {
  const data = JSON.parse(req.query.data);

  // Render the results page and display the processed data
  res.send(`<html><body>Training results: ${JSON.stringify(data)}</body></html>`);
});

module.exports = router;
