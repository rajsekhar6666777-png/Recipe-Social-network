import React from 'react';

const Loader = ({ text = 'Loading delicious recipes...' }) => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.text}>{text}</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    width: '100%',
  },
  spinner: {
    width: '44px',
    height: '44px',
    border: '4px solid var(--border-color)',
    borderTop: '4px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  text: {
    marginTop: '1rem',
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
};

// Add keyframes inline or use CSS
const styleSheet = document.createElement('style');
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('spin-loader-css')) {
  styleSheet.id = 'spin-loader-css';
  document.head.appendChild(styleSheet);
}

export default Loader;
