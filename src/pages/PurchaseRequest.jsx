import React, { useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';

function PurchaseRequest() {
  const [requests, setRequests] = useState([]);

  const fields = [
    { name: 'requestedBy', label: 'Requested By', type: 'text' },
    { name: 'productName', label: 'Product Name', type: 'text' },
    { name: 'quantityNeeded', label: 'Quantity Needed', type: 'number' },
    { name: 'requiredDate', label: 'Required Date', type: 'date' },
  ];

  const handleSubmit = (data) => {
    const requestDate = new Date().toISOString().split('T')[0]; // auto-today
    const newEntry = { ...data, RequestID: requests.length + 1, RequestDate: requestDate };
    setRequests((prev) => [...prev, newEntry]);
  };

  const columns = [
    'RequestID',
    'requestedBy',
    'productName',
    'quantityNeeded',
    'requiredDate',
    'RequestDate'
  ];

  return (
    <div style={{ paddingLeft: '30px', paddingRight: '30px' }}>
      <h2>Purchase Request</h2>
      <FormBuilder fields={fields} onSubmit={handleSubmit} />
      <DataTable columns={columns} rows={requests} />
    </div>
  );
}

export default PurchaseRequest;
