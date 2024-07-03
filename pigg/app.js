const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const apiRouter = require('./api');

// 加載環境變量
dotenv.config();

const app = express();
const port = 3000;
const dbName = "mydb";

// 使用環境變量中的 MONGO_URI，並進行錯誤檢查
const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error('MONGO_URI is not defined in the environment variables');
}

// 打印連接 URI（隱藏密碼）
console.log('Connecting with URI:', uri.replace(/:[^:]*@/, ':****@'));

// 设置 EJS 作为模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.json());

app.use((req, res, next) => {
    if (connectStatus) {
        next();
    } else {
        res.status(503).send({
            status: false,
            message: 'Server is not ready.'
        });
    }
});

// Connect to MongoDB
async function connectMongoDB() {
  try {
      await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Connected to MongoDB.');
      connectStatus = true;
  } catch (error) {
      console.log(error);
  }
}
connectMongoDB();

// 根路由
app.get('/', async (req, res) => {
  try {
    const user = await userModel.findOne({});
    res.render('account_setting', { user });
  } catch (err) {
    console.error('Error:', err);
    res.send('Error loading user settings');
  }
});

// 更新用戶信息的路由
app.post('/edituser', async (req, res) => {
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


// import and use api route
app.use('/api', apiRouter);

// 啟動服務器並插入用戶數據
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});