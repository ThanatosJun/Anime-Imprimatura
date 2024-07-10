require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const connectMongoDB = require('./database'); // 引入數據庫連接模塊
const userModel = require('./models/user');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser'); //處理http請求的數據
const port = 3000;
const multer = require('multer');

var app = express();

// Multer setup
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'uploads/'); //uploaded file route
  },
  filename: function(req, file, cb){
    cb(null, Date.now() + path.extname(file.originalname)); //generate UNIQUE file name
  }
});
const upload = multer({ storage: storage });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

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

//Temporarily save data
const data = [];

// process http data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// import and use api route
const apiRouter = require('./api');
app.use('/api', apiRouter);

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

app.get('/', async (req, res) => {
  try {
    const user = await userModel.findOne({});
    res.render('account_setting', { user });
  } catch (err) {
    console.error('Error:', err);
    res.send('Error loading user settings');
  }
});

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

// multer (con.)
app.post('/upload', upload.fields([{name: 'chd', maxCount: 3}, {name: 'chs', maxCount: 1}]), (req, res)=>{
  console.log(req.files); // 在這裡調用AI模型，生成新圖片，並重定向到生成頁面
  res.redirect('/generated');
})

// 404 processer
app.use((req, res, next) =>{
  console.log('404 not found:', req.originalUrl);
  res.status(404).send('not found');
})

app.listen(port, (err) => {
  if(err){
    return console.error(err);
  }
  return console.log(`Server is running on ${port}`);
});

module.exports = app;