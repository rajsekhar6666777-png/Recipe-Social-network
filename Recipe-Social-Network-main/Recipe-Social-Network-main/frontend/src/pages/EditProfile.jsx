import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaImage, FaCheck, FaLock, FaGlobe, FaInstagram, FaMapMarkerAlt, FaUtensilSpoon } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [country, setCountry] = useState(user?.country || 'United States');
  const [website, setWebsite] = useState(user?.website || '');
  const [instagram, setInstagram] = useState(user?.instagram || '');
  const [favCuisine, setFavCuisine] = useState(user?.fav_cuisine || 'Italian');

  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const getProfileImage = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80';
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img}`;
  };

  const getCoverImage = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80';
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img}`;
  };

  const [avatarPreview, setAvatarPreview] = useState(getProfileImage(user?.profile_image));
  const [coverPreview, setCoverPreview] = useState(getCoverImage(user?.cover_image));
  const [loading, setLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty.');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('bio', bio);
    formData.append('country', country);
    formData.append('website', website);
    formData.append('instagram', instagram);
    formData.append('fav_cuisine', favCuisine);

    if (avatarFile) formData.append('profile_image', avatarFile);
    if (coverFile) formData.append('cover_image', coverFile);

    setLoading(true);
    try {
      const response = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        updateUser(response.data.user);
        toast.success('Profile updated successfully!');
        navigate(`/profile/${user.id}`);
      }
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters.');
    }

    setPasswordLoading(true);
    try {
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (res.data.success) {
        toast.success(res.data.message);
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Edit Chef Profile & Security</h1>
        <p className="page-subtitle">Customize cover banner, social handles, and password security.</p>
      </div>

      {/* Main Profile Form */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>Profile Information</h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Cover Photo Upload */}
          <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--bg-input)' }}>
            <img src={coverPreview} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <label htmlFor="edit-cover" className="btn btn-outline" style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
              <FaImage /> Change Cover Banner
            </label>
            <input type="file" id="edit-cover" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />
          </div>

          {/* Avatar Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={styles.avatarBox}>
              <img src={avatarPreview} alt="Avatar" style={styles.avatarImg} />
            </div>
            <div>
              <label htmlFor="edit-avatar" className="btn btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                <FaImage /> Change Profile Picture
              </label>
              <input type="file" id="edit-avatar" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label"><FaMapMarkerAlt /> Country</label>
              <input type="text" className="form-input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. United Kingdom, Spain" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label"><FaUtensilSpoon /> Favorite Cuisine</label>
              <input type="text" className="form-input" value={favCuisine} onChange={(e) => setFavCuisine(e.target.value)} placeholder="e.g. Italian, Japanese" />
            </div>

            <div className="form-group">
              <label className="form-label"><FaInstagram /> Instagram Handle</label>
              <input type="text" className="form-input" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="username (without @)" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><FaGlobe /> Personal Website</label>
            <input type="url" className="form-input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://myrecipesblog.com" />
          </div>

          <div className="form-group">
            <label className="form-label">Bio & Culinary Specialization</label>
            <textarea className="form-textarea" rows="3" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell other chefs about your favorite dishes and cooking philosophy..." />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}>
            <FaCheck /> {loading ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Password Security Form */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaLock style={{ color: 'var(--primary)' }} /> Password & Security
        </h3>

        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters..." required />
          </div>

          <button type="submit" disabled={passwordLoading} className="btn btn-outline" style={{ padding: '0.65rem', fontSize: '0.9rem' }}>
            {passwordLoading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  avatarBox: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid var(--primary)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
};

export default EditProfile;
