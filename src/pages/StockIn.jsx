import React, { useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';

function StockIn() {
  const [stockIns, setStockIns] = useState([]);

  const fields = [
    { name: 'productName', label: 'Product Name', type: 'text' },
    { name: 'quantity', label: 'Quantity Received', type: 'number' },
    { name: 'receivedBy', label: 'Received By', type: 'text' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'remarks', label: 'Remarks', type: 'text' },
  ];

  const handleSubmit = (data) => {
    const entry = { id: stockIns.length + 1, ...data };
    setStockIns([...stockIns, entry]);
    toast.success("Stock In recorded ✅");
  };

  const columns = ['id', 'productName', 'quantity', 'receivedBy', 'date', 'remarks'];

  return (
    <div>
      <h2>Stock In (Manual GRN)</h2>
      <FormBuilder fields={fields} onSubmit={handleSubmit} />
      <DataTable columns={columns} rows={stockIns} />
    </div>
  );
}

export default StockIn;
