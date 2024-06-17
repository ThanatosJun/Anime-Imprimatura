const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'mydb';

async function main() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    // 你可以在這裡添加更多的操作，例如創建集合或插入文檔
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

main().catch(console.error);