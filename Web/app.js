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
const mongoose = require('mongoose'); // Import the database connection module
const userModel = require('./models/user'); // Import the user model
const apiRouter = require('./api');
const { getGridFSBucket } = require('./database');

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
app.use(express.json());

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

// Route to render personal gallery
app.get('/images/:file_id', (req, res) => {
  try {
    // 确保 file_id 是合法的 ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.file_id)) {
      return res.status(400).json({ error: 'Invalid file ID format' });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.file_id); 
    console.log('fileId: ', fileId);

    const gridFSBucket = getGridFSBucket(); // 假设你有一个函数来获取 GridFSBucket
    const downloadStream = gridFSBucket.openDownloadStream(fileId);

    downloadStream.on('error', (err) => {
      console.error('Error during file download:', err);  // 打印错误信息
      res.status(404).json({ error: 'Image not found' });
    });

    downloadStream.on('file', () => {
      res.setHeader('Content-Type', 'image/jpeg');  // 设置正确的Content-Type
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error retrieving image:', error);  // 打印错误信息
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
app.post('/saveToGallery_personal_chd', galleryController.saveToGallery_personal_chd);
app.post('/saveToGallery_personal_chs', galleryController.saveToGallery_personal_chs);
app.post('/saveToGallery_personal_final', galleryController.saveToGallery_personal_final);
app.post('/getPersonalGallery', galleryController.getPersonalGallery);

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