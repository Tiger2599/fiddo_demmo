const express = require('express');
const path = require('path');
const { setTimeout } = require('timers');

const app = express();
const PORT = 3000;

const rpName = 'Demmo';
const rpID = 'redesigned-doodle-rj9x7pvpqr9fx9jp-3000.app.github.dev';
const origin = 'https://redesigned-doodle-rj9x7pvpqr9fx9jp-3000.app.github.dev/';

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const registrationOptions = {
  rp: {
    name: "My App",
    id: "redesigned-doodle-rj9x7pvpqr9fx9jp-3000.app.github.dev",
  },
  user: {
    id: "dXNlci1pZC0xMjM",
    name: "user@example.com",
    displayName: "User Example",
  },
  pubKeyCredParams: [
    {
      type: "public-key",
      alg: -7,
    },
  ],
  challenge: "crjwSV7uqqEsi_6oCq3c0YGKZLYjlUofOZOAvVKiGJs",
  timeout: 60000,
  attestation: "none",
};
const loginOptions = {
  challenge: "55bd9a25bdcfe6e7b35bc979c5d2b041cc1abd3d4828b75e1df070fcd16581be",
  rpId: "redesigned-doodle-rj9x7pvpqr9fx9jp-3000.app.github.dev",
  allowCredentials: [
    {
      id: "zV5GsR8XwRgg6N22SHXAuGBDUxLQU47F7BOowRiF3DkqPB-IGLHCBh6CZSokHmJ9TXCTpit3CzI-Vmw7PHMBMQ==",
      type: "public-key",
    },
  ],
  userVerification: "preferred",
  timeout: 60000,
};

const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} = require('@simplewebauthn/server');

async function getRegisterOption(){
  return await generateRegistrationOptions({
    rpName,
    rpID,
    userID:"dXNlci1pZC0xMjM",
    userName: "user@example.com",
    attestationType: 'none'
  });
}

// Routes
app.get('/', async (req, res) => {
  let options = await getRegisterOption();
  console.log(options);
  res.render('index', { registrationOptions:options, loginOptions });
  // res.render('index', { registrationOptions:registrationOptions, loginOptions });
});

app.post('/verify-register', async (req, res) => {
  console.log(req.body);
  
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
