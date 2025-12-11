import { useNavigate } from 'react-router-dom';
import './PaymentCancel.css';

const PaymentCancel = () => {
    const navigate = useNavigate();

    return (
        <div className="payment-result payment-cancel">
            <div className="container">
                <div className="result-card">
                    <div className="cancel-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>

                    <h1>Payment Cancelled</h1>
                    <p className="cancel-message">
                        Your payment was cancelled. No charges have been made to your account.
                    </p>

                    <div className="cancel-info">
                        <h3>Why was my payment cancelled?</h3>
                        <ul>
                            <li>You clicked the "Cancel" or "Back" button</li>
                            <li>The payment window was closed</li>
                            <li>The session timed out</li>
                        </ul>
                    </div>

                    <div className="help-section">
                        <h3>Need Help?</h3>
                        <p>
                            If you're experiencing issues with payment, please contact our support team.
                            We're here to help you complete your purchase.
                        </p>
                    </div>

                    <div className="action-buttons">
                        <button
                            onClick={() => navigate(-1)}
                            className="btn btn-primary"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/shop')}
                            className="btn btn-secondary"
                        >
                            Back to Shop
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancel;
