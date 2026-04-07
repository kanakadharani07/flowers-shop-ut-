# Flowers Hope - MERN Stack E-commerce

A production-ready Flowers E-Commerce website built from scratch using the MERN stack.

## Prerequisites
- Node.js (v20+)
- MongoDB (local or Atlas)

## Setup Instructions

### 1. Database Setup
Ensure MongoDB is running locally on `mongodb://127.0.0.1:27017` or update the `MONGO_URI` in `backend/.env`.

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed  # Seed the database with flowers and test users
npm run dev   # Starts the server on port 5000
```

**Test Accounts:**
- Admin: admin@flowershope.com / admin123
- Seller: seller@flowershope.com / seller123
- User: user@flowershope.com / user123

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev   # Starts the React app on port 5173
```

## Features
- **User Auth**: Login/Register with JWT tokens. Protected routes for Cart/Order.
- **Admin Panel**: View all orders, update order status.
- **Seller Panel**: Add/Edit/Delete products, view specific orders.
- **Shopping Cart**: Real-time stock limits, qty update, subtotal.
- **Responsive Design**: Mobile-first UI using Tailwind CSS.
- **Flowers Only**: Focuses purely on floral products with beautiful categories.
