import React, { useState, useEffect } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import axios from 'axios';

function StockIn() {
  const [stockIns, setStockIns] = useState([]);
  const [products, setProducts] = useState([]);
  const [formValues, setFormValues] = useState({});

  const baseURL = 'http://localhost:5186/api';

  // ✅ Load products for dropdown
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseURL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // ✅ Load previous Stock-In entries (optional)
  const fetchStockIns = async () => {
    try {
      const response = await axios.get(`${baseURL}/stockin`);
      setStockIns(response.data);
    } catch (error) {
      console.error('Error loading stock-in list:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStockIns();
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
    { name: 'quantity', label: 'Quantity Received', type: 'number' },
    { name: 'receivedBy', label: 'Received By', type: 'text' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'remarks', label: 'Remarks', type: 'text' },
  ];

  const handleSubmit = async (data) => {
    if (!data.productID || !data.quantity || !data.receivedBy || !data.date) {
      toast.error('Please fill all required fields ❌');
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

  const columns = [
    'stockInID',
    'productID',
    'quantity',
    'receivedBy',
    'date',
    'remarks'
  ];

  return (
    <div>
      <h2>Stock In (Manual GRN)</h2>
      <FormBuilder
        fields={fields}
        onSubmit={handleSubmit}
        initialValues={formValues}
        onFieldChange={(field, value) =>
          setFormValues(prev => ({ ...prev, [field]: value }))
        }
      />
      <DataTable columns={columns} rows={stockIns} />
    </div>
  );
}

export default StockIn;
