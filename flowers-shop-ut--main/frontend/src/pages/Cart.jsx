import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './Shop.css';

const Cart = () => {
  const { cart, updateQty, removeFromCart, getCartTotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="shop-page">
        <div className="empty-message">
          <h2 className="empty-title">Your Cart is Empty</h2>
          <p className="empty-text">Looks like you haven't added any beautiful flowers yet.</p>
          <Link to="/" className="btn-primary-link">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="shop-container">
        <h1 className="shop-header">Shopping Cart</h1>
        
        <div className="shop-layout">
          {/* Cart Items */}
          <div className="shop-main">
            <div className="shop-card">
              <ul className="item-list">
                {cart.map((item) => (
                  <li key={item.product} className="cart-item">
                    <img src={item.image} alt={item.name} className="item-image" />
                    <div className="item-details">
                      <h3 className="item-name">{item.name}</h3>
                      <p className="item-price">₹{item.price}</p>
                      <p className="item-stock">Available Stock: {item.stock}</p>
                    </div>
                    
                    <div className="item-qty-controls">
                      <button 
                        onClick={() => updateQty(item.product, item.qty - 1)}
                        className="btn-icon"
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                      </button>
                      <span className="item-qty">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.product, item.qty + 1)}
                        className="btn-icon"
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      </button>
                    </div>
                    
                    <div className="item-total">
                      <p className="item-total-price">₹{item.price * item.qty}</p>
                      <button 
                        onClick={() => removeFromCart(item.product)}
                        className="btn-remove"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="shop-sidebar">
            <div className="shop-card flex-col" style={{position: 'sticky', top: '6rem'}}>
              <div className="shop-card-content">
                <h2 className="shop-card-header">Order Summary</h2>
                <div className="summary-row">
                  <span>Subtotal ({cart.reduce((a,c) => a+c.qty, 0)} items)</span>
                  <span>₹{getCartTotal()}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery</span>
                  <span className="text-free">Free</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span className="text-total-price">₹{getCartTotal()}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="btn-primary-large"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
