import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={styles.container}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-outline"
        style={styles.arrowBtn}
      >
        <FaChevronLeft /> Previous
      </button>

      <span style={styles.pageInfo}>
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-outline"
        style={styles.arrowBtn}
      >
        Next <FaChevronRight />
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
    marginTop: '2.5rem',
    marginBottom: '1rem',
  },
  arrowBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
  },
  pageInfo: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
};

export default Pagination;
