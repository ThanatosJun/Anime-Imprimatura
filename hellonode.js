//載入HTTP模組
var http = require("http");

//創建HTTP 伺服器並監聽8000埠
http
  .createServer(function (request, response) {
    // Set the response HTTP header with HTTP status and Content type
    response.writeHead(200, { "Content-Type": "text/plain" });

    // Send the response body "Hello World"
    response.end("Hello World\n");
  })
  .listen(8000);

// Print URL for accessing server
console.log("Server running at http://127.0.0.1:8000/");
