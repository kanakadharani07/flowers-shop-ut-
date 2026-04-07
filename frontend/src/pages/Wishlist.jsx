import React, { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import './Shop.css';

const Wishlist = () => {
  const { wishlist } = useContext(WishlistContext);

  return (
    <div className="shop-container">
      <h1 className="shop-header">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="empty-message">
          <p>Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="product-grid">
          {wishlist.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
