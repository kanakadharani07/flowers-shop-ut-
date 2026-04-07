import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import api from '../services/api';
import './Shop.css';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash On Delivery (COD)');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().addresses) {
        setAddresses(docSnap.data().addresses);
      }
    } catch (err) {
      console.error("Error fetching addresses", err);
    }
  };

  const saveAddressesToFirestore = async (newAddresses) => {
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { addresses: newAddresses }, { merge: true });
      setAddresses(newAddresses);
    } catch (err) {
      toast.error("Failed to save address");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    let newAddresses = [...addresses];
    if (editingIndex !== null) {
      newAddresses[editingIndex] = formData;
    } else {
      newAddresses.push(formData);
    }
    await saveAddressesToFirestore(newAddresses);
    setIsEditing(false);
    setEditingIndex(null);
    setFormData({ fullName: user?.name || '', address: '', city: '', postalCode: '', phone: '' });
  };

  const handleEditAddress = (index) => {
    setFormData(addresses[index]);
    setEditingIndex(index);
    setIsEditing(true);
  };

  const handleDeleteAddress = async (index) => {
    let newAddresses = addresses.filter((_, i) => i !== index);
    await saveAddressesToFirestore(newAddresses);
    if (selectedAddressIndex === index) {
      setSelectedAddressIndex(0);
    }
  };

  const handlePlaceOrder = async () => {
    if (addresses.length === 0 || selectedAddressIndex >= addresses.length) {
      toast.error('Please add and select a shipping address.');
      return;
    }
    setLoading(true);

    try {
      const orderData = {
        orderItems: cart,
        shippingAddress: addresses[selectedAddressIndex],
        paymentMethod,
        totalPrice: getCartTotal(),
      };
      
      await api.post('/orders', orderData);
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders', { state: { message: 'Order placed successfully!' } });
    } catch (err) {
      toast.error('Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shop-page">
      <div className="shop-container" style={{ maxWidth: '64rem' }}>
        <h1 className="shop-header">Checkout</h1>

        <div className="shop-layout">
          <div className="shop-main">
            <div className="shop-card">
              <div className="shop-card-content">
                <h2 className="shop-card-header">Shipping Address</h2>
                
                {addresses.length > 0 && !isEditing ? (
                  <div className="address-list">
                    {addresses.map((addr, index) => (
                      <div key={index} className={`address-item ${selectedAddressIndex === index ? 'selected' : ''}`} style={{ border: '1px solid #e5e7eb', padding: '1rem', marginBottom: '1rem', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={() => setSelectedAddressIndex(index)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <strong>{addr.fullName}</strong>
                            <p>{addr.address}, {addr.city} {addr.postalCode}</p>
                            <p>Phone: {addr.phone}</p>
                          </div>
                          <div>
                            <button onClick={(e) => { e.stopPropagation(); handleEditAddress(index); }} style={{ marginRight: '10px', color: '#3b82f6' }}>Edit</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(index); }} style={{ color: '#ef4444' }}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ marginTop: '1rem', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: '#fff' }}>+ Add New Address</button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveAddress} id="address-form">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <input required type="text" name="address" value={formData.address} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input required type="text" name="city" value={formData.city} onChange={handleChange} className="form-input" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Postal Code</label>
                        <input required type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="form-input" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input required type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-input" />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', backgroundColor: '#ec4899', color: '#fff', borderRadius: '0.375rem' }}>Save Address</button>
                      {addresses.length > 0 && <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: '#fff' }}>Cancel</button>}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="shop-sidebar">
            <div className="shop-card" style={{position: 'sticky', top: '6rem'}}>
              <div className="shop-card-content">
                <h2 className="shop-card-header">Order Summary</h2>
                <div style={{ marginBottom: '1.5rem' }}>
                  {cart.map((item) => (
                    <div key={item.product} className="summary-item">
                      <div className="summary-item-left">
                        <img src={item.image} alt={item.name} className="summary-item-image" />
                        <div className="summary-item-details">
                          <p className="summary-item-name">{item.name}</p>
                          <p className="summary-item-qty">Qty: {item.qty}</p>
                        </div>
                      </div>
                      <p className="summary-item-price">₹{item.price * item.qty}</p>
                    </div>
                  ))}
                </div>
                
                <div style={{ marginBottom: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Payment Method</h3>
                  <select 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                    className="form-input"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', backgroundColor: '#fff' }}
                  >
                    <option value="Cash On Delivery (COD)">Cash On Delivery (COD)</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>

                <div>
                  <div className="summary-row total">
                    <span>Total to Pay</span>
                    <span className="text-total-price">₹{getCartTotal()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={loading || isEditing || addresses.length === 0}
                    className="btn-primary-large"
                    style={{ textTransform: 'uppercase', opacity: (loading || isEditing || addresses.length === 0) ? 0.5 : 1 }}
                  >
                    {loading ? 'PROCESSING...' : `PLACE ORDER (${paymentMethod})`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
