import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };

  const from = location.state?.from || '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const action =
      mode === 'login'
        ? signInWithEmail(email, password)
        : signUpWithEmail(email, password);

    const { error } = await action;
    setLoading(false);

    if (error) {
      setError(error);
      return;
    }

    navigate(from, { replace: true });
  };

  const handleGoogle = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          <h1 className="auth-title">
            {mode === 'login' ? 'Welcome back, gamer 👋' : 'Join FF ZAHID GAMER'}
          </h1>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Login to manage your profile, orders and sell premium Free Fire accounts.'
              : 'Sign up in seconds and start buying & selling verified Free Fire accounts.'}
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                className="auth-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                className="auth-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 4 }}
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Login'
                  : 'Sign Up'}
            </button>
          </form>

          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span>or continue with</span>
            <span className="auth-divider-line" />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onClick={handleGoogle}
          >
            <span>Google</span>
          </button>

          <p className="auth-meta">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => setMode('signup')}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => setMode('login')}
                >
                  Login
                </button>
              </>
            )}
          </p>

          <p className="auth-footer-note">
            By continuing, you agree to our{' '}
            <Link to="/" style={{ color: 'var(--primary-green)', fontWeight: 500 }}>
              terms &amp; privacy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


