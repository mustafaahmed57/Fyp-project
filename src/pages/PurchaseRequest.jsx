import React, { useEffect, useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function PurchaseRequest() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
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

  // Fetch Procurement Users for dropdown
  const fetchUsers = () => {
    fetch(`${apiUrl}/users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => toast.error("Failed to load users ❌"));
  };

  // Fetch Raw + Semi-Finished Products for dropdown
  const fetchProducts = () => {
    fetch(`${apiUrl}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => toast.error("Failed to load products ❌"));
  };

  useEffect(() => {
    fetchRequests();
    fetchUsers();
    fetchProducts();
  }, []);

  const fields = [
    { name: 'requestedBy', label: 'Requested By', type: 'select', options: users },
    { name: 'productName', label: 'Product Name', type: 'select', options: products },
    { name: 'quantity', label: 'Quantity Needed', type: 'number' },
    { name: 'costPrice', label: 'Cost Price', type: 'number', readOnly: true }, // NEW FIELD
    { name: 'requiredDate', label: 'Required Date', type: 'date' }
  ];

  // Auto set CostPrice when product is selected
 const handleFieldChange = (fieldName, value, setFormData) => {
  if (fieldName === 'productName') {
    const selectedProduct = products.find(p => p.value === value);
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        productName: value,
        costPrice: selectedProduct.costPrice // Auto fill CostPrice
      }));
    }
  } else {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }
};


  const handleSubmit = async (data) => {
    const fixedData = {
      ...data,
      requestedBy: parseInt(data.requestedBy),
      quantity: parseInt(data.quantity),
      costPrice: parseFloat(data.costPrice)
    };

    // ✅ Validation
    if (!fixedData.requestedBy || !fixedData.productName || !fixedData.quantity || !fixedData.costPrice) {
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
        setTimeout(() => navigate('/purchase-order'), 2000); // Redirect after 2 seconds
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
    'costPrice', // NEW COLUMN
    'requiredDate',
    'requestDate',
    'status'
  ];

  const columnLabels = {
    prCode: 'PR Code',
    requestedBy: 'Requested By',
    productName: 'Product',
    quantity: 'Quantity',
    costPrice: 'Cost Price',
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
        onFieldChange={handleFieldChange}
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
