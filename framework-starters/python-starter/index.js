const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <body style="font-family: system-ui; text-align: center; padding: 50px;">
        <h2>Python Playground Ready</h2>
        <p>⚠️ Native Python execution requires WASM in the browser.</p>
        <p>You can still write and save your Python code in <code>main.py</code>!</p>
      </body>
    </html>
  `);
});

server.listen(0, () => {
  console.log("Python Starter ready on dynamic port:", server.address().port);
});
