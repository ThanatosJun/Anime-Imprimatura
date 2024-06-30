const express = require('express');
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

// 插入用戶數據的函數
async function insertUsers() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    try {
        await withTimeout(client.connect(), 5000); // 設定超時時間為5秒
        console.log("Connected to MongoDB");
        
        const db = client.db(dbName);
        const userDocuments = [
            /* 用戶文件
            {
                "_id": { "id": "66603f62eaa98922f6a8cc9d" },
                "gmail": "yyy@gmail.com",
                "password": "$2b$10$mJHI3yLuVC5vhAXhreu0Gekt4Md54.ZCYEwFTgl7giTtkHFaV5rVS"
            },
            */
            // 添加更多用戶文件
              {
                "_id": { "id": "d3a1b0a1e7b0a2d3e0c1f2d3" },
                "gmail": "cassandra.bednar@example.com",
                "password": "$2b$10$fs7j3GvW0NfD3Q1T6d5Hs4j7U4vA9u5f0yJ3vF7l5T9yH0x8d2R5E"
              },
              {
                "_id": { "id": "a2c5d3e0b0f1d2a3e1b4c5f6" },
                "gmail": "dexter.schiller@example.com",
                "password": "$2b$10$a5K8bG7lD3V9nW0T4f6H7j9dL5C2s3Y5m8J7k4F3t6P1u7B0v3N5C"
              },
              {
                "_id": { "id": "f3d1b2e0c4a5f6b3d2e1a7b8" },
                "gmail": "tiana.mertz@example.com",
                "password": "$2b$10$k9L3vG0jF8D4s6T1m2Y5n7P8b3A7x5Q9g6C1d2F4K5w8R7j1T0M"
              },
              {
                "_id": { "id": "b2d3f4e1c0a5d6b1e7f0c2a3" },
                "gmail": "vivianne.littel@example.com",
                "password": "$2b$10$u7G5t3D2m9K1v6P8f4S0h1C5r7J3x4W8b6F9L2v0T3d5N6y7J8R"
              },
              {
                "_id": { "id": "c1a2d3e4b5f6g0h7i8j9k0l1" },
                "gmail": "tanner.koss@example.com",
                "password": "$2b$10$m8L2f7T0j5D3v4K6p1Y9b2C3r0S8w5H1d7G6N9k4P2u7F3t6J1V"
              },
              {
                "_id": { "id": "a3d1e2f0c4b5d6a7e1f2g3h4" },
                "gmail": "delphia.torp@example.com",
                "password": "$2b$10$b9D4u6P1j8G2v3T0k7M1h5L6n2Y4F5w0C3x1R7f9J8d0S2t3K5N"
              },
              {
                "_id": { "id": "e1c2d3f4b5a6g0h7i8j9k0l2" },
                "gmail": "bette.goyette@example.com",
                "password": "$2b$10$h6F1j3K2m9D4v5L0t7N1u8G5w2C3Y9P0b7x4R8d0S6p3J2t5V1L"
              },
              {
                "_id": { "id": "b4d1f2e3a5c6d7b0e1g2h3i4" },
                "gmail": "darrell.paucek@example.com",
                "password": "$2b$10$j7H2k3L5m8G4v0P1t6N9d1C2r3Y5w8F0b4x6R9j2S7u3K1t5F0V"
              },
              {
                "_id": { "id": "d0a3e2b1c5f4d6a7e1g2h3i5" },
                "gmail": "jayde.stokes@example.com",
                "password": "$2b$10$n8K3v1D4m7G0f5L2p6Y9b3C1r2S5x4W0d7J9F8l0T2u6H3t5P1M"
              },
              {
                "_id": { "id": "e2d3c4b5a6g0h7i8j9k0l3m1" },
                "gmail": "jaylan.mccullough@example.com",
                "password": "$2b$10$t6F1j3K2m9D4v5L0t7N1u8G5w2C3Y9P0b7x4R8d0S6p3J2t5V1L"
              },
              {
                "_id": { "id": "a5c1d3f4e6b2g7h0i9j8k0l4" },
                "gmail": "ashleigh.lowe@example.com",
                "password": "$2b$10$d9K4t7G3m8J1v6P5f2S0h1L6n2Y4F5w0C3x1R7f9J8d0S2t3K5N"
              },
              {
                "_id": { "id": "b3a2d1f4e6c5g0h7i8j9k0l5" },
                "gmail": "abbigail.ratke@example.com",
                "password": "$2b$10$f6G1j3K2m9D4v5L0t7N1u8G5w2C3Y9P0b7x4R8d0S6p3J2t5V1L"
              },
              {
                "_id": { "id": "c5d2a1e3b4f6g0h7i8j9k0l6" },
                "gmail": "elisha.huel@example.com",
                "password": "$2b$10$g9K4t7G3m8J1v6P5f2S0h1L6n2Y4F5w0C3x1R7f9J8d0S2t3K5N"
              },
              {
                "_id": { "id": "e3a1d2c5f4b6g0h7i8j9k0l7" },
                "gmail": "dandre.schuster@example.com",
                "password": "$2b$10$h6F1j3K2m9D4v5L0t7N1u8G5w2C3Y9P0b7x4R8d0S6p3J2t5V1L"
              },
              {
                "_id": { "id": "d4b1a2c3e5f6g0h7i8j9k0l8" },
                "gmail": "laisha.nader@example.com",
                "password": "$2b$10$j9G4t7K2m8J1v6P5f2S0h1L6n2Y4F5w0C3x1R7f9J8d0S2t3K5N"
              },
              {
                "_id": { "id": "c4e1d2a3b5f6g0h7i8j9k0l9" },
                "gmail": "verdie.murazik@example.com",
                "password": "$2b$10$k6F1j3K2m9D4v5L0t7N1u8G5w2C3Y9P0b7x4R8d0S6p3J2t5V1L"
              },
              {
                "_id": { "id": "b1d2a3e4c5f6g0h7i8j9k0m0" },
                "gmail": "cierra.hudson@example.com",
                "password": "$2b$10$m7K4t6G3j8F1v2P0d6N1y9L5h3S4w8C2b1R7x9J8d0S2t3K5N"
              },
              {
                "_id": { "id": "a3c1d2e4b5f6g0h7i8j9k0m1" },
                "gmail": "kameron.lehner@example.com",
                "password": "$2b$10$n8K4j7G2m9D1v6P0t5N3u8L5w2C1Y3P0b7x4R8d0S6p3J2t5V1L"
              },
              {
                "_id": { "id": "e5d1c2a3b4f6g0h7i8j9k0m2" },
                "gmail": "johnathon.reynolds@example.com",
                "password": "$2b$10$d6F1j3K2m9D4v5L0t7N1u8G5w2C3Y9P0b7x4R8d0S6p3J2t5V1L"
              },
              {
                "_id": { "id": "d3e1c2b4a5f6g0h7i8j9k0m3" },
                "gmail": "bernie.kozey@example.com",
                "password": "$2b$10$t7K4j6G2m8F1v9P0d5N1y3L5h4S2w8C0b1R7x9J8d0S2t3K5N"
              },
              {
                "_id": { "id": "c3b1d2a4e5f6g0h7i8j9k0m4" },
                "gmail": "addie.fisher@example.com",
                "password": "$2b$10$k7F1j3K2m9D4v5L0t7N1u8G5w2C3Y9P0b7x4R8d0S6p3J2t5V1L"
              },
              {
                "_id": { "id": "a2e1d3b4c5f6g0h7i8j9k0m5" },
                "gmail": "freida.hane@example.com",
                "password": "$2b$10$f6K3t4G1m8J9v6P2d7N0h1L6n2Y4F5w0C3x1R7f9J8d0S2t3K5N"
              },
              {
                "_id": { "id": "e4d1c3a2b5f6g0h7i8j9k0m6" },
                "gmail": "abdiel.langosh@example.com",
                "password": "$2b$10$h7F1j3K2m9D4v5L0t7N1u8G5w2C3Y9P0b7x4R8d0S6p3J2t5V1L"
              },
              {
                "_id": { "id": "d2a1c3b4e5f6g0h7i8j9k0m7" },
                "gmail": "earl.rath@example.com",
                "password": "$2b$10$j6K4t7G3m8F1v2P0d6N1y3L5h4S2w8C0b1R7x9J8d0S2t3K5N"
              },
              {
                "_id": { "id": "c2d1a3e4b5f6g0h7i8j9k0m8" },
                "gmail": "osvaldo.gleason@example.com",
                "password": "$2b$10$k8F1j3K2m9D4v5L0t7N1u8G5w2C3Y9P0b7x4R8d0S6p3J2t5V1L"
              },
              {
                "_id": { "id": "a1d2e3c4b5f6g0h7i8j9k0m9" },
                "gmail": "eleazar.kovacek@example.com",
                "password": "$2b$10$f7K3t4G1m8J9v6P2d7N0h1L6n2Y4F5w0C3x1R7f9J8d0S2t3K5N"
              },
              {
                "_id": { "id": "e1c2d3a4b5f6g0h7i8j9k0n0" },
                "gmail": "carlos.stiedemann@example.com",
                "password": "$2b$10$h8F1j3K2m9D4v5L0t7N1u8G5w2C3Y9P0b7x4R8d0S6p3J2t5V1L"
              },
              {
                "_id": { "id": "d1e2c3a4b5f6g0h7i8j9k0n1" },
                "gmail": "mariano.brown@example.com",
                "password": "$2b$10$j5K4t7G3m8F1v2P0d6N1y3L5h4S2w8C0b1R7x9J8d0S2t3K5N"
              },
              {
                "_id": { "id": "c1a2d3e4b5f6g0h7i8j9k0n2" },
                "gmail": "aniyah.stark@example.com",
                "password": "$2b$10$k5F1j3K2m9D4v5L0t7N1u8G5w2C3Y9P0b7x4R8d0S6p3J2t5V1L"
              },
              {
                "_id": { "id": "a0d1e2c3b4f5g6h7i8j9k0n3" },
                "gmail": "zachary.crona@example.com",
                "password": "$2b$10$f8K3t4G1m8J9v6P2d7N0h1L6n2Y4F5w0C3x1R7f9J8d0S2t3K5N"
              },
              {
                "_id": { "id": "e0c1d2a3b4f5g6h7i8j9k0n4" },
                "gmail": "cleve.miller@example.com",
                "password": "$2b$10$h9F1j3K2m9D4v5L0t7N1u8G5w2C3Y9P0b7x4R8d0S6p3J2t5V1L"
              },
              {
                "_id": { "id": "d0e1c2a3b4f5g6h7i8j9k0n5" },
                "gmail": "ariel.krajcik@example.com",
                "password": "$2b$10$j8K4t7G3m8F1v2P0d6N1y3L5h4S2w8C0b1R7x9J8d0S2t3K5N"
              },
              {
                "_id": { "id": "c0a1d2e3b4f5g6h7i8j9k0n6" },
                "gmail": "angelo.metz@example.com",
                "password": "$2b$10$k4F1j3K2m9D4v5L0t7N1u8G5w2C3Y9P0b7x4R8d0S6p3J2t5V1L"
              },
              {
                "_id": { "id": "a9b1d2c3e4f5g6h7i8j9k0n7" },
                "gmail": "celine.lesch@example.com",
                "password": "$2b$10$f9K3t4G1m8J9v6P2d7N0h1L6n2Y4F5w0C3x1R7f9J8d0S2t3K5N"
              },
              {
                "_id": { "id": "e9a1b2d3c4f5g6h7i8j9k0n8" },
                "gmail": "carleton.stokes@example.com",
                "password": "$2b$10$h5F1j3K2m9D4v5L0t7N1u8G5w2C3Y9P0b7x4R8d0S6p3J2t5V1L"
              },
              {
                "_id": { "id": "d9e1c2a3b4f5g6h7i8j9k0n9" },
                "gmail": "jarrell.towne@example.com",
                "password": "$2b$10$j4K4t7G3m8F1v2P0d6N1y3L5h4S2w8C0b1R7x9J8d0S2t3K5N"
              }           
        ];
        
        const result = await db.collection("user").insertMany(userDocuments);
        console.log("Number of documents inserted: " + result.insertedCount);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

async function insertUsers() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  try {
      await withTimeout(client.connect(), 5000); // 設定超時時間為5秒
      console.log("Connected to MongoDB");
      
      const db = client.db(dbName);
      const teamDocuments = [
        
      ]
      
      const result = await db.collection("user").insertMany(userDocuments);
      console.log("Number of documents inserted: " + result.insertedCount);
  } catch (err) {
      console.error("Error:", err);
  } finally {
      await client.close();
  }
}

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
