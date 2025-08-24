import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
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
    { field: 'firstName' },
    { field: 'lastName' },
    { field: 'email' },
    { field: 'company' },
    { field: 'city' },
    { field: 'state' },
    { field: 'source' },
    { field: 'status' },
    { field: 'score' },
    { field: 'leadValue' },
  ]);
  const defaultColDef = { sortable: true, filter: false, resizable: true, flex: 1 };

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
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Leads</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <FilterBar onChange={handleFilterChange} />

      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {loading && <div>Loading...</div>}

      <div className="ag-theme-alpine" style={{ height: 420, width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection="single"
          onSelectionChanged={onSelectionChanged}
        />
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <h3 style={{ marginTop: 16 }}>{selected ? 'Edit Lead' : 'Create Lead'}</h3>
      <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <input placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
        <input placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
        <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
        <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
          <option value="website">website</option>
          <option value="facebook_ads">facebook_ads</option>
          <option value="google_ads">google_ads</option>
          <option value="referral">referral</option>
          <option value="events">events</option>
          <option value="other">other</option>
        </select>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="new">new</option>
          <option value="contacted">contacted</option>
          <option value="qualified">qualified</option>
          <option value="lost">lost</option>
          <option value="won">won</option>
        </select>
        <input placeholder="Score" type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
        <input placeholder="Lead Value" type="number" value={form.leadValue} onChange={(e) => setForm({ ...form, leadValue: e.target.value })} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label>Last Activity</label>
          <input type="date" value={form.lastActivityAt} onChange={(e) => setForm({ ...form, lastActivityAt: e.target.value })} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label>Qualified</label>
          <input type="checkbox" checked={!!form.isQualified} onChange={(e) => setForm({ ...form, isQualified: e.target.checked })} />
        </div>
        <div style={{ gridColumn: 'span 3', display: 'flex', gap: 8 }}>
          {!selected && <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Lead'}</button>}
          {selected && (
            <>
              <button type="button" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving...' : 'Update Lead'}</button>
              <button type="button" onClick={handleDelete} style={{ color: 'white', background: 'crimson' }}>Delete Lead</button>
              <button type="button" onClick={() => { setSelected(null); setForm(initialForm); }}>Cancel</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default LeadsPage;