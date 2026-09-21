import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUtensils, FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please enter email and password.');
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res && res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <FaUtensils style={{ fontSize: '1.5rem', color: '#fff' }} />
          </div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your RecipeSocial account</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={styles.inputWrapper}>
              <FaEnvelope style={styles.fieldIcon} />
              <input
                type="email"
                className="form-input"
                placeholder="chef@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={styles.inputWrapper}>
              <FaLock style={styles.fieldIcon} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '1rem' }}
          >
            <FaSignInAlt /> {loading ? 'Signing In...' : 'Log In'}
          </button>
        </form>

        {/* Demo Login Credentials Helper */}
        <div style={styles.demoBox}>
          <p style={{ fontWeight: '700', fontSize: '0.825rem', marginBottom: '0.35rem' }}>⚡ Quick Demo Accounts:</p>
          <div style={styles.demoAccount} onClick={() => { setEmail('gordon@example.com'); setPassword('Password123'); }}>
            <code>gordon@example.com</code> / <code>Password123</code> (Chef Gordon)
          </div>
          <div style={styles.demoAccount} onClick={() => { setEmail('maria@example.com'); setPassword('Password123'); }}>
            <code>maria@example.com</code> / <code>Password123</code> (Maria R.)
          </div>
        </div>

        <div style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '700' }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    minHeight: '75vh',
  },
  card: {
    maxWidth: '440px',
    width: '100%',
    padding: '2.25rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.75rem',
  },
  iconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  title: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '1.8rem',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputWrapper: {
    position: 'relative',
  },
  fieldIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  demoBox: {
    marginTop: '1.5rem',
    padding: '0.85rem',
    background: 'var(--bg-input)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  demoAccount: {
    cursor: 'pointer',
    padding: '0.2rem 0',
    textDecoration: 'underline',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
};

export default Login;
