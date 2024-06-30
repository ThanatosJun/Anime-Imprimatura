require('dotenv').config(); // 加載 .env 文件中的環境變量
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGO_URI;

async function insertUsers() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await withTimeout(client.connect(), 5000); // 設定超時時間為5秒
        console.log("Connected to MongoDB");

        const db = client.db("mydb");
        const userDocuments = [
            // 用戶文件
            {
                "_id": {
                    "$oid": "66603f62eaa98922f6a8cc9d"
                },
                "gmail": "yyy@gmail.com",
                "password": "$2b$10$mJHI3yLuVC5vhAXhreu0Gekt4Md54.ZCYEwFTgl7giTtkHFaV5rVS"
            },
            // 添加更多用戶文件
        ];

        const result = await db.collection("user").insertMany(userDocuments);
        console.log("Number of documents inserted: " + result.insertedCount);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

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

insertUsers().catch(console.error);
