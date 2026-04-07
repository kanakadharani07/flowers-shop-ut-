const http = require('http');

const data = JSON.stringify({
  email: 'test@flowershope.com',
  name: 'Test',
  uid: 'dummy-uid',
  role: 'user'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/firebase-sync',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
