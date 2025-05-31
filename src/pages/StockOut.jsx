import React, { useState, useEffect } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import axios from 'axios';

function StockOut() {
  const [stockOuts, setStockOuts] = useState([]);
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

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${baseURL}/StockOut/inventory-users`);
      setUsers(res.data);
    } catch {
      toast.error('Failed to load users ❌');
    }
  };

  const fetchStockOuts = async () => {
    try {
      const res = await axios.get(`${baseURL}/stockout`);
      setStockOuts(res.data);
    } catch {
      toast.error('Failed to load stock outs ❌');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
    fetchStockOuts();
  }, []);

  const fields = [
  {
    name: 'productID',
    label: 'Product',
    type: 'select',
    options: products.map(p => ({
      value: p.productID,
      label: `${p.productCode} - ${p.name}`
    }))
  },
  {
    name: 'price',
    label: 'Product Price',
    type: 'text',
    readOnly: true
  },
  {
    name: 'costPrice',
    label: 'Cost Price',
    type: 'text',
    readOnly: true
  },
  { name: 'quantity', label: 'Quantity Dispatched', type: 'number' },
  {
    name: 'dispatchedByUserId',
    label: 'Dispatched By',
    type: 'select',
    options: users
  },
  { name: 'date', label: 'Date', type: 'date' },
  { name: 'remarks', label: 'Remarks', type: 'text' },
  // {
  //   name: 'stockOutCode',
  //   label: 'Stock Out Code',
  //   type: 'text',
  //   readOnly: true
  // }
];


  const handleSubmit = async (data) => {
    const product = products.find(p => p.productID === data.productID);
    if (!product || data.quantity > product.stock) {
      toast.error(`Insufficient stock ❌`);
      return;
    }

    // ✅ Fix: Set dispatchedBy string from dropdown label
    const selectedUser = users.find(u => u.value === data.dispatchedByUserId);
    data.dispatchedBy = selectedUser?.label || 'Unknown';

    try {
      await axios.post(`${baseURL}/stockout`, data);
      toast.success('Stock Out recorded ✅');
      setFormValues({});
      fetchProducts();
      fetchStockOuts();
    } catch {
      toast.error('Failed to save stock out ❌');
    }
  };

  const columns = [
    'stockOutCode',
    'productDisplay',
    'quantity',
    'price',
    'costPrice',
    'dispatchedBy',
    'date',
    'remarks'
  ];

  const rows = stockOuts.map(entry => {
    const product = products.find(p => p.productID === entry.productID);
    const user = users.find(u => u.value === entry.dispatchedByUserId);
    return {
      ...entry,
      productDisplay: `${product?.productCode || ''} - ${product?.name || ''}`,
      dispatchedBy: user?.label || entry.dispatchedBy
    };
  });

  return (
    <div>
      <h2>Stock Out (Manual Dispatch)</h2>
      <FormBuilder
  fields={fields}
  onSubmit={handleSubmit}
  initialValues={formValues}
  onFieldChange={(field, value) => {
    let updated = { ...formValues, [field]: value };

    if (field === 'productID') {
      const selected = products.find(p => p.productID === value);
      if (selected) {
        updated.price = selected.price;
        updated.costPrice = selected.costPrice;
      }
    }

    setFormValues(updated);
  }}
/>

      <DataTable columns={columns} rows={rows} />
    </div>
  );
}

export default StockOut;
