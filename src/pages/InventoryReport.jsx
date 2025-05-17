import React from 'react';
import DataTable from '../components/DataTable';

function InventoryReport() {
  const columns = ['Product Name', 'SKU', 'Quantity in Stock'];

  // 🔁 Static/dummy data (backend needed for live counts)
  const rows = [
    { 'Product Name': 'Mouse', SKU: 'M001', 'Quantity in Stock': 50 },
    { 'Product Name': 'Keyboard', SKU: 'K002', 'Quantity in Stock': 30 },
  ];

  return (
    <div>
      <h2>Inventory Report</h2>
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}

export default InventoryReport;
