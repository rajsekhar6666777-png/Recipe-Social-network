import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaImage } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return toast.error('Please fill in all required fields.');
    }

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters long.');
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('bio', bio);
    if (avatarFile) {
      formData.append('profile_image', avatarFile);
    }

    setLoading(true);
    try {
      const res = await register(formData);
      if (res && res.success) {
        toast.success(`Account created! Welcome, ${res.user.name}!`);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-card" style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Join RecipeSocial</h2>
          <p style={styles.subtitle}>Create your chef profile & share your culinary creations</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Avatar Upload */}
          <div style={styles.avatarSection}>
            <div style={styles.avatarPreviewBox}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" style={styles.avatarImg} />
              ) : (
                <FaUser style={{ fontSize: '2rem', color: 'var(--text-muted)' }} />
              )}
            </div>
            <label htmlFor="avatar-upload" className="btn btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
              <FaImage /> Upload Avatar
            </label>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div style={styles.inputWrapper}>
              <FaUser style={styles.fieldIcon} />
              <input
                type="text"
                className="form-input"
                placeholder="Chef Gordon"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
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
            <label className="form-label">Password *</label>
            <div style={styles.inputWrapper}>
              <FaLock style={styles.fieldIcon} />
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Chef Bio</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="Tell the community about your favorite cuisines, cooking experience, or signature dish..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '1rem' }}
          >
            <FaUserPlus /> {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>
            Log In
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
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    padding: '2.25rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
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
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  avatarPreviewBox: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    border: '2px dashed var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: 'var(--bg-input)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
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
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
};

export default Register;
