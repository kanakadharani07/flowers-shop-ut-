const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const authRole = require('../middleware/roleCheck');

router.use(auth, authRole('admin', 'seller'));

// GET /api/seller/orders
// Get orders containing the seller's products (or all for admin)
router.get('/orders', async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      const sellerProducts = await Product.find({ sellerId: req.user.id });
      const productIds = sellerProducts.map(p => p._id);
      query = { 'orderItems.product': { $in: productIds } };
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/seller/orders/:id/status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Notify customer
    const user = await require('../models/User').findById(order.user);
    if (user) {
      user.notifications.push({
        title: `Order ${status}`,
        message: `Your order #${order._id.toString().substring(0,8)} status has been updated to ${status}.`,
        type: 'order'
      });
      await user.save();
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
