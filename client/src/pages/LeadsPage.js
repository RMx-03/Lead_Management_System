import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import { fetchLeads, createLead, updateLead, deleteLead, logout } from '../services/api';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

// Register AG Grid Community modules (v34 modular API)
ModuleRegistry.registerModules([AllCommunityModule]);

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  city: '',
  state: '',
  source: 'website',
  status: 'new',
  score: 0,
  leadValue: 0,
  lastActivityAt: '',
  isQualified: false,
};

const LeadsPage = () => {
  const [rowData, setRowData] = useState([]);
  const [columnDefs] = useState([
    { headerName: 'First Name', field: 'firstName', minWidth: 140 },
    { headerName: 'Last Name', field: 'lastName', minWidth: 140 },
    { headerName: 'Email', field: 'email', minWidth: 220 },
    { headerName: 'Company', field: 'company', minWidth: 180 },
    { headerName: 'City', field: 'city', minWidth: 120 },
    { headerName: 'State', field: 'state', minWidth: 100 },
    { headerName: 'Source', field: 'source', minWidth: 140 },
    { headerName: 'Status', field: 'status', minWidth: 130 },
    { headerName: 'Score', field: 'score', minWidth: 110, type: 'numericColumn' },
    {
      headerName: 'Lead Value',
      field: 'leadValue',
      minWidth: 140,
      valueFormatter: (p) => (p.value != null ? `$${Number(p.value).toLocaleString()}` : ''),
      type: 'numericColumn',
    },
  ]);
  const defaultColDef = { sortable: true, filter: true, resizable: true, flex: 1 };

  const gridRef = useRef(null);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 20, ...filters };
      const res = await fetchLeads(params);
      setRowData(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      setError('Failed to fetch leads');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  const onGridReady = useCallback((params) => {
    // initial fit
    params.api.sizeColumnsToFit();
  }, []);

  const onGridSizeChanged = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  const onSelectionChanged = () => {
    const api = gridRef.current?.api;
    const nodes = api?.getSelectedRows?.() || [];
    const sel = nodes[0] || null;
    setSelected(sel);
    if (sel) setForm({
      ...initialForm,
      ...sel,
      lastActivityAt: sel.lastActivityAt ? sel.lastActivityAt.substring(0,10) : '',
    });
  };

  const handleFilterChange = (newFilters) => {
    setPage(1);
    setFilters(newFilters);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.lastActivityAt) payload.lastActivityAt = null;
      await createLead(payload);
      setForm(initialForm);
      await loadLeads();
    } catch (e) {
      console.error(e);
      alert('Failed to create lead');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.lastActivityAt) payload.lastActivityAt = null;
      await updateLead(selected.id, payload);
      await loadLeads();
    } catch (e) {
      console.error(e);
      alert('Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!window.confirm('Delete selected lead?')) return;
    try {
      await deleteLead(selected.id);
      setSelected(null);
      setForm(initialForm);
      await loadLeads();
    } catch (e) {
      console.error(e);
      alert('Failed to delete lead');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  return (
    <div className="app-shell">
      <div className="toolbar">
        <div className="toolbar-left">
          <h1 className="title">Leads</h1>
        </div>
        <div className="toolbar-right">
          <button className="btn" onClick={() => gridRef.current?.api?.exportDataAsCsv?.()}>Export CSV</button>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <FilterBar onChange={handleFilterChange} />

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <div className="alert">Loading...</div>}

      <div className="ag-theme-quartz-dark grid-wrap">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection="single"
          onSelectionChanged={onSelectionChanged}
          onGridReady={onGridReady}
          onGridSizeChanged={onGridSizeChanged}
          animateRows
        />
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <h3 className="section-title">{selected ? 'Edit Lead' : 'Create Lead'}</h3>
      <form onSubmit={handleCreate} className="form-grid">
        <div className="field">
          <label className="label">First Name</label>
          <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
        </div>
        <div className="field">
          <label className="label">Last Name</label>
          <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
        </div>
        <div className="field">
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="field">
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        </div>
        <div className="field">
          <label className="label">Company</label>
          <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
        </div>
        <div className="field">
          <label className="label">City</label>
          <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        </div>
        <div className="field">
          <label className="label">State</label>
          <input className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
        </div>
        <div className="field">
          <label className="label">Source</label>
          <select className="select" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
            <option value="website">website</option>
            <option value="facebook_ads">facebook_ads</option>
            <option value="google_ads">google_ads</option>
            <option value="referral">referral</option>
            <option value="events">events</option>
            <option value="other">other</option>
          </select>
        </div>
        <div className="field">
          <label className="label">Status</label>
          <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="new">new</option>
            <option value="contacted">contacted</option>
            <option value="qualified">qualified</option>
            <option value="lost">lost</option>
            <option value="won">won</option>
          </select>
        </div>
        <div className="field">
          <label className="label">Score</label>
          <input className="input" type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
        </div>
        <div className="field">
          <label className="label">Lead Value</label>
          <input className="input" type="number" step="0.01" value={form.leadValue} onChange={(e) => setForm({ ...form, leadValue: e.target.value })} />
        </div>
        <div className="field">
          <label className="label">Last Activity</label>
          <input className="input" type="date" value={form.lastActivityAt} onChange={(e) => setForm({ ...form, lastActivityAt: e.target.value })} />
        </div>
        {selected && (
          <div className="field">
            <label className="label">Qualified</label>
            <input type="checkbox" checked={!!form.isQualified} onChange={(e) => setForm({ ...form, isQualified: e.target.checked })} />
          </div>
        )}
        <div className="filter-actions">
          {!selected && <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Lead'}</button>}
          {selected && (
            <>
              <button className="btn btn-primary" type="button" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving...' : 'Update Lead'}</button>
              <button className="btn btn-danger" type="button" onClick={handleDelete}>Delete Lead</button>
              <button className="btn" type="button" onClick={() => { setSelected(null); setForm(initialForm); }}>Cancel</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default LeadsPage;