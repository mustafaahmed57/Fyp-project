import React, { useState, useEffect } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function SalesInquiry() {
  const [inquiries, setInquiries] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [formValues, setFormValues] = useState({});
  const navigate = useNavigate();

  const inquiryApi = 'http://localhost:5186/api/SalesInquiry';
  const customerApi = 'http://localhost:5186/api/Customers/dropdown-with-details';
  const productApi = 'http://localhost:5186/api/Products/dropdown-finished';

  const fields = [
    {
      name: 'customerCode',
      label: 'Customer',
      type: 'select',
      options: customerOptions.map(c => ({
        value: c.customerCode,
        label: `${c.customerCode} - ${c.name}`
      }))
    },
    { name: 'customerName', label: 'Customer Name', type: 'text',readOnly: true },
    { name: 'customerContact', label: 'Customer Contact', type: 'text',readOnly: true },
    { name: 'customerEmail', label: 'Customer Email', type: 'email',readOnly: true },
    {
      name: 'productRequested',
      label: 'Product Requested',
      type: 'select',
      options: productOptions
    },
    { name: 'quantityRequested', label: 'Quantity Requested', type: 'number' },
    { name: 'addsOnRequired', label: 'Adds On Required?', type: 'checkbox',readOnly: true }
  ];

  useEffect(() => {
    // Inquiries
    fetch(inquiryApi)
      .then(res => res.json())
      .then(data => setInquiries(data))
      .catch(() => toast.error("Failed to load inquiries"));

    // Customers
    fetch(customerApi)
      .then(res => res.json())
      .then(data => setCustomerOptions(data))
      .catch(() => toast.error("Failed to load customers"));

    // Products
    fetch(productApi)
      .then(res => res.json())
      .then(data => setProductOptions(data))
      .catch(() => toast.error("Failed to load products"));
  }, []);

  const handleFieldChange = (name, value, setForm) => {
    if (name === 'customerCode') {
      const selected = customerOptions.find(c => c.customerCode === value);
      if (selected) {
        setForm(prev => ({
          ...prev,
          customerCode: selected.customerCode,
          customerName: selected.name,
          customerContact: selected.contact,
          customerEmail: selected.email,
          addsOnRequired: selected.addsOnRequired
        }));
      }
    }
  };

  const handleSubmit = async (data) => {
    try {
      const res = await fetch(inquiryApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();
      toast.success("Inquiry submitted ✅");
      setInquiries(prev => [...prev, saved]);

      setTimeout(() => navigate('/sales-order'), 2500);
    } catch {
      toast.error("Error saving inquiry ❌");
    }
  };

  const columns = [
    'inquiryCode',
    'customerCode',
    'customerName',
    'customerContact',
    'customerEmail',
    'productRequested',
    'quantityRequested',
    'addsOnRequired',
    'inquiryDate'
  ];

  return (
    <div style={{ paddingLeft: '30px', paddingRight: '30px' }}>
      <h2>Sales Inquiry</h2>
      <FormBuilder
        fields={fields}
        onSubmit={handleSubmit}
        formValues={formValues}
        setFormValues={setFormValues}
        onFieldChange={handleFieldChange}
      />
      <DataTable columns={columns} rows={inquiries} />
    </div>
  );
}

export default SalesInquiry;
