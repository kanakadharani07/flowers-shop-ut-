const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const authRole = require('../middleware/roleCheck');

router.use(auth, authRole('admin'));

// ─── GET /api/admin/stats ──────────────────────────────────────────────────
// Returns total users, total products, total orders, total revenue
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, orders] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find()
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    res.json({ totalUsers, totalProducts, totalOrders, totalRevenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/admin/users/:id ─────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/admin/orders ────────────────────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/admin/orders/:id/status ────────────────────────────────────
router.put('/orders/:id/status', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.status = req.body.status || order.status;
    const updatedOrder = await order.save();

    // Notify customer
    const user = await User.findById(order.user);
    if (user) {
      user.notifications.push({
        title: `Order ${order.status}`,
        message: `Your order #${order._id.toString().substring(0,8)} is now ${order.status}.`,
        type: 'order'
      });
      await user.save();
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/admin/pending-sellers ─────────────────────────────────────
router.get('/pending-sellers', async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller', isApproved: false })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/admin/all-sellers ──────────────────────────────────────────
// Returns all sellers (approved + pending) with their revenue
router.get('/all-sellers', async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' }).select('-password').sort({ createdAt: -1 });

    // Calculate revenue per seller from orders
    const orders = await Order.find();
    const revenueMap = {};

    for (const order of orders) {
      for (const item of order.orderItems) {
        const sellerId = item.seller?.toString();
        if (sellerId) {
          revenueMap[sellerId] = (revenueMap[sellerId] || 0) + item.price * item.qty;
        }
      }
    }

    const sellersWithRevenue = sellers.map(s => ({
      ...s.toObject(),
      revenue: revenueMap[s._id.toString()] || 0
    }));

    res.json(sellersWithRevenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/admin/approve-seller/:id ──────────────────────────────────
router.post('/approve-seller/:id', async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    
    seller.isApproved = true;
    seller.notifications.push({
      title: 'Wait is Over! 🎉',
      message: 'Wow... you got the approval from admin! You can now start adding products.',
      type: 'success'
    });
    
    await seller.save();
    res.json({ message: 'Seller approved successfully', seller });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/admin/reject-seller/:id ───────────────────────────────────
// Revokes approval (does not delete) — use DELETE to remove
router.post('/reject-seller/:id', async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    
    seller.isApproved = false;
    seller.notifications.push({
      title: 'Seller Approval Revoked',
      message: 'Your seller approval has been revoked by the admin.',
      type: 'alert'
    });
    
    await seller.save();
    res.json({ message: 'Seller approval revoked', seller });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/admin/sellers/:id ───────────────────────────────────────
router.delete('/sellers/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Seller account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/admin/sellers/:id/query ───────────────────────────────────
// Admin sends a message/resolution to a seller
router.post('/sellers/:id/query', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const seller = await User.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    seller.notifications.push({
      title: 'Message from Admin',
      message: message,
      type: 'system'
    });
    await seller.save();

    res.json({ message: 'Query sent to seller', seller });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
