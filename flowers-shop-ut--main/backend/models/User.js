const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'seller'], default: 'user' },
  isApproved: { type: Boolean, default: function() {
    return this.role !== 'seller';
  }},
  businessName: { type: String },
  businessAddress: { type: String },
  cart: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    image: String,
    qty: { type: Number, default: 1 },
    stock: Number
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  addresses: [{
    fullName: String,
    address: String,
    city: String,
    postalCode: String,
    phone: String,
  }],
  adminNotes: [{ message: String, sentAt: Date }],
  notifications: [{
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['order', 'system', 'offer', 'alert', 'success'], default: 'system' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
