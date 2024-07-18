require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const connectMongoDB = require('./database'); // Import the database connection module
const userModel = require('./models/user'); // Import the user model
const bcrypt = require('bcrypt'); // For password hashing
const bodyParser = require('body-parser'); // To handle HTTP request data
const multer = require('multer'); // For handling file uploads
let { PythonShell } = require('python-shell'); // For running Python scripts
const axios = require('axios');

const port = 3000;

var app = express();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'uploads/'); // Specify the upload directory
  },
  filename: function(req, file, cb){
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique file name
  }
});
const upload = multer({ storage: storage });

// view engine setup
app.set('views', path.join(__dirname, 'views')); // Specify the views directory
app.set('view engine', 'pug'); // Use Pug as the view engine

// Import route handlers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var accountManagementRouter = require('./routes/account_management');
var createAccountRouter = require('./routes/create_account');
var galleryRouter = require('./routes/gallery');
var generateVisitorRouter = require('./routes/generate_visitor');
var generatedVisitorRouter = require('./routes/generated_visitor');
var loginRouter = require('./routes/login');
var teamGalleryFRouter = require('./routes/team_gallery_f');
var teamGalleryTRouter = require('./routes/team_gallery_t');

// Temporarily save data
const data = [];

// Middleware to process HTTP request data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Use the imported routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/account_management', accountManagementRouter);
app.use('/create_account', createAccountRouter);
app.use('/gallery', galleryRouter);
app.use('/generate_visitor', generateVisitorRouter);
app.use('/generated_visitor', generatedVisitorRouter);
app.use('/login', loginRouter);
app.use('/team_gallery_f', teamGalleryFRouter);
app.use('/team_gallery_t', teamGalleryTRouter);

// Setup logging, JSON handling, URL encoding, cookies, and static files
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Import and use api route
const apiRouter = require('./api');
app.use('/api', apiRouter);

// Route to render account settings
app.get('/', async (req, res) => {
  try {
    const user = await userModel.findOne({});
    res.render('account_setting', { user });
  } catch (err) {
    console.error('Error:', err);
    res.send('Error loading user settings');
  }
});

app.get('/sss', (req, res) => {
  // 設置 Flask 伺服器的基本 URL
  const flaskUrl = 'http://localhost:5000';
  // 要發送的 JSON 數據
  const data = {
    string: 'Hello, Flask!'
  };
  // 發送 POST 請求到 Flask 伺服器的 /process_string 路由
  axios.post(`${flaskUrl}/process_string`, data)
    .then(response => {
      console.log('Flask 伺服器的回應：', response.data);
    })
    .catch(error => {
      console.error('發送請求時出錯：', error);
    });
})

// Route to call Python script
app.get('/call/python', pythonProcess)

function pythonProcess(req, res) {
  let options = {
    mode: 'text',
    pythonOptions: ['-u'], // unbuffered output
    scriptPath: '', // 如果 process.py 在同一目錄下，留空即可
    args: [
      req.query.name,
      req.query.from
    ]
  }

  PythonShell.run('process.py', options, (err, results) => {
    if (err) {
      res.send(err)
      return
    }
    try {
      const parsedString = JSON.parse(results[0])
      console.log(`name: ${parsedString.Name}, from: ${parsedString.From}`)
      res.json(parsedString)
    } catch (e) {
      res.send(e.message)
    }
  })
}

// Route to handle user editing
app.post('/edituser', async (req, res) => {
  try {
    const { userId, newGmail, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userModel.updateOne({ _id: userId }, { $set: { gmail: newGmail, password: hashedPassword } });
    res.redirect('/');
  } catch (err) {
    console.error('Error:', err);
    res.send('Error updating user settings');
  }
});

// multer (con.) // Route to handle file uploads
app.post('/upload', upload.fields([{name: 'chd', maxCount: 3}, {name: 'chs', maxCount: 1}]), (req, res)=>{
  console.log(req.files); // 在這裡調用AI模型，生成新圖片，並重定向到生成頁面
  res.redirect('/generated');
})

// app.post('/upload', upload.single('upload-box'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No file uploaded.');
//   }
//   const filePath = path.join(__dirname, 'uploads', req.file.filename);
//   res.send({ filePath: filePath }); // 返回文件路径
// });

// Handle 404 errors
app.use((req, res, next) =>{
  console.log('404 not found:', req.originalUrl);
  res.status(404).send('not found');
})

// Catch 404 and forward to error handler
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

// Start the server
app.listen(port, (err) => {
  if(err){
    return console.error(err);
  }
  return console.log(`Server is running on ${port}`);
});

module.exports = app;