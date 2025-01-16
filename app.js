const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

const crypto = require('crypto');
const generateRandomString = () => crypto.randomBytes(16).toString('base64url');

const rpName = 'Demmo';
const rpID = 'refactored-space-goldfish-rj9x7pvpq792p9q-3000.app.github.dev';
const origin = 'https://refactored-space-goldfish-rj9x7pvpq792p9q-3000.app.github.dev';

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let users = {}; 
let challenges = {}; 

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

async function getRegisterOption(user, username){
  return await generateRegistrationOptions({
    rpName,
    rpID,
    userID:user.id,
    userName: username,
    attestationType: 'none',
    excludeCredentials: user.credentials.map((cred) => ({
      id: cred.id,
      type: 'public-key',
    })),
  });
}

async function getLoginOption(user){
  return await generateAuthenticationOptions({
    rpID,
    allowCredentials: user.credentials.map((cred) => ({
      id: cred.id,
      type: 'public-key',
    })),
  });
}

app.get('/', async (req, res) => {
  res.render('index');
});

app.post('/generate-registration-options', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = users[username] || { id: generateRandomString(), credentials: [] };
    users[username] = user;

    let options = await getRegisterOption(user, username);

    challenges[username] = options.challenge;
    res.send({ options })
  } catch (error) {
    console.log(error);
  }
});

app.post('/verify-register', async (req, res) => {  
  try {
    const { body } = req;
    const { username } = body;
    
    const expectedChallenge = challenges[username];
    const user = users[username];
    
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified) {
      const { registrationInfo } = verification;
      // user.credentials.push({
      //   id: Buffer.from(registrationInfo.credentialID).toString('base64url'),
      //   publicKey: Buffer.from(registrationInfo.credentialPublicKey).toString('base64url'),
      // });
      user.credentials.push({
        id: registrationInfo.credentialID,
        publicKey: registrationInfo.credentialPublicKey
      });
      
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false });
    }
  } catch (error) {
    console.log(error);
  }
});

app.post('/generate-login-options', async (req, res) => {
  try {
    const { username } = req.body;
  
    const user = users[username];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let options = await getLoginOption(user);

    challenges[username] = options.challenge;
    res.json(options);
  } catch (error) {
    console.log(error);
  }
});

// app.post('/verify-authentication', async (req, res) => {  
//   const { body } = req;
//   const { username } = body;

//   try {
//     const expectedChallenge = challenges[username];
//     const user = users[username];
  
//     console.log(Buffer.from(user.credentials[0].id).toString('base64url'));
//     console.log(Buffer.from(user.credentials[0].publicKey).toString('base64url'));

//     console.log({
//       response: body,
//       expectedChallenge,
//       expectedOrigin: origin,
//       expectedRPID: rpID,
//       authenticator: {
//         id: Buffer.from(user.credentials[0].id).toString('base64url').toLocaleLowerCase(),
//         publicKey: Buffer.from(user.credentials[0].publicKey).toString('base64url').toLocaleLowerCase(),
//         credentialPublicKey: Buffer.from(user.credentials[0].publicKey).toString('base64url').toLocaleLowerCase()
//       },
//     });
    
//     const verification = await verifyAuthenticationResponse({
//       response: body,
//       expectedChallenge,
//       expectedOrigin: origin,
//       expectedRPID: rpID,
//       authenticator: {
//         id: Buffer.from(user.credentials[0].id).toString('base64url').toLocaleLowerCase(),
//         publicKey: Buffer.from(user.credentials[0].publicKey).toString('base64url').toLocaleLowerCase(),
//         credentialPublicKey: Buffer.from(user.credentials[0].publicKey).toString('base64url').toLocaleLowerCase()
//       },
//     });

//     console.log(verification);

//     if (verification.verified) {
//       res.json({ verified: true });
//     } else {
//       res.status(400).json({ verified: false });
//     }
//   } catch (err) {
//     console.log(err);
    
//     res.status(500).json({ error: err.message });
//   }
// });

app.post('/verify-authentication', async (req, res) => {  
  const { body } = req;
  const { username } = body;

  try {
    const expectedChallenge = challenges[username];
    const user = users[username];

    // Ensure credentials exist
    if (!user || !user.credentials || user.credentials.length === 0) {
      throw new Error('User credentials not found');
    }

    const storedCredential = user.credentials[0];

    // Prepare authenticator data
    const authenticator = {
      id: storedCredential.id, // Raw binary data
      credentialPublicKey: storedCredential.publicKey, // Raw binary data
      counter: storedCredential.counter || 0, // Initialize counter
    };

    // Debugging
    console.log('Authenticator:', authenticator);

    // Verify authentication response
    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator,
    });

    console.log('Verification Result:', verification);

    if (verification.verified) {
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false });
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
