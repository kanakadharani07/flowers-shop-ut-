const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flowers-hope');
  const orders = await Order.find().populate('user').lean();
  console.log('Orders:', JSON.stringify(orders, null, 2));
  const products = await Product.find().lean();
  console.log('Products:', JSON.stringify(products, null, 2));
  const users = await User.find().lean();
  console.log('Users:', JSON.stringify(users.map(u => ({ id: u._id, name: u.name, role: u.role })), null, 2));
  process.exit();
};
run();
