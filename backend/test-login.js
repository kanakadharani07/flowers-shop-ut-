const axios = require('axios');

const testLogin = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@flowershope.com',
      password: 'admin123'
    });
    console.log('Login Success:', res.data.user.role);
  } catch (err) {
    if (err.response) {
      console.error('Login Failed Response:', err.response.data);
      console.error('Status:', err.response.status);
    } else {
      console.error('Login Failed:', err.message);
    }
  }
};

testLogin();
