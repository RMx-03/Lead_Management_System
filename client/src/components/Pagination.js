import React from 'react';

const Pagination = ({ page, totalPages, onChange }) => {
  const prev = () => onChange(Math.max(page - 1, 1));
  const next = () => onChange(Math.min(page + 1, totalPages || 1));

  return (
    <div className="pagination" role="navigation" aria-label="Pagination">
      <button className="btn" onClick={prev} disabled={page <= 1} aria-label="Previous page">Prev</button>
      <span className="pagination-text">Page {page} of {totalPages || 1}</span>
      <button className="btn" onClick={next} disabled={page >= (totalPages || 1)} aria-label="Next page">Next</button>
    </div>
  );
};

export default Pagination;
