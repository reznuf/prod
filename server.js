const express = require('express');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let userSecret = ''; // In real use, store per-user in DB

app.get('/', (req, res) => {
  res.send(`
    <h2>Setup 2FA</h2>
    <form action="/generate" method="POST">
      <button>Generate Secret & QR</button>
    </form>
  `);
});

app.post('/generate', async (req, res) => {
  userSecret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri('user@example.com', 'MyAuthySite', userSecret);
  const qr = await QRCode.toDataURL(otpauth);
  res.send(`
    <h3>Scan this in Authy:</h3>
    <img src="${qr}"/><br/>
    <p>Secret: ${userSecret}</p>
    <form action="/verify" method="POST">
      <input name="token" placeholder="Enter Authy Code"/>
      <button>Verify</button>
    </form>
  `);
});

app.post('/verify', (req, res) => {
  const token = req.body.token;
  const isValid = authenticator.check(token, userSecret);
  res.send(isValid ? '<h2>✅ Valid Code!</h2>' : '<h2>❌ Invalid Code.</h2>');
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));
