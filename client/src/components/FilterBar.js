import React, { useState, useEffect, useRef } from 'react';

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'lost', 'won'];
const SOURCE_OPTIONS = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];

const defaultFilters = {
  email: '',
  company: '',
  city: '',
  status: [], // array -> serialized as csv on apply
  source: [], // array -> serialized as csv on apply
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
  const [openStatus, setOpenStatus] = useState(false);
  const [openSource, setOpenSource] = useState(false);
  const statusRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (openStatus && statusRef.current && !statusRef.current.contains(e.target)) {
        setOpenStatus(false);
      }
      if (openSource && sourceRef.current && !sourceRef.current.contains(e.target)) {
        setOpenSource(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [openStatus, openSource]);

  const update = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
  };

  const apply = (e) => {
    e.preventDefault();
    const cleaned = {};
    Object.entries(filters).forEach(([k, v]) => {
      if ((k === 'status' || k === 'source') && Array.isArray(v)) {
        if (v.length) cleaned[k] = v.join(',');
      } else if (v !== '' && v !== null && v !== undefined) {
        cleaned[k] = v;
      }
    });
    onChange(cleaned);
  };

  const reset = () => {
    setFilters({ ...defaultFilters });
    onChange({});
  };

  const input = (label, key, type = 'text') => (
    <div className="field">
      <label className="label">{label}</label>
      <input className="input" type={type} value={filters[key]} onChange={(e) => update(key, e.target.value)} />
    </div>
  );

  const checklist = (label, key, options, open, setOpen, ref) => (
    <div className="field" ref={ref}>
      <label className="label">{label}</label>
      <button
        type="button"
        className="dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {filters[key].length ? `${filters[key].length} selected` : 'Any'}
        <span className="caret">▾</span>
      </button>
      <div className={`dropdown-menu ${open ? 'open' : ''}`} role="listbox" aria-multiselectable="true">
        {options.map((opt) => {
          const checked = filters[key].includes(opt);
          return (
            <label key={opt} className="dropdown-option">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => {
                  const next = checked
                    ? filters[key].filter((v) => v !== opt)
                    : [...filters[key], opt];
                  update(key, next);
                }}
              />
              <span>{opt}</span>
            </label>
          );
        })}
        <div className="dropdown-actions">
          <button type="button" className="btn" onClick={() => update(key, [])}>Clear</button>
          <button type="button" className="btn" onClick={() => update(key, [...options])}>All</button>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={apply} className="filter-bar">
      {input('Email', 'email')}
      {input('Company', 'company')}
      {input('City', 'city')}
      {checklist('Status', 'status', STATUS_OPTIONS, openStatus, setOpenStatus, statusRef)}
      {checklist('Source', 'source', SOURCE_OPTIONS, openSource, setOpenSource, sourceRef)}
      {input('Score Min', 'scoreMin', 'number')}
      {input('Score Max', 'scoreMax', 'number')}
      {input('Lead Value Min', 'leadValueMin', 'number')}
      {input('Lead Value Max', 'leadValueMax', 'number')}
      {input('Created From', 'createdFrom', 'date')}
      {input('Created To', 'createdTo', 'date')}
      {input('Last Activity From', 'lastActivityFrom', 'date')}
      {input('Last Activity To', 'lastActivityTo', 'date')}
      <div className="field">
        <label className="label">Is Qualified</label>
        <select className="select" value={filters.isQualified} onChange={(e) => update('isQualified', e.target.value)}>
          <option value="">Any</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
      <div className="filter-actions">
        <button className="btn btn-primary" type="submit">Apply</button>
        <button className="btn" type="button" onClick={reset}>Reset</button>
      </div>
    </form>
  );
};

export default FilterBar;
