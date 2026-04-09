const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');

// POST /api/orders (User only)
router.post('/', auth, async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalPrice, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const newOrderItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: `Product ${item.name || 'Unknown'} not found` });
      }

      if (product.stock < item.qty) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      // ✅ BUILD CORRECT ORDER ITEM
      newOrderItems.push({
        product: product._id,
        name: product.name,
        qty: item.qty,
        price: product.price,
        seller: product.sellerId   // 🔥 CRITICAL FIX
      });
    }

    const order = new Order({
      user: req.user.id,
      orderItems: newOrderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Deduct stock
    for (const item of newOrderItems) {
      const product = await Product.findById(item.product);
      product.stock -= item.qty;
      await product.save();
    }

    // Notify customer
    const user = await User.findById(req.user.id);
    if (user) {
      user.notifications.push({
        title: 'Order Placed Successfully!',
        message: `Your order #${createdOrder._id.toString().substring(0,8)} has been placed. Total: ₹${totalPrice}`,
        type: 'order'
      });
      await user.save();
    }

    // Notify seller(s)
    const sellerIds = [...new Set(newOrderItems.map(item => item.seller.toString()))];
    for (const sellerId of sellerIds) {
      const seller = await User.findById(sellerId);
      if (seller) {
        seller.notifications.push({
          title: 'New Order Received',
          message: `Someone just ordered products from you! Check your orders panel.`,
          type: 'order'
        });
        await seller.save();
      }
    }

    res.status(201).json(createdOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/myorders
router.get('/myorders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
