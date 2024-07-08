const express = require('express');
const apiRouter = require('./api');
const userModel = require('./models/user');
const bcrypt = require('bcrypt');

const router = express.Router();

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

router.use('/', indexRouter);
router.use('/users', usersRouter);
router.use('/account_management', accountManagementRouter);
router.use('/create_account', createAccountRouter);
router.use('/gallery', galleryRouter);
router.use('/generate_visitor', generateVisitorRouter);
router.use('/generated_visitor', generatedVisitorRouter);
router.use('/login', loginRouter);
router.use('/team_gallery_f', teamGalleryFRouter);
router.use('/team_gallery_t', teamGalleryTRouter);

router.get('/', async (req, res) => {
  try {
    const user = await userModel.findOne({});
    res.render('account_setting', { user });
  } catch (err) {
    console.error('Error:', err);
    res.send('Error loading user settings');
  }
});

router.post('/edituser', async (req, res) => {
  try {
    const { newGmail, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userModel.updateOne({}, { $set: { gmail: newGmail, password: hashedPassword } }, { upsert: true });
    res.redirect('/');
  } catch (err) {
    console.error('Error:', err);
    res.send('Error updating user settings');
  }
});

router.use('/api', apiRouter);

module.exports = router;
