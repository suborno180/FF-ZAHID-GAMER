import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, ShoppingCart, Package, Shield, LogOut, LogIn } from 'lucide-react';
import MobileNav from './MobileNav';
import './Navbar.css';

const Navbar = () => {
    const { user, signOut, userRole } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            <nav className="navbar" id="main-navbar">
                {/* Desktop Navigation */}
                <div className="container navbar-container" id="desktop-nav">
                    <Link to="/" className="navbar-logo">
                        <div className="logo-icon-wrapper">
                            <img src="/logo.png" alt="FF ZAHID GAMER" className="logo-icon" />
                        </div>
                        <div className="logo-text">
                            <span className="logo-brand-name">FF ZAHID GAMER</span>
                        </div>
                    </Link>

                    <div className="desktop-menu">
                        <Link to="/" className={`nav-btn ${isActive('/') ? 'active' : ''}`}>
                            <Home className="nav-icon" size={18} />
                            <span>Home</span>
                        </Link>
                        <Link to="/shop" className={`nav-btn ${isActive('/shop') ? 'active' : ''}`}>
                            <ShoppingCart className="nav-icon" size={18} />
                            <span>Shop</span>
                        </Link>

                        {user ? (
                            <>
                                <Link to="/orders" className={`nav-btn ${isActive('/orders') ? 'active' : ''}`}>
                                    <Package className="nav-icon" size={18} />
                                    <span>Orders</span>
                                </Link>
                                {(userRole === 'seller' || userRole === 'admin') && (
                                    <Link to="/dashboard" className={`nav-btn ${isActive('/dashboard') ? 'active' : ''}`}>
                                        <Package className="nav-icon" size={18} />
                                        <span>Dashboard</span>
                                    </Link>
                                )}
                                {userRole === 'admin' && (
                                    <Link to="/admin" className={`nav-btn ${isActive('/admin') ? 'active' : ''}`}>
                                        <Shield className="nav-icon" size={18} />
                                        <span>Admin</span>
                                    </Link>
                                )}
                                <Link to="/profile" className={`nav-btn profile-nav-btn ${isActive('/profile') ? 'active' : ''}`}>
                                    {user.user_metadata?.avatar_url ? (
                                        <img
                                            src={user.user_metadata.avatar_url}
                                            alt="Profile"
                                            className="nav-avatar-img"
                                        />
                                    ) : (
                                        <div className="nav-avatar-initial">
                                            {(user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                        </div>
                                    )}
                                    <span>Profile</span>
                                </Link>
                                <button
                                    className="nav-btn logout-btn"
                                    onClick={() => signOut()}
                                >
                                    <LogOut className="nav-icon" size={18} />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="nav-btn login-btn">
                                <LogIn className="nav-icon" size={18} />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation Component */}
            <MobileNav />
        </>
    );
};

export default Navbar;