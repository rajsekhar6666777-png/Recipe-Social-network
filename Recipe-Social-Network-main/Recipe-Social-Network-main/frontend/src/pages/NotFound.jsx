import React from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'var(--primary-light)',
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem',
        fontSize: '2.5rem',
      }}>
        <FaUtensils />
      </div>
      <h1 className="page-title" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Recipe Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 2rem' }}>
        Oops! Looks like this recipe or page has been moved or eaten! Return to the home feed to explore more delicious creations.
      </p>

      <Link to="/">
        <button className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
          <FaHome /> Back to Home Feed
        </button>
      </Link>
    </div>
  );
};

export default NotFound;
