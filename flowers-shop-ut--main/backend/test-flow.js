const axios = require('axios');

const run = async () => {
  try {
    // 1. Login as User
    const loginUser = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'user@flowershope.com', password: 'user123'
    });
    const userToken = loginUser.data.token;
    console.log('User logged in');

    // 2. Fetch Products
    const products = await axios.get('http://localhost:5000/api/products');
    const product = products.data[0];
    console.log('Fetched product:', product.name);

    // 3. Place Order
    const orderRes = await axios.post('http://localhost:5000/api/orders', {
      orderItems: [{ product: product._id, name: product.name, qty: 1, price: product.price }],
      shippingAddress: { fullName: 'Test', address: '123 Test St', city: 'Test City', postalCode: '12345', phone: '1234567890' },
      totalPrice: product.price
    }, { headers: { Authorization: `Bearer ${userToken}` } });
    console.log('Order placed successfully. ID:', orderRes.data._id);

    // 4. Login as Admin
    const loginAdmin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@flowershope.com', password: 'admin123'
    });
    const adminToken = loginAdmin.data.token;
    console.log('Admin logged in');

    // 5. Fetch Orders as Admin using the Seller endpoint
    const ordersRes = await axios.get('http://localhost:5000/api/seller/orders', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const foundOrder = ordersRes.data.find(o => o._id === orderRes.data._id);
    console.log('Order visibility in Admin/Seller Dashboard endpoint:', !!foundOrder);
    
  } catch (err) {
    if (err.response) {
        console.error('Error:', err.response.data);
    } else {
        console.error('Error:', err.message);
    }
  }
};
run();
