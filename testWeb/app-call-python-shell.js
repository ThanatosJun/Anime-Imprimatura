const express = require('express')
const app = express()
const axios = require('axios');
let { PythonShell } = require('python-shell')

// 根路徑處理函數
app.get('/', (req, res) => {
  res.send('Welcome to the Python Shell Example! Use /call/python to make a request.')
})
app.get('/python', (req, res) => {
  res.send('ssd')
})

app.listen(3000, (err) => {
  if (err) {
    console.error('Failed to start server:', err)
  } else {
    console.log('server running on port 3000')
  }
})

app.get('/sss', (req, res) => {
  // 設置 Flask 伺服器的基本 URL
  const flaskUrl = 'http://localhost:5000';
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
      console.error('發送請求時出錯：', error);
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
