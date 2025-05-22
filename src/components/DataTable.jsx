import React, { useState } from 'react';

function DataTable({ columns = [], rows = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRows = rows.filter(row =>
    columns.some(col =>
      row[col]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = filteredRows.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const handleExportCSV = () => {
    const csvContent = [
      columns.join(','),
      ...filteredRows.map(row => columns.map(col => `"${row[col]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    const colors = {
      Pending: '#facc15',       // Yellow
      Approved: '#4ade80',      // Green
      Dispatched: '#38bdf8',    // Blue
      Rejected: '#f87171'       // Red
    };

    return (
      <span
        style={{
          backgroundColor: colors[status] || '#e5e7eb',
          color: '#fafafc',
          padding: '4px 8px',
          borderRadius: '8px',
          fontWeight: 'bold',
          display: 'inline-block',
          minWidth: '80px',
          textAlign: 'center'
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="data-table">
      <div className="search-container" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '6px', borderRadius: '4px' }}
        />
        <button onClick={handleExportCSV} className="export-btn">Export to CSV</button>
      </div>

      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                No data found
              </td>
            </tr>
          ) : (
            currentRows.map((row, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={col}>
                    {col === 'addsOnRequired' ? (
                      row[col] ? 'Yes' : 'No'
                    ) : col === 'status' ? (
                      getStatusBadge(row[col])
                    ) : (
                      row[col]
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination" style={{ marginTop: '10px', textAlign: 'center' }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
            onClick={() => setCurrentPage(i + 1)}
            style={{ margin: '0 5px', padding: '4px 10px' }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DataTable;
