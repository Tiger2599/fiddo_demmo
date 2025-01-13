const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Registration options
const registrationOptions = {
  rp: {
    name: "My App",
    id: "http://7e2e-110-227-210-237.ngrok-free.app",
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

// Login options
const loginOptions = {
  challenge: "55bd9a25bdcfe6e7b35bc979c5d2b041cc1abd3d4828b75e1df070fcd16581be",
  rpId: "http://7e2e-110-227-210-237.ngrok-free.app",
  allowCredentials: [
    {
      id: "zV5GsR8XwRgg6N22SHXAuGBDUxLQU47F7BOowRiF3DkqPB-IGLHCBh6CZSokHmJ9TXCTpit3CzI-Vmw7PHMBMQ==",
      type: "public-key",
    },
  ],
  userVerification: "preferred",
  timeout: 60000,
};

// Routes
app.get('/', (req, res) => {
  res.render('index', { registrationOptions, loginOptions });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
