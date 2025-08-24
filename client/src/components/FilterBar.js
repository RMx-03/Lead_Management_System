import React, { useState } from 'react';

const defaultFilters = {
  email: '',
  company: '',
  city: '',
  status: '', // comma-separated
  source: '', // comma-separated
  scoreMin: '',
  scoreMax: '',
  leadValueMin: '',
  leadValueMax: '',
  createdFrom: '',
  createdTo: '',
  lastActivityFrom: '',
  lastActivityTo: '',
  isQualified: '', // '', 'true', 'false'
};

const FilterBar = ({ onChange }) => {
  const [filters, setFilters] = useState(defaultFilters);

  const update = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
  };

  const apply = (e) => {
    e.preventDefault();
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    onChange(cleaned);
  };

  const reset = () => {
    setFilters(defaultFilters);
    onChange({});
  };

  const input = (label, key, type = 'text') => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label>{label}</label>
      <input type={type} value={filters[key]} onChange={(e) => update(key, e.target.value)} />
    </div>
  );

  return (
    <form onSubmit={apply} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 12 }}>
      {input('Email', 'email')}
      {input('Company', 'company')}
      {input('City', 'city')}
      {input('Status (csv)', 'status')}
      {input('Source (csv)', 'source')}
      {input('Score Min', 'scoreMin', 'number')}
      {input('Score Max', 'scoreMax', 'number')}
      {input('Lead Value Min', 'leadValueMin', 'number')}
      {input('Lead Value Max', 'leadValueMax', 'number')}
      {input('Created From', 'createdFrom', 'date')}
      {input('Created To', 'createdTo', 'date')}
      {input('Last Activity From', 'lastActivityFrom', 'date')}
      {input('Last Activity To', 'lastActivityTo', 'date')}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label>Is Qualified</label>
        <select value={filters.isQualified} onChange={(e) => update('isQualified', e.target.value)}>
          <option value="">Any</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
      <div style={{ gridColumn: 'span 6', display: 'flex', gap: 8 }}>
        <button type="submit">Apply</button>
        <button type="button" onClick={reset}>Reset</button>
      </div>
    </form>
  );
};

export default FilterBar;
