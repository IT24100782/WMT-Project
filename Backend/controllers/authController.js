const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for user email
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log(`[DEBUG] User not found: ${normalizedEmail}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if password starts with bcrypt signature ($2a$, $2b$, $2y$)
    const isBcryptHash = user.password && user.password.startsWith('$2');
    
    let isMatch = false;

    if (isBcryptHash) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      console.log(`[DEBUG] Unhashed (plaintext) password detected for user: ${normalizedEmail}`);
      // Fallback for old plaintext passwords
      isMatch = (password === user.password);
      
      // Optionally format and save the new hashed password for future logins
      if (isMatch) {
         console.log(`[DEBUG] Valid login. Consider hashing the password in the DB for user: ${normalizedEmail}`);
         // const salt = await bcrypt.genSalt(10);
         // user.password = await bcrypt.hash(password, salt);
         // await user.save();
      }
    }

    if (!isMatch) {
      console.log(`[DEBUG] Password comparison failed for user: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Wrong password' });
    }

    // Credentials are correct
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error(`[DEBUG] Login error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
