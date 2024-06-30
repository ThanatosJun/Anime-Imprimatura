require('dotenv').config(); // 加载环境变量
const MongoClient = require('mongodb').MongoClient;

const url = process.env.MONGO_URI;

if (!url) {
  console.error('Mongo URI is not defined');
  process.exit(1);
}

// 打印連接 URI（隱藏密碼）
console.log('Mongo URI:', url.replace(/:[^:]*@/, ':****@'));

const dbName = "mydb";

async function createCollection() {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);

    const collections = [
      'user', 'image', 'chs', 'chd', 'coloredchd', 'coloring_video',
      'downloadable_content', 'team_user', 'team', 'shared_content',
      'shared_content_video', 'shared_content_image'
    ];

    for (const name of collections) {
      const exists = await db.listCollections({ name }).toArray();
      if (exists.length === 0) {
        await db.createCollection(name);
        console.log(`Collection '${name}' created!`);
      } else {
        console.log(`Collection '${name}' already exists!`);
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

createCollection().catch(console.error);
