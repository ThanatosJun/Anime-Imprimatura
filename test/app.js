var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let { PythonShell } = require('python-shell');
const multer = require('multer');
const bodyParser = require('body-parser');
const axios = require('axios');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({
  storage: storage
}).single('image');

// setting up static file directory
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(500).send('Error uploading file.');
    } else {
      const filePath = req.file.path;
      res.json({ filePath: filePath });
    }
  });
});

// routing file path for sending to Python program
app.post('/send-file-path', (req, res) => {
  // extract filePath from request body
  const filePath = req.body.filePath;
  console.log('Sending file path to Python program:', filePath);

  // send filePath to another server using Axios POST request
  axios.post('http://localhost:5000/receive-file-path', { filePath: filePath }, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      // on successful response from the Python program
      console.log('File path sent to Python program:', response.data);
      res.send('File path sent to Python program.');
    })
    .catch(error => {
      // If there's an error sending the filePath
      console.error('Failed to send file path to Python program:', error.response ? error.response.data : error.message);
      console.log("error", error.response ? error.response.data : error.message);
      res.status(500).send('Failed to send file path to Python program.');
    });
});

app.get('/call/python', pythonProcess)

function pythonProcess(req, res) {
  let options = {
    mode: 'text', // 確保以文本模式運行
    pythonPath: 'python3', // 或者指定你本地的 python 路徑
    pythonOptions: ['-u'], // unbuffered output
    scriptPath: './', // 指定 process.py 所在目錄
    args: [
      req.query.name,
      req.query.from
    ]
  }

  PythonShell.run('process.py', options, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
      return;
    }

    try {
      const parsedString = JSON.parse(results.join(''));
      console.log(`name: ${parsedString.Name}, from: ${parsedString.From}`);
      res.json(parsedString);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      res.status(500).send('Error parsing JSON');
    }
  });

}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;