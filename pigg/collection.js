const MongoClient = require('mongodb').MongoClient;

const url = "mongodb://localhost:27017/";
const dbName = "mydb";

async function createCollection() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);

    // 創建名為 "user" 的 collection
    await db.createCollection("user");
    console.log("Collection 'user' created!");

    // 創建名為 "image" 的 collection
    await db.createCollection("image");
    console.log("Collection 'image' created!");

    // 創建名為 "chs" 的 collection
    await db.createCollection("chs");
    console.log("Collection 'chs' created!");

    // 創建名為 "chd" 的 collection
    await db.createCollection("chd");
    console.log("Collection 'chd' created!");

    // 創建名為 "coloredchd" 的 collection
    await db.createCollection("coloredchd");
    console.log("Collection 'coloredchd' created!");

    // 創建名為 "coloring_video" 的 collection
    await db.createCollection("coloring_video");
    console.log("Collection 'coloring_video' created!");

    // 創建名為 "downloadable_content" 的 collection
    await db.createCollection("downloadable_content");
    console.log("Collection 'downloadable_content' created!");

    // 創建名為 "team_user" 的 collection
    await db.createCollection("team_user");
    console.log("Collection 'team_user");

    // 創建名為 "team" 的 collection
    await db.createCollection("team");
    console.log("Collection 'team");

    // 創建名為 "shared_content" 的 collection
    await db.createCollection("shared_content");
    console.log("Collection 'shared_content");

    // 創建名為 "shared_content_video" 的 collection
    await db.createCollection("shared_content_video");
    console.log("Collection 'shared_content_video");

    // 創建名為 "shared_content_image" 的 collection
    await db.createCollection("shared_content_image");
    console.log("Collection 'shared_content_image");

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

createCollection().catch(console.error);