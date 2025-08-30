const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        console.log('📩 Register request body:', req.body);

        const { username, email, password, role, factoryName } = req.body;

        // Validate input
        if (!username || !email || !password || !role) {
            console.warn('⚠️ Missing required fields during registration');
            return res.status(400).json({
                message: 'Please provide username, email, password, and role'
            });
        }

        // Validate factory name for producers
        if (role === 'Green Hydrogen Producer' && !factoryName) {
            console.warn('⚠️ Factory name missing for producer');
            return res.status(400).json({
                message: 'Factory name is required for Green Hydrogen Producers'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            console.warn('⚠️ Duplicate user found:', existingUser.email, existingUser.username);
            return res.status(400).json({
                message: 'User with this email or username already exists'
            });
        }

        // Create new user
        const userData = { username, email, password, role };
        if (role === 'Green Hydrogen Producer') {
            userData.factoryName = factoryName;
        }

        const user = new User(userData);
        await user.save();

        console.log('✅ User registered:', user.username, user.email);

        // Generate token
        const token = generateToken(user._id);

        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        if (role === 'Green Hydrogen Producer') {
            userResponse.factoryName = user.factoryName;
            userResponse.factoryId = user.factoryId;
        }

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        console.log('📩 Login request body:', req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            console.warn('⚠️ Missing email or password during login');
            return res.status(400).json({
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.warn('⚠️ Login failed, no user with email:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.warn('⚠️ Login failed, invalid password for email:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log('✅ Login successful for:', user.email);

        const token = generateToken(user._id);

        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        if (user.role === 'Green Hydrogen Producer') {
            userResponse.factoryName = user.factoryName;
            userResponse.factoryId = user.factoryId;
        }

        res.json({
            message: 'Login successful',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        console.log('📩 /me request from userId:', req.user._id);

        const userResponse = {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role
        };

        if (req.user.role === 'Green Hydrogen Producer') {
            userResponse.factoryName = req.user.factoryName;
            userResponse.factoryId = req.user.factoryId;
        }

        console.log('✅ Returning user info:', userResponse);

        res.json({ user: userResponse });
    } catch (error) {
        console.error('❌ Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
