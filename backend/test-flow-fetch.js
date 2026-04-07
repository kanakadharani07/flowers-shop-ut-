const run = async () => {
  try {
    // 1. Login as User
    const loginUser = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@flowershope.com', password: 'user123' })
    });
    const userData = await loginUser.json();
    const userToken = userData.token;
    console.log('User logged in', userData.user.email);

    // 2. Fetch Products
    const products = await fetch('http://localhost:5000/api/products');
    const productsData = await products.json();
    const product = productsData[0];
    console.log('Fetched product:', product.name);

    // 3. Place Order
    const orderRes = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        orderItems: [{ product: product._id, name: product.name, qty: 1, price: product.price }],
        shippingAddress: { fullName: 'Test', address: '123 Test St', city: 'Test City', postalCode: '12345', phone: '1234567890' },
        totalPrice: product.price
      })
    });
    const orderData = await orderRes.json();
    if (orderRes.ok) {
      console.log('Order placed successfully. ID:', orderData._id);
    } else {
      console.error('Order placement failed:', orderData);
      return;
    }

    // 4. Login as Admin
    const loginAdmin = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@flowershope.com', password: 'admin123' })
    });
    const adminData = await loginAdmin.json();
    const adminToken = adminData.token;
    console.log('Admin logged in:', adminData.user.email);

    // 5. Fetch Orders as Admin using the Seller endpoint
    const ordersRes = await fetch('http://localhost:5000/api/seller/orders', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const ordersData = await ordersRes.json();
    if (!ordersRes.ok) {
      console.error('Failed to fetch orders:', ordersData);
      return;
    }
    const foundOrder = ordersData.find(o => o._id === orderData._id);
    console.log('Order visibility in Admin/Seller Dashboard endpoint:', !!foundOrder);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
};
run();
