const http = require('http');

const data = JSON.stringify({
  fName: 'Jacob',
  lName: 'Anderson',
  email: `patient_auto_${Date.now()}@test.com`,
  password: 'test@123!',
  gender: 'Male',
  phone: '+521234567890',
  birthDate: '1994-03-28'
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/patient/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('Sending request to http://localhost:4000/patient/register ...');

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const parsed = JSON.parse(body);
      console.log('Response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Raw Response:', body);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
});

req.write(data);
req.end();