const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <body style="font-family: system-ui; text-align: center; padding: 50px;">
        <h2>C++ Playground Ready</h2>
        <p>⚠️ Native C++ compilation requires WASM in the browser.</p>
        <p>You can still write and save your C++ code in <code>main.cpp</code>!</p>
      </body>
    </html>
  `);
});

server.listen(0, () => {
  console.log("C++ Starter ready on dynamic port:", server.address().port);
});
