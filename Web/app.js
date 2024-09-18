require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const archiver = require('archiver');
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
app.use('/images', express.static(path.join(__dirname, 'public/images')));
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
var guestRouter = require('./routes/guestRoute');
var usersRouter = require('./routes/users');
var accountManagementRouter = require('./routes/account_management');
var galleryRouter = require('./routes/galleryRoute');
var generateRouter = require('./routes/generateRoute');
var teamGalleryFRouter = require('./routes/team_gallery_f');
var teamGalleryTRouter = require('./routes/team_gallery_t');
var testRouter = require('./routes/testRoute');

// Use the imported routes
app.use('/', guestRouter);
app.use('/users', usersRouter);
app.use('/account_management', accountManagementRouter);
app.use('/gallery', galleryRouter);
app.use('/generate', generateRouter);
app.use('/team_gallery_f', teamGalleryFRouter);
app.use('/team_gallery_t', teamGalleryTRouter);
app.use('/test', testRouter);

// API route handler
app.use('/api', apiRouter); // Prefix API routes with '/api'

// Route to render account setting
app.get('/', async (req, res) => {
  try {
    const LOGO_01 = 'LOGO_01'; // 不包括文件擴展名
    const image_1 = 'chd'
    const image_2 = 'choose_pt'
    const image_3 = 'chs';
    const image_4 = 'seg'

    res.render('index', { LOGO_01, image_1, image_2, image_3, image_4 });
  } catch (err) {
    console.error('Error:', err);
    res.send('Error loading main page');
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

app.get('/gallery', async (req, res) => {
  try {
    const images = await fetchImagesFromDatabase(); // 获取图片数据的函数
    res.render('gallery', { images }); // 将 images 传递给 Pug 模板
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/download-result', (req, res) => {
  const dir = req.query.dir;
  const directoryPath = path.join(__dirname, dir);

  // Set the path for the temporary ZIP file
  const zipPath = path.join(__dirname, 'directory.zip');
  
  const output = fs.createWriteStream(zipPath); // Create a write stream for the ZIP file

  // Name of the ZIP file to be sent to the client
  const zipName = 'result.zip';

  // Set the response headers to indicate a file download
  res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

  // Create the ZIP archive
  const archive = archiver('zip', { zlib: { level: 9 } });

  // Handle errors during the archiving process
  archive.on('error', (err) => {
      console.error('Error while compressing directory: ', err);
      res.status(500).send('Error while compressing directory.');
  });

  // Pipe the archive data to the output stream
  archive.pipe(output);

  // Add the directory to the archive
  archive.directory(directoryPath, false);

  // Finalize the archive
  archive.finalize();

  // When the ZIP file is fully generated
  output.on('close', () => {
      // Send the ZIP file as a response to the client
      res.download(zipPath, zipName, (err) => {
          if (err) {
              console.error('Error sending zip file:', err);
              res.status(500).send('Error while sending ZIP file.');
          } else {
              // After the file is sent, delete the temporary ZIP file
              fs.unlink(zipPath, (err) => {
                  if (err) console.error('Error deleting zip file:', err);
                  else console.log('Zip file deleted successfully');
              });
          }
      });
  });
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