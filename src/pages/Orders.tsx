import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { timeAgo } from '../utils/timeAgo';
import { useSearchParams } from 'react-router-dom';
import './Orders.css';

interface Order {
    id: string;
    product_id: string;
    product_title: string;
    product_price: number;
    buyer_name?: string;
    buyer_phone?: string;
    buyer_whatsapp?: string;
    status: 'pending' | 'completed' | 'cancelled';
    created_at: string;
    account_details?: {
        email?: string;
        password?: string;
        notes?: string;
    };
}

const Orders = () => {
    const { user, userRole } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'purchases' | 'sales' | 'all'>('purchases');
    const [searchParams] = useSearchParams();
    const paymentStatus = searchParams.get('payment');

    useEffect(() => {
        // Show payment status message
        if (paymentStatus) {
            if (paymentStatus === 'success') {
                alert('✅ Payment successful! Your order has been completed.');
            } else if (paymentStatus === 'failed') {
                alert('❌ Payment failed. Please try again or contact support.');
            } else if (paymentStatus === 'cancelled') {
                alert('⚠️ Payment was cancelled.');
            }
            // Remove the query parameter
            window.history.replaceState({}, '', '/orders');
        }
    }, [paymentStatus]);

    useEffect(() => {
        if (user) {
            setLoading(true);
            fetchOrders();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, activeTab]);

    const fetchOrders = async () => {
        try {
            if (activeTab === 'purchases') {
                // Fetch orders where user is the buyer
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('buyer_id', user?.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setOrders(data || []);
            } else if (activeTab === 'sales') {
                // Fetch orders where user is the seller (sales)
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('seller_id', user?.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setOrders(data || []);
            } else if (activeTab === 'all') {
                // Admin can see all orders
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setOrders(data || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'completed':
                return 'status-completed';
            case 'pending':
                return 'status-pending';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return '';
        }
    };



    if (loading) {
        return (
            <div className="orders-page">
                <div className="container">
                    <p>Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="container">
                <div className="orders-header">
                    <h1>
                        {activeTab === 'purchases' && '🛒 My Orders'}
                        {activeTab === 'sales' && '💰 My Sales'}
                        {activeTab === 'all' && '📊 All Orders'}
                    </h1>
                    <p>
                        {activeTab === 'purchases' && 'Track your account purchases'}
                        {activeTab === 'sales' && 'Manage orders from buyers'}
                        {activeTab === 'all' && 'View and manage all platform orders'}
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="orders-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
                        onClick={() => setActiveTab('purchases')}
                    >
                        🛒 My Purchases
                    </button>
                    {(userRole === 'seller' || userRole === 'admin') && (
                        <button
                            className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
                            onClick={() => setActiveTab('sales')}
                        >
                            💰 My Sales
                        </button>
                    )}
                    {userRole === 'admin' && (
                        <button
                            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            📊 All Orders
                        </button>
                    )}
                </div>

                {orders.length === 0 ? (
                    <div className="no-orders">
                        <div className="no-orders-icon">📦</div>
                        <h3>
                            {activeTab === 'purchases' && 'No orders yet'}
                            {activeTab === 'sales' && 'No sales yet'}
                            {activeTab === 'all' && 'No orders in the system'}
                        </h3>
                        <p>
                            {activeTab === 'purchases' && 'Start shopping to see your orders here'}
                            {activeTab === 'sales' && 'Your sold products will appear here'}
                            {activeTab === 'all' && 'All platform orders will appear here'}
                        </p>
                        {activeTab === 'purchases' && (
                            <a href="/shop" className="btn btn-primary">Browse Accounts</a>
                        )}
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div className="order-id">
                                        <span className="order-label">Order ID:</span>
                                        <span className="order-value">#{order.id.slice(0, 8)}</span>
                                    </div>
                                    <span className={`order-status ${getStatusClass(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>

                                <div className="order-body">
                                    <div className="order-product">
                                        <h3>{order.product_title}</h3>
                                        <p className="order-date">{timeAgo(order.created_at)}</p>
                                    </div>

                                    <div className="order-details">
                                        <div className="order-info">
                                            <span className="info-label">Price</span>
                                            <span className="info-value">৳{order.product_price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Show account details for completed purchases */}
                                {activeTab === 'purchases' && order.status === 'completed' && order.account_details && (
                                    <div className="account-details">
                                        <h4>🎮 Account Details</h4>
                                        <div className="account-info-grid">
                                            <div className="account-info-item">
                                                <span className="account-label">Email/ID:</span>
                                                <span className="account-value">{order.account_details.email || 'N/A'}</span>
                                            </div>
                                            <div className="account-info-item">
                                                <span className="account-label">Password:</span>
                                                <span className="account-value">{order.account_details.password || 'N/A'}</span>
                                            </div>
                                            {order.account_details.notes && (
                                                <div className="account-info-item full-width">
                                                    <span className="account-label">Notes:</span>
                                                    <span className="account-value">{order.account_details.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Show buyer details for sellers */}
                                {activeTab === 'sales' && order.buyer_name && (
                                    <div className="buyer-details">
                                        <h4>👤 Buyer Information</h4>
                                        <div className="buyer-info-grid">
                                            <div className="buyer-info-item">
                                                <span className="buyer-label">Name:</span>
                                                <span className="buyer-value">{order.buyer_name}</span>
                                            </div>
                                            <div className="buyer-info-item">
                                                <span className="buyer-label">Phone:</span>
                                                <span className="buyer-value">
                                                    <a href={`tel:${order.buyer_phone}`}>{order.buyer_phone}</a>
                                                </span>
                                            </div>
                                            <div className="buyer-info-item">
                                                <span className="buyer-label">WhatsApp:</span>
                                                <span className="buyer-value">
                                                    <a href={`https://wa.me/${order.buyer_whatsapp?.replace(/^0/, '880')}`} target="_blank" rel="noopener noreferrer">
                                                        {order.buyer_whatsapp}
                                                    </a>
                                                </span>
                                            </div>
                                        </div>
                                        {order.status === 'completed' && (
                                            <div className="seller-note">
                                                <p>💡 <strong>Tip:</strong> Contact the buyer to deliver the account details</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
