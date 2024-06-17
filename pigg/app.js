const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;
const url = "mongodb://localhost:27017/";
const dbName = "mydb";

// 设置 EJS 作为模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  const client = new MongoClient(url);
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

app.post('/edituser', async (req, res) => {
  const client = new MongoClient(url);
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
