import React, { useState, useEffect } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function SalesInquiry() {
  const [inquiries, setInquiries] = useState([]);
  const navigate = useNavigate();

  // ✅ Form fields
  const fields = [
    { name: 'customerName', label: 'Customer Name', type: 'text' },
    { name: 'customerContact', label: 'Customer Contact', type: 'text' },
    { name: 'customerEmail', label: 'Customer Email', type: 'email' },
    {
      name: 'productRequested',
      label: 'Product Requested',
      type: 'select',
      options: ['Cart Model A', 'Cart Model B', 'Cart Model C']
    },
    { name: 'quantityRequested', label: 'Quantity Requested', type: 'number' },
    { name: 'addsOnRequired', label: 'Adds On Required?', type: 'checkbox' }
  ];

  // ✅ Load existing inquiries
  useEffect(() => {
    fetch('http://localhost:5186/api/SalesInquiry')
      .then((res) => res.json())
      .then((data) => setInquiries(data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load inquiries");
      });
  }, []);

  // ✅ Handle form submission
  const handleSubmit = async (data) => {
    try {
      const response = await fetch('http://localhost:5186/api/SalesInquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setInquiries((prev) => [...prev, result]);
        toast.success("Sales Inquiry submitted ✅");

        setTimeout(() => {
          navigate('/sales-order');
        }, 3000);
      } else {
        toast.error("Submission failed ❌");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error ⚠");
    }
  };

  // ✅ Columns to show in DataTable
  const columns = [
    'inquiryID',
     'inquiryCode',
    'customerName',
    'customerContact',
    'customerEmail',
    'productRequested',
    'quantityRequested',
    'inquiryDate',
    'addsOnRequired'
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
