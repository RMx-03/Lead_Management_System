import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { fetchLeads } from '../services/api';

const LeadsPage = () => {
  const [rowData, setRowData] = useState([]);
  const [columnDefs] = useState([
    { field: 'firstName' },
    { field: 'lastName' },
    { field: 'email' },
    { field: 'status' },
    { field: 'score' },
    // ... other columns as needed
  ]);
  
  const [gridApi, setGridApi] = useState(null);
  const [filters, setFilters] = useState({}); // State to hold filter values
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const loadLeads = async () => {
      try {
        const params = { page, limit: 20, ...filters };
        const res = await fetchLeads(params);
        setRowData(res.data.data); // Grid data
        setTotalPages(res.data.totalPages); // For your custom pagination UI
      } catch (error) {
        console.error("Failed to fetch leads", error);
      }
    };
    loadLeads();
  }, [page, filters]); // Re-fetch when page or filters change

  // This function is called by your filter UI components
  const handleFilterChange = (newFilters) => {
    setPage(1); // Reset to first page on new filter
    setFilters(newFilters);
  };
  
  // This function is called by your pagination UI
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div>
      <h1>Leads</h1>
      {/* Add your Filter UI components here, which call handleFilterChange */}
      <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          // AG Grid has its own pagination, but we need to control it
          // to link it to our server-side logic.
          // You'll build a custom pagination component that uses handlePageChange.
        />
      </div>
      {/* Add your custom Pagination UI here */}
    </div>
  );
};

export default LeadsPage;