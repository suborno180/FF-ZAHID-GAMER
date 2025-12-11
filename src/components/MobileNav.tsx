import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, ShoppingCart, Package, LogIn, Shield, BarChart3 } from 'lucide-react';
import './MobileNav.css';

const MobileNav = () => {
    const { user, userRole } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Mobile Header with Logo */}
            <div className="mobile-header">
                <Link to="/" className="mobile-logo">
                    <div className="mobile-logo-icon-wrapper">
                        <img src="/logo.png" alt="FF ZAHID GAMER" className="logo-icon" />
                    </div>
                    <div className="logo-text">
                        <span className="logo-brand-name">FF ZAHID GAMER</span>
                    </div>
                </Link>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="mobile-bottom-nav">
                <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}>
                    <Home className="mobile-nav-icon" size={24} />
                    <span className="mobile-nav-label">Home</span>
                </Link>
                <Link to="/shop" className={`mobile-nav-item ${isActive('/shop') ? 'active' : ''}`}>
                    <ShoppingCart className="mobile-nav-icon" size={24} />
                    <span className="mobile-nav-label">Shop</span>
                </Link>
                {user && (
                    <Link to="/orders" className={`mobile-nav-item ${isActive('/orders') ? 'active' : ''}`}>
                        <Package className="mobile-nav-icon" size={24} />
                        <span className="mobile-nav-label">Orders</span>
                    </Link>
                )}
                {user && (userRole === 'seller' || userRole === 'admin') && (
                    <Link to="/dashboard" className={`mobile-nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                        <BarChart3 className="mobile-nav-icon" size={24} />
                        <span className="mobile-nav-label">Dashboard</span>
                    </Link>
                )}
                {user && userRole === 'admin' && (
                    <Link to="/admin" className={`mobile-nav-item ${isActive('/admin') ? 'active' : ''}`}>
                        <Shield className="mobile-nav-icon" size={24} />
                        <span className="mobile-nav-label">Admin</span>
                    </Link>
                )}
                <Link
                    to={user ? "/profile" : "/login"}
                    className={`mobile-nav-item ${isActive('/profile') || isActive('/login') ? 'active' : ''}`}
                >
                    {user ? (
                        user.user_metadata?.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="Profile"
                                className="mobile-nav-avatar-img"
                            />
                        ) : (
                            <div className="mobile-nav-avatar-initial">
                                {(user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                            </div>
                        )
                    ) : (
                        <LogIn className="mobile-nav-icon" size={24} />
                    )}
                    <span className="mobile-nav-label">{user ? 'Profile' : 'Login'}</span>
                </Link>
            </div>
        </>
    );
};

export default MobileNav;
