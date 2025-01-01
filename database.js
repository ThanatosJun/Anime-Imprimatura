var mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { GridFSBucket } = require('mongodb');

// 加載環境變量
dotenv.config();

// 使用環境變量中的 MONGO_URI，並進行錯誤檢查
const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error('MONGO_URI is not defined in the environment variables');
}

// 打印連接 URI（隱藏密碼）
console.log('Connecting with URI:', uri.replace(/:[^:]*@/, ':****@'));

// connect to mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB', err));

var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// setup of gfs
let gridFSBucket;

mongoose.connection.once('open', () => {
  gridFSBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'  // 你可以更改這個名字
  });
  console.log('GridFSBucket is initialized and ready');
});

module.exports = {
  db,
  mongoose,
  bcrypt,
  getGridFSBucket: () => gridFSBucket
};