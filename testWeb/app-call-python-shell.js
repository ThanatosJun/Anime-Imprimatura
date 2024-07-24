const express = require('express')
const app = express()
const axios = require('axios');
let { PythonShell } = require('python-shell')

// 设置允许所有源访问
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // 允许的其他头部信息
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  // 允许的HTTP方法
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // 是否允许发送Cookie信息（需要设置为true才能发送）
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// 根路徑處理函數
app.get('/', (req, res) => {
  res.send('Welcome to the Python Shell Example! Use /call/python to make a request.')
})
app.get('/python', (req, res) => {
  res.send('ssd')
})

app.listen(3001, (err) => {
  if (err) {
    console.error('Failed to start server:', err)
  } else {
    console.log('server running on port 3001')
  }
})

app.get('/sss', (req, res) => {
  // 設置 Flask 伺服器的基本 URL
  const flaskUrl = 'http://localhost:8000';
  // 要發送的 JSON 數據
  const data = {
    string: 'Hello, Flask!'
  };
  // 發送 POST 請求到 Flask 伺服器的 /process_string 路由
  axios.post(`${flaskUrl}/process_string`, data)
    .then(response => {
      console.log('Flask 伺服器的回應：', response.data);
    })
    .catch(error => {
      if (error.response) {
        // 请求成功但状态码不在 2xx 范围
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // 请求发出但没有收到响应
        console.log(error.request);
      } else {
        // 在设置请求时发生了错误
        console.log('Error', error.message);
      }
    });
})

app.get('/call/python', pythonProcess)


function pythonProcess(req, res) {
  let options = {
    mode: 'text',
    pythonOptions: ['-u'], // unbuffered output
    scriptPath: '', // 如果 process.py 在同一目錄下，留空即可
    args: [
      req.query.name,
      req.query.from
    ]
  }

  PythonShell.run('process.py', options, (err, results) => {
    if (err) {
      res.send(err)
      return
    }
    try {
      const parsedString = JSON.parse(results[0])
      console.log(`name: ${parsedString.Name}, from: ${parsedString.From}`)
      res.json(parsedString)
    } catch (e) {
      res.send(e.message)
    }
  })
}
