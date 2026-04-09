const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/notifications
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Sort notifications by date descending
    const notifications = user.notifications.sort((a, b) => b.createdAt - a.createdAt);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.notifications.forEach(n => {
      n.isRead = true;
    });
    
    await user.save();
    res.json({ message: 'All notifications marked as read', notifications: user.notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const notification = user.notifications.id(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    
    notification.isRead = true;
    await user.save();
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
