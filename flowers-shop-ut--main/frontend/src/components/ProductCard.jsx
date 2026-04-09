import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { WishlistContext } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductDetailModal from './ProductDetailModal';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to manage wishlist');
      navigate('/login');
      return;
    }
    toggleWishlist(product);
  };

  const handleAddToCart = (eOrQty) => {
    let qty = 1;
    if (eOrQty && eOrQty.stopPropagation) {
      eOrQty.stopPropagation();
    } else if (typeof eOrQty === 'number') {
      qty = eOrQty;
    }

    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    addToCart(product, qty);
  };

  const handleBuyNow = (qty = 1) => {
    if (typeof qty !== 'number') qty = 1;
    
    if (!user) {
      toast.error('Please login to buy products');
      navigate('/login');
      return;
    }
    addToCart(product, qty);
    toast.success("Proceeding to checkout...");
    navigate('/checkout');
  };

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  const inWishlist = isInWishlist(product._id);

  return (
    <>
      <div 
        className="product-card relative group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden bg-white rounded-2xl border border-pink-50 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="product-image-container">
          <img src={product.image} alt={product.name} className="product-image transition-transform duration-700 group-hover:scale-110 object-cover w-full h-full" onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=500&q=80"}} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          
          <div className="product-badges absolute top-3 left-3 flex flex-col gap-2">
            <span className="badge-free-delivery">Free Delivery</span>
          </div>

          <button 
            className={`wishlist-btn ${inWishlist ? 'active' : ''}`} 
            onClick={handleWishlist}
            aria-label="Toggle Wishlist"
          >
            {inWishlist ? '♥' : '♡'}
          </button>
        </div>
        <div className="product-content">
          <div className="product-header">
            <h2 className="product-title">{product.name}</h2>
            <span className="product-category">{product.category}</span>
          </div>
          <p className="product-description">{product.description}</p>
          
          <div className="product-price-container">
            <span className="product-price">₹{product.price}</span>
          </div>
          
          <div className="product-actions">
            {isOutOfStock ? (
              <span className="stock-out">Out of Stock</span>
            ) : (
              <div className="stock-info">
                <span className="stock-count">Stock: {product.stock}</span>
                {isLowStock && <span className="stock-low">Only {product.stock} left!</span>}
              </div>
            )}

            {(!user || user.role === 'user') && (
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="add-to-cart-btn"
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ProductDetailModal 
          product={product} 
          onClose={() => setShowModal(false)} 
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}
    </>
  );
};

export default ProductCard;
