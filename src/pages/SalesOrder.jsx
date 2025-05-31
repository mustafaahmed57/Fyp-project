import React, { useState, useEffect } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function SalesOrder() {
  const [orders, setOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [addsOnRequired, setAddsOnRequired] = useState(false);
  const [statusValue, setStatusValue] = useState('Pending');


  const navigate = useNavigate();

  // 🔁 Load Sales Orders on page load
  useEffect(() => {
    fetch('http://localhost:5186/api/SalesOrder')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        console.log("Fetched Orders:", data);
      })
      .catch(() => toast.error("Failed to load sales orders"));
  }, []);

  // 🔁 Load inquiries for dropdown
useEffect(() => {
  fetch('http://localhost:5186/api/SalesInquiry')
    .then(res => res.json())
    .then(data => {
      setInquiries(data);
    })
    .catch(() => toast.error("Failed to load inquiries"));
}, []);


  const inquiryOptions = inquiries.map((inq) => ({
    value: inq.inquiryID,
    label: `SI${inq.inquiryID.toString().padStart(5, '0')} - ${inq.customerName}`
  }));

  const fields = [
    {
      name: 'inquiryID',
      label: 'Sales Inquiry',
      type: 'select',
      options: inquiryOptions
    },
    { name: 'customerName', label: 'Customer Name', type: 'text', disabled: true },
    { name: 'productName', label: 'Product Name', type: 'text', disabled: true },
    { name: 'customerContact', label: 'Customer Contact', type: 'text', disabled: true },
    { name: 'customerEmail', label: 'Customer Email', type: 'text', disabled: true },
    { name: 'quantityOrdered', label: 'Quantity Ordered', type: 'number', disabled: true },
    { name: 'pricePerUnit', label: 'Price Per Unit', type: 'number',readOnly: true },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: ['Pending', 'Approved', 'Dispatched'],
       value: statusValue
    },
    ...(addsOnRequired
      ? [{
          name: 'addsOnDescription',
          label: 'Adds On Description',
          type: 'textarea'
        }]
      : []),
    // Hidden field to pass AddsOnRequired to backend
    // { name: 'addsOnRequired', type: 'hidden', value: addsOnRequired }
    { name: 'addsOnRequired', type: 'hidden', value: addsOnRequired || false, required: false }

  ];

  const handleFieldChange = (fieldName, value, setFormValues) => {
    if (fieldName === 'inquiryID') {
      const selected = inquiries.find(i => i.inquiryID === parseInt(value));
      if (selected) {
        // 1️⃣ Auto-fill fields from Sales Inquiry
        setFormValues(prev => ({
          ...prev,
          customerName: selected.customerName,
          productName: selected.productRequested,
          customerContact: selected.customerContact,
          customerEmail: selected.customerEmail,
          quantityOrdered: selected.quantityRequested,
          addsOnRequired: selected.addsOnRequired,
          status: 'Pending'
        }));

        setAddsOnRequired(selected.addsOnRequired);
        setStatusValue('Pending'); // <--- Add this!


        // 2️⃣ Fetch price from Products (Finished Good)
        fetch(`http://localhost:5186/api/Products/price?productName=${encodeURIComponent(selected.productRequested)}`)
          .then(res => {
            if (!res.ok) throw new Error('Price fetch failed');
            return res.json();
          })
          .then(priceData => {
            setFormValues(prev => ({
              ...prev,
              pricePerUnit: priceData.price
            }));
          })
          .catch(err => {
            console.error(err);
            toast.error("Failed to fetch product price ❌");
          });
      }
    }
  };

  const handleSubmit = async (data) => {
    if (addsOnRequired && !data.addsOnDescription?.trim()) {
      toast.error("Adds On Description is required.");
      return;
    }

    const orderDate = new Date().toISOString().split('T')[0];
    const totalAmount = parseFloat(data.quantityOrdered || 0) * parseFloat(data.pricePerUnit || 0);

    const newEntry = {
      ...data,
      orderDate,
      totalAmount
    };

    try {
      const response = await fetch('http://localhost:5186/api/SalesOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });

      if (response.ok) {
        const savedOrder = await response.json();
        setOrders(prev => [...prev, savedOrder]);
        toast.success("Sales Order created ✅");
        console.log("✅ Saved to backend:", savedOrder);
        setTimeout(() => navigate('/delivery-note'), 3000);
      } else {
        const error = await response.json();
        toast.error("Failed to save: " + (error.message || '❌'));
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error ❌");
    }
  };

  const columns = [
    'orderCode',
    // 'inquiryID',
    'customerName',
    'customerContact',
    'customerEmail',
    'productName',
    'quantityOrdered',
    'pricePerUnit',
    'totalAmount',
    'addsOnRequired',
    ...(addsOnRequired ? ['addsOnDescription'] : []),
    'status',
    'orderDate'
  ];

  return (
    <div style={{ paddingLeft: '30px', paddingRight: '30px' }}>
      <h2>Sales Order</h2>
      <FormBuilder
        fields={fields}
        onSubmit={handleSubmit}
        onFieldChange={handleFieldChange}
      />
      <DataTable columns={columns} rows={orders} />
    </div>
  );
}

export default SalesOrder;
