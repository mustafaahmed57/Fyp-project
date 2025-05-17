import React, { useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';

function StockOut() {
  const [stockOuts, setStockOuts] = useState([]);

  const fields = [
    { name: 'productName', label: 'Product Name', type: 'text' },
    { name: 'quantity', label: 'Quantity Dispatched', type: 'number' },
    { name: 'dispatchedBy', label: 'Dispatched By', type: 'text' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'reason', label: 'Reason', type: 'text' },
  ];

  const handleSubmit = (data) => {
    const entry = { id: stockOuts.length + 1, ...data };
    setStockOuts([...stockOuts, entry]);
    toast.success("Stock Out recorded ✅");
  };

  const columns = ['id', 'productName', 'quantity', 'dispatchedBy', 'date', 'reason'];

  return (
    <div>
      <h2>Stock Out (Manual Dispatch)</h2>
      <FormBuilder fields={fields} onSubmit={handleSubmit} />
      <DataTable columns={columns} rows={stockOuts} />
    </div>
  );
}

export default StockOut;
