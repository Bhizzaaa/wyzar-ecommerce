// In backend/routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User'); // Import our User model

// --- Registration Route ---
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  // 1. Get email and password from the request body
  const { email, password } = req.body;

  try {
    // 2. Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      // 400 = Bad Request
      return res.status(400).json({ msg: 'User already exists' });
    }

    // 3. If not, create a new user instance
    user = new User({
      email,
      password
    });

    // 4. Hash the password
    const salt = await bcrypt.genSalt(10); // Generate a 'salt'
    user.password = await bcrypt.hash(password, salt); // Hash the password

    // 5. Save the user to the database
    await user.save();

    // 6. Send a success response
    // (We will send a JWT token here later)
    res.status(201).json({ msg: 'User registered successfully' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Login Route ---
// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  // 1. Get email and password from request body
  const { email, password } = req.body;

  try {
    // 2. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // 400 = Bad Request. We send a generic message for security.
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 3. Compare the provided password with the hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 4. If credentials are correct, create a JWT token

    // The "payload" is the data we want to store in the token
    const payload = {
      user: {
        id: user.id
        // We can add more data here later, like role (e.g., 'seller')
      }
    };

    // 5. Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Your secret key from .env
      { expiresIn: 360000 }, // Token expiration (e.g., 100 hours)
      (err, token) => {
        if (err) throw err;
        // 6. Send the token back to the client
        res.json({ token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Get Logged In User Route ---
// @route   GET /api/auth/me
// @desc    Get the logged-in user's data
// @access  Private (Thanks to our 'auth' middleware)

router.get('/me', auth, async (req, res) => {
  try {
    // req.user.id comes from the auth middleware
    // We find the user by ID but exclude the password
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;