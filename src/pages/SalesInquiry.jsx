import React, { useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';

function SalesInquiry() {
  const [inquiries, setInquiries] = useState([]);

  const fields = [
    { name: 'customerName', label: 'Customer Name', type: 'text' },
    { name: 'customerContact', label: 'Customer Contact', type: 'text' },
    { name: 'customerEmail', label: 'Customer Email', type: 'email' },
    { name: 'productRequested', label: 'Product Requested', type: 'text' },
    { name: 'quantityRequested', label: 'Quantity Requested', type: 'number' },
  ];

  const handleSubmit = (data) => {
    const inquiryDate = new Date().toISOString().split('T')[0]; // auto-fill current date
    const newEntry = {
      ...data,
      InquiryID: inquiries.length + 1,
      InquiryDate: inquiryDate,
    };
    setInquiries((prev) => [...prev, newEntry]);
  };

  const columns = [
    'InquiryID',
    'customerName',
    'customerContact',
    'customerEmail',
    'productRequested',
    'quantityRequested',
    'InquiryDate'
  ];

  return (
    <div style={{ paddingLeft: '30px', paddingRight: '30px' }}>
      <h2>Sales Inquiry</h2>
      <FormBuilder fields={fields} onSubmit={handleSubmit} />
      <DataTable columns={columns} rows={inquiries} />
    </div>
  );
}

export default SalesInquiry;
