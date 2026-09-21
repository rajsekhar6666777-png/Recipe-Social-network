import React from 'react';

export const SkeletonCard = () => (
  <div className="glass-card" style={styles.card}>
    <div style={styles.imageSkeleton} className="skeleton-pulse"></div>
    <div style={styles.body}>
      <div style={{ ...styles.line, width: '40%' }} className="skeleton-pulse"></div>
      <div style={{ ...styles.line, width: '80%', height: '20px' }} className="skeleton-pulse"></div>
      <div style={{ ...styles.line, width: '100%' }} className="skeleton-pulse"></div>
      <div style={{ ...styles.line, width: '60%' }} className="skeleton-pulse"></div>
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="recipe-grid">
    {Array.from({ length: count }, (_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

const styles = {
  card: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '340px',
  },
  imageSkeleton: {
    width: '100%',
    height: '190px',
    background: 'var(--bg-input)',
  },
  body: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  line: {
    height: '14px',
    borderRadius: '6px',
    background: 'var(--bg-input)',
  },
};

// Inject pulse animation
if (typeof document !== 'undefined' && !document.getElementById('skeleton-loader-css')) {
  const style = document.createElement('style');
  style.id = 'skeleton-loader-css';
  style.innerText = `
    @keyframes skeletonPulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    .skeleton-pulse {
      animation: skeletonPulse 1.4s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

export default SkeletonCard;
