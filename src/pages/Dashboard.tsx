import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { getStorageUrl } from '../lib/storage';
import { timeAgo } from '../utils/timeAgo';
import './Dashboard.css';

interface SellerProduct {
    id: string;
    title: string;
    level: number;
    diamonds: number;
    skins: number;
    price: number;
    status: 'pending' | 'approved' | 'rejected' | 'sold';
    created_at: string;
    image: string;
    images?: string[];
}

const Dashboard = () => {
    const { user, userRole } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<SellerProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        sold: 0,
        totalEarnings: 0
    });

    useEffect(() => {
        // Redirect if not logged in
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (user) {
            fetchProducts();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('seller_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const productsData = data || [];
            setProducts(productsData);

            // Calculate stats
            const total = productsData.length;
            const pending = productsData.filter(p => p.status === 'pending').length;
            const approved = productsData.filter(p => p.status === 'active' || p.status === 'approved').length;
            const sold = productsData.filter(p => p.status === 'sold').length;
            
            // Calculate total earnings from sold products
            const totalEarnings = productsData
                .filter(p => p.status === 'sold')
                .reduce((sum, p) => sum + (p.price || 0), 0);

            setStats({ total, pending, approved, sold, totalEarnings });
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) {
                alert('Error deleting product');
            } else {
                fetchProducts();
            }
        }
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="container">
                    <div className="loading-spinner">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>Welcome Seller</h1>
                        <p className="dashboard-subtitle">Here's what's happening with your listings today.</p>
                    </div>
                    <Link to="/sell" className="btn btn-primary btn-add-new">
                        <span className="plus-icon">+</span> List New Account
                    </Link>
                </div>

                <div className="dashboard-stats-grid">
                    <div className="stat-card stat-blue">
                        <div className="stat-top">
                            <div className="stat-icon">📦</div>
                            <div className="stat-change positive">+{stats.total > 0 ? '12' : '0'}%</div>
                        </div>
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Listings</div>
                        <div className="stat-bar stat-bar-blue"></div>
                    </div>
                    <div className="stat-card stat-orange">
                        <div className="stat-top">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-change positive">+{stats.pending > 0 ? '8' : '0'}%</div>
                        </div>
                        <div className="stat-value">{stats.pending}</div>
                        <div className="stat-label">Pending Review</div>
                        <div className="stat-bar stat-bar-orange"></div>
                    </div>
                    <div className="stat-card stat-green">
                        <div className="stat-top">
                            <div className="stat-icon">✅</div>
                            <div className="stat-change positive">+{stats.approved > 0 ? '15' : '0'}%</div>
                        </div>
                        <div className="stat-value">{stats.approved}</div>
                        <div className="stat-label">Active Listings</div>
                        <div className="stat-bar stat-bar-green"></div>
                    </div>
                    <div className="stat-card stat-purple">
                        <div className="stat-top">
                            <div className="stat-icon">💰</div>
                            <div className="stat-change positive">+{stats.totalEarnings > 0 ? '20' : '0'}%</div>
                        </div>
                        <div className="stat-value">৳{stats.totalEarnings.toLocaleString()}</div>
                        <div className="stat-label">Total Earnings</div>
                        <div className="stat-bar stat-bar-purple"></div>
                    </div>
                </div>

                <div className="dashboard-content">
                    <div className="section-header">
                        <h2>My Products</h2>
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search by Account #, Title, Price, or Status..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            {searchQuery && (
                                <button 
                                    className="search-clear"
                                    onClick={() => setSearchQuery('')}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {products.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📝</div>
                            <h3>No products listed yet</h3>
                            <p>Start selling your Free Fire accounts today!</p>
                            <Link to="/sell" className="btn btn-primary">List Your First Product</Link>
                        </div>
                    ) : (
                        <div className="products-grid-view">
                            {products
                                .filter(product => {
                                    if (!searchQuery.trim()) return true;
                                    const query = searchQuery.toLowerCase();
                                    const accountId = product.id.slice(0, 8).toLowerCase();
                                    const title = product.title.toLowerCase();
                                    const price = product.price.toString();
                                    const status = product.status.toLowerCase();
                                    
                                    return accountId.includes(query) || 
                                           title.includes(query) || 
                                           price.includes(query) ||
                                           status.includes(query);
                                })
                                .map(product => (
                                <div key={product.id} className="dashboard-product-card">
                                    <div className="product-card-image">
                                        <img
                                            src={getStorageUrl(product.images && product.images.length > 0 ? product.images[0] : product.image)}
                                            alt={product.title}
                                        />
                                        <span className={`status-badge ${product.status}`}>
                                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="product-card-body">
                                        <h3>Account #{product.id.slice(0, 8)}</h3>
                                        <div className="product-card-price">
                                            ৳{product.price.toLocaleString()}
                                        </div>
                                        <div className="product-card-date">
                                            {timeAgo(product.created_at)}
                                        </div>
                                        <div className="product-card-actions">
                                            <Link 
                                                to={`/edit-product/${product.id}`} 
                                                className="btn-action edit"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                className="btn-action delete"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

