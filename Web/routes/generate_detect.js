var express = require('express');
var router = express.Router();

/* GET generate_detect page. */
router.get('/visitor', function(req, res, next) {
  const characterName = decodeURIComponent(req.query.character_name);

  if(!window.user_id){
    options = [
      { value: characterName, text: characterName }
    ]
    res.render('generate_detect', { options }, { title: 'Detect' });
  } else {
    res.render('generate_detect')
  }

});

module.exports = router;