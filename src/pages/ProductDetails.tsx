import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../data/products';
import type { Product } from '../data/products';
import { getStorageUrl } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [paying, setPaying] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [accountInfoMessage, setAccountInfoMessage] = useState('');

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                if (id) {
                    const data = await fetchProductById(id);
                    setProduct(data);
                    if (data) {
                        setSelectedImage(data.image);
                    }
                }
            } catch (err) {
                console.error('Error loading product:', err);
                setError('Failed to load product details.');
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
        fetchAccountInfoMessage();
    }, [id]);

    const fetchAccountInfoMessage = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'account_info_message')
                .maybeSingle();

            if (error) throw error;
            if (data) {
                setAccountInfoMessage(data.value);
            } else {
                setAccountInfoMessage('✅ Verified and secure account\n✅ Instant delivery\n✅ Full account access provided\n✅ 24/7 customer support');
            }
        } catch (error: any) {
            console.error('Error fetching account message:', error);
            setAccountInfoMessage('✅ Verified and secure account\n✅ Instant delivery\n✅ Full account access provided\n✅ 24/7 customer support');
        }
    };


    const handlePayNow = async () => {
        if (!user) {
            alert('Please login to buy this product.');
            navigate('/login');
            return;
        }

        if (!product) return;

        // Check if user has completed their profile
        try {
            const { data: userDetails, error } = await supabase
                .from('user_details')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error || !userDetails || !userDetails.full_name || !userDetails.phone) {
                // Profile incomplete - prompt user
                const shouldComplete = window.confirm(
                    '📋 Complete Your Profile to Continue\n\n' +
                    'To process your order, we need:\n' +
                    '• Your full name\n' +
                    '• Your phone number\n\n' +
                    'This helps the seller contact you to deliver the account.\n\n' +
                    'Click OK to complete your profile now.'
                );

                if (shouldComplete) {
                    navigate('/profile');
                }
                return;
            }
        } catch (err) {
            console.error('Error checking user details:', err);
            alert('Please complete your profile before making a purchase.');
            navigate('/profile');
            return;
        }

        setPaying(true);

        try {
            // Get user details
            const { data: userDetails } = await supabase
                .from('user_details')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            const customerName = userDetails?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer';
            const customerEmail = user.email || '';
            const customerPhone = userDetails?.phone || user.user_metadata?.phone || '01700000000';

            // Call backend API to initiate ZiniPay payment
            const backendUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000';

            const response = await fetch(`${backendUrl}/api/payment/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: product.id,
                    amount: product.price,
                    customer_email: customerEmail,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    user_id: user.id
                })
            });

            if (!response.ok) {
                // Try to parse error as JSON, fallback to text
                let errorMessage = 'Failed to initiate payment';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to initiate payment');
            }

            // Redirect to ZiniPay payment page
            if (data.payment_url) {
                window.location.href = data.payment_url;
            } else {
                throw new Error('No payment URL received');
            }

        } catch (error: any) {
            console.error('❌ Payment error:', error);

            // Provide helpful error messages
            let userMessage = error.message;

            if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
                userMessage = '⚠️ Payment Server Not Running\n\n' +
                    'The payment backend server is not accessible.\n\n' +
                    'To fix this:\n' +
                    '1. Open a new terminal\n' +
                    '2. Navigate to: free-fire-market/server\n' +
                    '3. Run: npm start\n\n' +
                    'Then try your payment again.';
            }

            alert(`Failed to process payment: ${userMessage}`);
            setPaying(false);
        }
    };



    if (loading) {
        return (
            <div className="product-details">
                <div className="container" style={{ padding: '4rem 20px', textAlign: 'center' }}>
                    <h2>Loading product details...</h2>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-details">
                <div className="container" style={{ padding: '4rem 20px', textAlign: 'center' }}>
                    <h2>{error || 'Product not found'}</h2>
                    <p style={{ marginTop: '1rem', color: '#6b7280' }}>
                        {error ? 'Please try again later.' : 'This product may have been removed or is no longer available.'}
                    </p>
                    <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                        Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    const mainImage = selectedImage || (product.images && product.images.length > 0 ? product.images[0] : product.image);

    return (
        <div className="product-details">
            <div className="container">
                <Link to="/shop" className="back-link">← Back to Shop</Link>

                <div className="details-grid">
                    <div className="details-image-container">
                        <div className="details-main-image" onClick={() => setIsZoomed(true)}>
                            <img src={getStorageUrl(mainImage)} alt={product.title} />
                            {product.featured && <span className="featured-badge">Featured</span>}
                            <div className="zoom-hint">🔍 Click to zoom</div>
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="details-thumbnails">
                                {product.images.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        <img src={getStorageUrl(img)} alt={`${product.title} ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="details-content">
                        <div className="product-account-number">
                            <span className="account-label">Account #</span>
                            <span className="account-number">{product.id.slice(0, 8).toUpperCase()}</span>
                        </div>

                        <h1 className="details-title">{product.title}</h1>

                        <div className="details-price">৳{product.price.toLocaleString()}</div>

                        <div className="details-description">
                            <h3>Description</h3>
                            <p>{product.description}</p>
                        </div>

                        <div className="details-actions">
                            <button
                                className="btn btn-success btn-large"
                                onClick={handlePayNow}
                                disabled={paying}
                            >
                                {paying ? '⏳ Processing payment...' : `💳 Pay Now - ৳${product.price.toLocaleString()}`}
                            </button>
                        </div>


                        <div className="details-info">
                            <h3>Account Information</h3>
                            <ul>
                                {accountInfoMessage.split('\n').map((line, index) => (
                                    line.trim() && <li key={index}>{line}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Zoom Modal */}
            {isZoomed && (
                <div className="zoom-modal" onClick={() => setIsZoomed(false)}>
                    <div className="zoom-modal-content">
                        <button className="zoom-close" onClick={() => setIsZoomed(false)}>
                            ✕
                        </button>
                        <img src={getStorageUrl(mainImage)} alt={product.title} onClick={(e) => e.stopPropagation()} />
                    </div>
                </div>
            )}

            {/* Sticky bottom buy bar for mobile */}
            <div className="product-bottom-bar">
                <div className="product-bottom-info">
                    <span className="product-bottom-label">Price</span>
                    <span className="product-bottom-price">৳{product.price.toLocaleString()}</span>
                </div>
                <button
                    className="btn btn-success product-bottom-buy"
                    onClick={handlePayNow}
                    disabled={paying}
                >
                    {paying ? '⏳ Processing...' : '💳 Pay Now'}
                </button>
            </div>
        </div>
    );
};

export default ProductDetails;
