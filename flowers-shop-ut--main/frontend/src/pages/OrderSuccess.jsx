import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import './Shop.css';

const OrderSuccess = () => {
    const location = useLocation();
    const orderData = location.state?.orderData;

    if (!orderData) {
        return <Navigate to="/" />;
    }

    return (
        <div className="shop-page">
            <div className="shop-container" style={{ maxWidth: '40rem', textAlign: 'center' }}>
                <div className="shop-card" style={{ padding: '3rem 2rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            backgroundColor: '#f0fdf4', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            border: '2px solid #22c55e'
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>
                            YOUR ORDER IS SUCCESSFULLY PLACED!
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
                            Thank you for shopping with Flowers Hope.
                        </p>
                    </div>

                    <div style={{ textAlign: 'left', backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '2rem', border: '1px solid #e5e7eb' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                            Shipping Details
                        </h2>
                        <div style={{ display: 'grid', gap: '0.5rem', color: '#374151' }}>
                            <p><strong>Name:</strong> {orderData.shippingAddress.fullName}</p>
                            <p><strong>Address:</strong> {orderData.shippingAddress.address}</p>
                            <p><strong>City:</strong> {orderData.shippingAddress.city} - {orderData.shippingAddress.postalCode}</p>
                            <p><strong>Phone:</strong> {orderData.shippingAddress.phone}</p>
                            <p><strong>Payment Method:</strong> {orderData.paymentMethod}</p>
                            <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}><strong>Total Amount:</strong> <span style={{ color: '#db2777', fontWeight: 700 }}>₹{orderData.totalPrice}</span></p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/orders" className="nav-link-primary" style={{ padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
                            View My Orders
                        </Link>
                        <Link to="/" style={{ padding: '0.75rem 1.5rem', color: '#4b5563', textDecoration: 'none', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}>
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
