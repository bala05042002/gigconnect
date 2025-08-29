const crypto = require('crypto');

// Generate a random string of 32 bytes and convert to hexadecimal
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('Your JWT Secret:', jwtSecret);