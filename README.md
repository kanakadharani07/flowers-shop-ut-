# 🌸 Flower Cart System

A full-stack, enterprise-grade e-commerce application designed to revolutionize the way flowers and bouquets are bought and sold online. Built with a robust **MERN stack**, this platform features a beautiful, dynamic Vanilla CSS UI and completely custom role-based management for Customers, Sellers, and Administrators.

## ✨ Features

### 🛍️ For Customers
* **Beautiful Product Catalog:** Explore gorgeous bouquets, arrangements, pots, and special gifts.
* **Smart Cart & Checkout:** Seamlessly add items, track stock naturally, and purchase securely.
* **Live Notifications & Inbox:** Get instant push notifications right in your Navbar when your order ships or deliveries occur.
* **Wishlist Component:** Mark your favorite items for later!

### 🏪 For Sellers
* **Seller Dashboard:** Add product catalogs with beautiful image previews.
* **Order Management:** View all incoming orders for your specific flowers and manually update status to Processing, Shipped, or Delivered.
* **Live Earnings Tracker:** Watch your revenue grow in real-time.
* **Direct Comms:** Receive real-time approval/rejection updates from the Admin.

### 👑 For Administrators
* **Powerful Admin Dashboard:** Total oversight over the entire business operation.
* **Global Aggregation Statistics:** Real-time analytics on Total Users, Products, Orders, and Gross Revenue!
* **Seller Verification:** Review seller applications and dynamically Approve or Revoke selling rights with one click.
* **Live Messaging:** Select sellers and push direct messages/queries right to their custom notification tray.

---

## 🛠️ Technology Stack

* **Frontend:** React (Vite build system), Custom Vanilla CSS (Design-Ops), React Router v6
* **Backend:** Node.js, Express.js
* **Database:** MongoDB and Mongoose (Aggregation pipelines & Relational schema)
* **Auth & Security:** JWT (JSON Web Tokens), `bcryptjs`, and native Role-Based Access Control APIs

---

## 🚀 Getting Started

### 1. Requirements
Ensure you have the following installed to run the application locally:
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017/` or via MongoDB Atlas URI)

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `/backend` directory and add the following keys:
```env
PORT=5001
JWT_SECRET=supersecret123
MONGODB_URI=your_mongo_database_uri_here
```

Start the backend API server:
```bash
npm run dev
```
*(Runs on `http://localhost:5001` with nodemon auto-reloads)*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Run the development UI:
```bash
npm run dev
```
*(Runs on `http://localhost:5173` or `5174` with Vite HMR)*

---

## 🔑 Default Accounts Setup
To explore all roles, create an account normally via the website. An admin must configure their credentials programmatically or via backend seed arrays:
* Default Admin details vary based on active config context but standard setup accepts `admin@flowershop.com`

## 🎨 UI/UX Philosophy
The Flower Cart System strictly avoids generic CSS frameworks like Tailwind or Bootstrap. The entire application employs **Vanilla CSS** mapping to achieve pixel-perfect rendering, glassmorphism overlays, custom scrollbars, and zero-latency micro-animations!

---
*Created and Maintained for Flower Cart System*
