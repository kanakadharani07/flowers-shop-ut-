const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, businessName, businessAddress } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: passwordHash,
      role: role && ['user', 'admin', 'seller'].includes(role) ? role : 'user',
      businessName: role === 'seller' ? businessName : undefined,
      businessAddress: role === 'seller' ? businessAddress : undefined
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    const responseUser = savedUser.toObject();
    delete responseUser.password;

    res.json({
      token,
      user: responseUser
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.role === 'seller' && !user.isApproved) {
      return res.status(403).json({ message: 'Your seller account is pending admin approval.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    const responseUser = user.toObject();
    delete responseUser.password;

    res.json({
      token,
      user: responseUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { email, name, googleId } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if they don't exist
      const salt = await bcrypt.genSalt(10);
      const randomPassword = Math.random().toString(36).slice(-10);
      const passwordHash = await bcrypt.hash(randomPassword, salt);

      user = new User({
        name: name || email.split('@')[0],
        email,
        password: passwordHash,
        role: 'user'
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    const responseUser = user.toObject();
    delete responseUser.password;

    res.json({
      token,
      user: responseUser
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/firebase-sync
router.post('/firebase-sync', async (req, res) => {
  try {
    const { email, name, uid, role } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: name || email.split('@')[0],
        email,
        password: uid, // Use Firebase UID as dummy password since auth is handled by Firebase
        role: role || 'user'
      });
      await user.save();
    } else if (user.role !== role && role) {
       // Optional: sync role if changed from Firebase? 
       // We'll keep backend role if exists to avoid overwrite by malicious frontend, 
       // but for this task we respect the DB role.
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/addresses
router.get('/addresses', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.addresses || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/cart
router.post('/cart', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.cart = req.body.cart;
    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/wishlist
router.post('/wishlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.wishlist = req.body.wishlist;
    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/addresses
router.post('/addresses', auth, async (req, res) => {
  try {
    const { addresses } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.addresses = addresses;
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DEV ONLY: POST /api/auth/make-admin (For testing/initial setup)
router.post('/make-admin', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User is now admin', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
