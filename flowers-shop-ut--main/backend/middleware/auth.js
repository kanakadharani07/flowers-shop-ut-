const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, authorization denied' });
    }

    const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
    
    const verified = jwt.verify(tokenString, process.env.JWT_SECRET || 'fallback_secret');
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token verification failed, authorization denied' });
  }
};

module.exports = auth;
