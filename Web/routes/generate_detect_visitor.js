var express = require('express');
var router = express.Router();

// 模擬從數據庫或其他來源獲取選項資料
const options = [
  { value: 'option1', text: '選項 1' },
  { value: 'option2', text: '選項 2' },
  { value: 'option3', text: '選項 3' }
];

/* GET generate_detect_visitor page. */
router.get('/', function(req, res, next) {
//   const data = JSON.parse(req.query.data); //req.query.data 不是有效的 JSON 字符串

    res.render('generate_detect_visitor', { title: 'Generate Detect Visitor' });
});

// router.get('/generate_detect_visitor', (req, res) => {
//   const data = JSON.parse(req.query.data);

//   // Render the results page and display the processed data
//   res.send(`<html><body>Training results: ${JSON.stringify(data)}</body></html>`);
// });

module.exports = router;
