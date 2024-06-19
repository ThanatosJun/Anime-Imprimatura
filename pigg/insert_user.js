var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var myobj = [{
        "_id": {
          "$oid": "66603f62eaa98922f6a8cc9d"
        },
        "gmail": "yyy@gmail.com",
        "password": "$2b$10$mJHI3yLuVC5vhAXhreu0Gekt4Md54.ZCYEwFTgl7giTtkHFaV5rVS"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a088182b"
        },
        "id": "66601",
        "gmail": "user1@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user1"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a088182c"
        },
        "id": "66602",
        "gmail": "user2@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user2"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a088182d"
        },
        "id": "66603",
        "gmail": "user3@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user3"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a088182e"
        },
        "id": "66604",
        "gmail": "user4@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user4"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a088182f"
        },
        "id": "66605",
        "gmail": "user5@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user5"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a0881830"
        },
        "id": "66606",
        "gmail": "user6@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user6"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a0881831"
        },
        "id": "66607",
        "gmail": "user7@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user7"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a0881832"
        },
        "id": "66608",
        "gmail": "user8@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user8"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a0881833"
        },
        "id": "66609",
        "gmail": "user9@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user9"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a0881834"
        },
        "id": "66610",
        "gmail": "user10@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user10"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a0881835"
        },
        "id": "66611",
        "gmail": "user11@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user11"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a0881836"
        },
        "id": "66612",
        "gmail": "user12@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user12"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a0881837"
        },
        "id": "66613",
        "gmail": "user13@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user13"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a0881838"
        },
        "id": "66614",
        "gmail": "user14@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user14"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a0881839"
        },
        "id": "66615",
        "gmail": "user15@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user15"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a088183a"
        },
        "id": "66616",
        "gmail": "user16@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user16"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a088183b"
        },
        "id": "66617",
        "gmail": "user17@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user17"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a088183c"
        },
        "id": "66618",
        "gmail": "user18@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user18"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a088183d"
        },
        "id": "66619",
        "gmail": "user19@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user19"
      },
      {
        "_id": {
          "$oid": "66606135a1e7a096a088183e"
        },
        "id": "66620",
        "gmail": "user20@example.com",
        "password": "$2b$10$EXAMPLEHASHEDPASSWORD",
        "user_name": "example_user20"
      }];
    dbo.collection("customers").insertMany(myobj, function(err, res) {
      if (err) throw err;
      console.log("Number of documents inserted: " + res.insertedCount);
      db.close();
    });
  });