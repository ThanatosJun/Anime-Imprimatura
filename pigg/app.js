const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

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

// import userModel from /models
const userModel = require("./models/user")
//create a route/endpoint for collecting and sending inputs to db
app.post("/api/user", (req, res) =>{
  const SaveUser = new userModel(req.body)
  SaveUser.save((error, savedUser) =>{
    if(error) throw error
    res.json(savedUser)
  })
})

// 超時函數
function withTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error("Operation timed out"));
        }, ms);

        promise
            .then((res) => {
                clearTimeout(timeoutId);
                resolve(res);
            })
            .catch((err) => {
                clearTimeout(timeoutId);
                reject(err);
            });
    });
}

// 根路由
app.get('/', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const user = await db.collection('user').findOne({});
    res.render('account_setting', { user });
  } catch (err) {
    console.error('Error:', err);
    res.send('Error loading user settings');
  } finally {
    await client.close();
  }
});

// 更新用戶信息的路由
app.post('/edituser', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const { newGmail, newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.collection('user').updateOne({}, { $set: { gmail: newGmail, password: hashedPassword } }, { upsert: true });

    res.redirect('/');
  } catch (err) {
    console.error('Error:', err);
    res.send('Error updating user settings');
  } finally {
    await client.close();
  }
});

// 啟動服務器並插入用戶數據
app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  await insertUsers(); // 插入用戶數據
});
