import React, { useState, useEffect } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import axios from 'axios';

function StockIn() {
  const [stockIns, setStockIns] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [formValues, setFormValues] = useState({});

  const baseURL = 'http://localhost:5186/api';

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${baseURL}/products`);
      setProducts(res.data);
    } catch {
      toast.error('Failed to load products ❌');
    }
  };

  const fetchInventoryUsers = async () => {
    try {
      const res = await axios.get(`${baseURL}/stockin/inventory-users`);
      setUsers(res.data);
    } catch  {
      toast.error('Failed to load inventory users ❌');
    }
  };

  const fetchStockIns = async () => {
    try {
      const res = await axios.get(`${baseURL}/stockin`);
      setStockIns(res.data);
    } catch  {
      toast.error('Failed to load stock in ❌');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchInventoryUsers();
    fetchStockIns();
  }, []);

  const fields = [
    {
      name: 'productID',
      label: 'Product',
      type: 'select',
      options: products.map(p => ({ value: p.productID, label: `${p.productCode} - ${p.name}` }))
    },
    { name: 'price', label: 'Product Price', type: 'number', disabled: true },
    { name: 'costPrice', label: 'Cost Price', type: 'number', disabled: true },
    {
      name: 'receivedByUserId',
      label: 'Received By',
      type: 'select',
      options: users
    },
    { name: 'quantity', label: 'Quantity Received', type: 'number' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'remarks', label: 'Remarks', type: 'text' }
  ];

const handleSubmit = async (data) => {
  if (!data.productID || !data.quantity || !data.receivedByUserId || !data.date) {
    toast.error('Please fill all required fields ❌');
    return;
  }

  if (data.quantity <= 0) {
    toast.error('Quantity must be greater than 0 ❌');
    return;
  }

  try {
    await axios.post(`${baseURL}/stockin`, data);
    toast.success('Stock In recorded ✅');
    setFormValues({});
    fetchStockIns();
  } catch (error) {
    console.error('Error during stock-in:', error);
    toast.error('Stock In failed ❌');
  }
};

  const handleFieldChange = async (field, value) => {
    if (field === 'productID') {
      const selected = products.find(p => p.productID === parseInt(value));
      if (selected) {
        setFormValues(prev => ({
          ...prev,
          productID: selected.productID,
          price: selected.price,
          costPrice: selected.costPrice
        }));
      }
    } else {
      setFormValues(prev => ({ ...prev, [field]: value }));
    }
  };

  const columns = [
    'stockInCode',
    // 'productID',
    'productCode',      // ✅ New column
    'productName',       // ✅ New column
    'price',
    'costPrice',
    'quantity',
    'receivedBy',
    'date',
    'remarks',
  ];

  const rows = stockIns.map(item => {
  const product = products.find(p => p.productID === item.productID);
  return {
    ...item,
    productCode: product?.productCode || '',
    productName: product?.name || ''
  };
});


  return (
    <div>
      <h2>Stock In (Manual GRN)</h2>
      <FormBuilder
        fields={fields}
        onSubmit={handleSubmit}
        initialValues={formValues}
        onFieldChange={handleFieldChange}
      />
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}

export default StockIn;
