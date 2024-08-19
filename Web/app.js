require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bcrypt = require('bcrypt'); // For password hashing
const bodyParser = require('body-parser'); // To handle HTTP request data
const multer = require('multer'); // For handling file uploads
const fs = require('fs');
let { PythonShell } = require('python-shell'); // For running Python scripts
const axios = require('axios');

// Import modules
const connectMongoDB = require('./database'); // Import the database connection module
const userModel = require('./models/user'); // Import the user model
const apiRouter = require('./api');

// Import route controllers
const imageController = require('./controller/imageController');
const galleryController = require('./controller/galleryController');
const teamController = require('./controller/teamController');
const userController = require("./controller/userController");

const port = 3000; // Port for the server

// Initialize Express application
const app = express(); 

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, path.join(__dirname, '..', 'Thanatos', 'yolov8_RPA_character_train_v3', 'testImages')); // Specify the upload directory
  },
  filename: function(req, file, cb){
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique file name
  }
});
const upload = multer({ storage: storage }); // Create multer instance with the specified storage configuration

// view engine setup
app.set('views', path.join(__dirname, 'views')); // Specify the views directory
app.set('view engine', 'pug'); // Use Pug as the view engine

// Middleware setup
app.use(logger('dev')); // Log HTTP requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'
app.use('/path/to/images', express.static(path.join(__dirname)));

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Temporarily save data (for development or debugging purposes)
const data = [];

// Import route handlers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var accountManagementRouter = require('./routes/account_management');
var createAccountRouter = require('./routes/create_account');
var galleryRouter = require('./routes/gallery');
var generateDetectVisitorRouter = require('./routes/generate_detect_visitor');
var generateTrainVisitorRouter = require('./routes/generate_train_visitor');
var generateVisitorRouter = require('./routes/generate_visitor');
var generatedVisitorRouter = require('./routes/generated_visitor');
var loginRouter = require('./routes/login');
var teamGalleryFRouter = require('./routes/team_gallery_f');
var teamGalleryTRouter = require('./routes/team_gallery_t');

// Use the imported routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/account_management', accountManagementRouter);
app.use('/create_account', createAccountRouter);
app.use('/gallery', galleryRouter);
app.use('/generate_detect_visitor', generateDetectVisitorRouter);
app.use('/generate_train_visitor', generateTrainVisitorRouter);
app.use('/generate_visitor', generateVisitorRouter);
app.use('/generated_visitor', generatedVisitorRouter);
app.use('/login', loginRouter);
app.use('/team_gallery_f', teamGalleryFRouter);
app.use('/team_gallery_t', teamGalleryTRouter);

// API route handler
app.use('/api', apiRouter); // Prefix API routes with '/api'

// Route to render account settings
app.get('/', async (req, res) => {
  try {
    const user = await userModel.findOne({}); // Fetch user data from MongoDB
    res.render('account_setting', { user }); // Render 'account_setting' view with user data
  } catch (err) {
    console.error('Error:', err);
    res.send('Error loading user settings');
  }
});

// post CHD_name and image_path to PA_autoTraing_v5.py
app.post('/train', (req, res) => {
  // 設置 Flask 伺服器的基本 URL
  const flaskUrl = 'http://localhost:5001';
  // 要發送的 JSON 數據
  const data = { image_path, CHD_name } = req.body;
  
  console.log('(app.js) Sending train request with data', data);

  // 發送 POST 請求到 Flask 伺服器的 /train 路由
  axios.post(`${flaskUrl}/train`, data)
    .then(response => {
      console.log('(app.js) Flask Server Response: ', response.data);
      res.send(response.data);
    })
    .catch(error => {
      console.error('(app.js) Error Sending Requests: ', error);
      res.status(500).send("Error training image. ");
    });
})

// // post CHD_name and image_path to CHD_detect.py
// app.get('/detect', (req, res) => {
//   // 設置 Flask 伺服器的基本 URL
//   const flaskUrl = 'http://localhost:5001';
//   // 要發送的 JSON 數據
//   const data = { CHD_name, image_path } = req.body;
  
//   console.log('(app.js) Sending detect request with data', data);

//   // 發送 POST 請求到 Flask 伺服器的 /detect 路由
//   axios.post(`${flaskUrl}/detect`, data)
//     .then(response => {
//       console.log('(app.js) Flask Server Response: ', response.data);
//       res.send(response.data);
//     })
//     .catch(error => {
//       console.error('(app.js) Error Sending Requests: ', error);
//       res.status(500).send("Error detecting image. ");
//     });
// })

// Route to handle user editing
app.post('/edituser', async (req, res) => {
  try {
    const { userId, newGmail, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userModel.updateOne({ _id: userId }, { $set: { gmail: newGmail, password: hashedPassword } });
    res.redirect('/'); // Redirect to home page after successful update
  } catch (err) {
    console.error('Error:', err);
    res.send('Error updating user settings');
  }
});

app.post('/uploadAndTrain', imageController); // Handle CHD upload and initial processing
app.post('/uploadAndDetect', imageController); // Handle CHS upload and initial processing
app.post('/uploadAndSegment', imageController);

app.post('/upload', upload.single('upload-box'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const filePath = path.join(__dirname, 'uploads', req.file.filename);
  res.send({ filePath: filePath }); // 返回文件路径
});

// Route to provide images based on directory path
app.get('/images', (req, res) => {
  const imagePath = req.query.path;

  if (!imagePath) {
    return res.status(400).json({ error: 'Path parameter is required.' });
  }

  const absolutePath = path.resolve(__dirname, imagePath);
  console.log(`absolutePath: ${absolutePath}`);

  if (!fs.existsSync(absolutePath)) {
    return res.status(404).json({ error: 'Directory not found.' });
  }

  const images = fs.readdirSync(absolutePath).map(file => `/path/to/images/${imagePath}/${file}`); // List image files
  res.json({ images }); // Return list of image URLs
});

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