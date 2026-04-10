import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const categories = ['Bouquets', 'Arrangements', 'Pots', 'Gifts', 'Specials'];

  useEffect(() => {
    fetchProducts();
  }, [filter, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = '?';
      if (filter) query += `category=${filter}&`;
      if (search) query += `search=${search}`;
      
      const res = await api.get(`/products${query}`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="bg-hero min-h-[40vh] md:min-h-[50vh] rounded-3xl mb-12 flex flex-col items-center justify-center text-center p-8 shadow-lg transition-transform hover:scale-[1.01] duration-700 overflow-hidden relative">
          <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>
          <div className="relative z-10 space-y-6">
            <h1 className="text-5xl md:text-7xl text-gray-900 font-serif font-bold mb-4 drop-shadow-xl tracking-tight">Flowers Hope</h1>
            <p className="text-lg md:text-2xl text-gray-800 max-w-2xl font-medium tracking-wide drop-shadow-md bg-white/40 px-6 py-2 rounded-full inline-block">
              Bringing joy and hope through every petal.
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="home-controls sticky top-[72px] z-40 bg-white/90 backdrop-blur-md py-4 border-b border-pink-100 shadow-sm mb-10 transition-all rounded-2xl px-6">
          <div className="filters-container">
            <button 
              onClick={() => setFilter('')} 
              className={`filter-btn ${filter === '' ? 'active' : ''}`}
            >
              All Flowers
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)} 
                className={`filter-btn ${filter === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search flowers..." 
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading beautiful flowers...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No flowers found matching your criteria.</p>
            <button onClick={() => { setFilter(''); setSearch(''); }} className="btn-link">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
