var express = require('express');
var router = express.Router();

// 模擬從其他來源獲取選項資料
const options = [
  { value: 'option1', text: '選項 1' },
  { value: 'option2', text: '選項 2' },
  { value: 'option3', text: '選項 3' }
];

/* GET generate_detect_visitor page. */
router.get('/', function(req, res, next) {
  const characterName = req.query.character_name;
  const options = [
    { value: characterName, text: characterName }
  ]
  res.render('generate_detect_visitor', { options });
});

module.exports = router;