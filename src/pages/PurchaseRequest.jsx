import React, { useEffect, useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function PurchaseRequest() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [formValues, setFormValues] = useState({});
  const navigate = useNavigate();

  const apiUrl = 'http://localhost:5186/api/PurchaseRequest';

  // Fetch all Purchase Requests
  const fetchRequests = () => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(() => toast.error("Failed to load purchase requests ❌"));
  };

  // Fetch Users for dropdown + name resolution
  const fetchUsers = () => {
    fetch('http://localhost:5186/api/Users/dropdown')
      .then(res => res.json())
      .then(data => {
        const options = data.map(u => ({
          value: u.userID,
          label: u.name
        }));
        setUsers(options);
      })
      .catch(() => toast.error("Failed to load users ❌"));
  };

  useEffect(() => {
    fetchRequests();
    fetchUsers();
  }, []);

  const fields = [
    { name: 'requestedBy', label: 'Requested By', type: 'select', options: users },
    { name: 'productName', label: 'Product Name', type: 'text' },
    { name: 'quantity', label: 'Quantity Needed', type: 'number' },
    { name: 'requiredDate', label: 'Required Date', type: 'date' }
  ];

  const handleSubmit = async (data) => {
    const fixedData = {
      ...data,
      requestedBy: parseInt(data.requestedBy),
      quantity: parseInt(data.quantity)
    };

    if (!fixedData.requestedBy || !fixedData.productName || !fixedData.quantity) {
      toast.error("Please fill all required fields ❌");
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixedData)
      });

      if (response.ok) {
        toast.success("Purchase Request submitted ✅");
        setFormValues({});
        fetchRequests();
        setTimeout(() => navigate('/purchase-order'), 2000);
      } else {
        toast.error("Submit failed ❌");
      }
    } catch (err) {
      console.error("🔥 Error:", err);
      toast.error("Server error ❌");
    }
  };

  const columns = [
    'prCode',
    'requestedBy',
    'productName',
    'quantity',
    'requiredDate',
    'requestDate',
    'status'
  ];

  const columnLabels = {
    prCode: 'PR Code',
    requestedBy: 'Requested By',
    productName: 'Product',
    quantity: 'Quantity',
    requiredDate: 'Required Date',
    requestDate: 'Request Date',
    status: 'Status'
  };

  return (
    <div style={{ paddingLeft: '30px', paddingRight: '30px' }}>
      <h2>Purchase Request</h2>
      <FormBuilder
        fields={fields}
        formValues={formValues}
        setFormValues={setFormValues}
        onSubmit={handleSubmit}
      />
      <DataTable
        columns={columns}
        rows={requests}
        columnLabels={columnLabels}
        resolveDisplayValue={(col, value) => {
          if (col === 'requestedBy') {
            const user = users.find(u => u.value === value);
            return user ? user.label : value;
          }
          return value;
        }}
      />
    </div>
  );
}

export default PurchaseRequest;
