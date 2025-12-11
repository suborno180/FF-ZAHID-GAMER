import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // Add this line to use the navigate function
  
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // In a real app, you would validate the transaction with your backend
        // For now, we'll just show a success message
        setTimeout(() => {
          setOrderDetails({
            id: 'ORD-' + Date.now(),
            amount: searchParams.get('amount'),
            currency: searchParams.get('currency'),
            status: 'completed',
            date: new Date().toLocaleDateString()
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="payment-result">
        <div className="container">
          <div className="result-card">
            <div className="loading-spinner">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result payment-success">
      <div className="container">
        <div className="result-card">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <h1>Payment Successful! 🎉</h1>
          <p className="success-message">
            Your payment has been processed successfully.
          </p>

          {orderDetails && (
            <div className="order-summary">
              <h3>Order Details</h3>
              <div className="order-info">
                <div className="info-row">
                  <span className="label">Order ID:</span>
                  <span className="value">#{orderDetails.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="info-row">
                  <span className="label">Product:</span>
                  <span className="value">{orderDetails.products?.title || 'Product'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Amount Paid:</span>
                  <span className="value">৳{orderDetails.amount?.toLocaleString()}</span>
                </div>
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span className="value status-badge">
                    {orderDetails.status === 'completed' ? '✅ Completed' : '⏳ Processing'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>✅ Check your email for order confirmation</li>
              <li>✅ The seller will contact you shortly</li>
              <li>✅ View your order status in "My Orders"</li>
            </ul>
          </div>

          <div className="action-buttons">
            <button
              onClick={() => navigate('/orders')}
              className="btn btn-primary"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="btn btn-secondary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;