import React from 'react';

const Pagination = ({ page, totalPages, onChange }) => {
  const prev = () => onChange(Math.max(page - 1, 1));
  const next = () => onChange(Math.min(page + 1, totalPages || 1));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
      <button onClick={prev} disabled={page <= 1}>Prev</button>
      <span>Page {page} of {totalPages || 1}</span>
      <button onClick={next} disabled={page >= (totalPages || 1)}>Next</button>
    </div>
  );
};

export default Pagination;
