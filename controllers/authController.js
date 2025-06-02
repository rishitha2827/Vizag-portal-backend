// controllers/authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register new user
exports.registerUser = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    mobile,
    unit,
    role, // optional
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !password || !confirmPassword || !mobile || !unit) {
    return res.status(400).json({ message: `All fields are required !${firstName}  !${lastName} !${email} !${password}  !${confirmPassword}  !${mobile} !${unit}` });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    mobile,
    unit,
    role: role || 'user', // default to 'user' if not provided
  });

  if (user) {
    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        unit: user.unit,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
    console.log(error);
  }
};

// @desc    Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        unit: user.unit,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    });

  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ message: 'Server error during login' });
  }
};
