var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

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

var db = require('./database');

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
app.use('/account_management', accountManagementRouter);
app.use('/create_account', createAccountRouter);
app.use('/gallery', galleryRouter);
app.use('/generate_visitor', generateVisitorRouter);
app.use('/generated_visitor', generatedVisitorRouter);
app.use('/login', loginRouter);
app.use('/team_gallery_f', teamGalleryFRouter);
app.use('/team_gallery_t', teamGalleryTRouter);

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
