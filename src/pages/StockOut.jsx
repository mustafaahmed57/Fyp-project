import React, { useState, useEffect } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import axios from 'axios';

function StockOut() {
  const [stockOuts, setStockOuts] = useState([]);
  const [products, setProducts] = useState([]);
  const [formValues, setFormValues] = useState({});
  const baseURL = 'http://localhost:5186/api';

  // 🔄 Load product list for dropdown
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${baseURL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  // 📦 Load stock-out history
  const fetchStockOuts = async () => {
    try {
      const res = await axios.get(`${baseURL}/stockout`);
      setStockOuts(res.data);
    } catch (err) {
      console.error('Error loading stock-outs:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStockOuts();
  }, []);

  const fields = [
    {
      name: 'productID',
      label: 'Product',
      type: 'select',
      options: products.map(p => ({
        value: p.productID,
        label: `${p.productCode} - ${p.name} (Stock: ${p.stock})`
      }))
    },
    { name: 'quantity', label: 'Quantity Dispatched', type: 'number' },
    { name: 'dispatchedBy', label: 'Dispatched By', type: 'text' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'remarks', label: 'Remarks', type: 'text' }
  ];

  const handleSubmit = async (data) => {
    if (!data.productID || !data.quantity || !data.dispatchedBy || !data.date) {
      toast.error('Please fill all required fields ❌');
      return;
    }

    // 🔐 Optional: check if enough stock available
    const selectedProduct = products.find(p => p.productID === parseInt(data.productID));
    if (selectedProduct && data.quantity > selectedProduct.stock) {
      toast.error(`Only ${selectedProduct.stock} units available ❌`);
      return;
    }

    try {
      await axios.post(`${baseURL}/stockout`, data);
      toast.success('Stock Out recorded ✅');
      setFormValues({});
      fetchStockOuts();
      fetchProducts(); // Refresh product stock
    } catch (err) {
      console.error('Error submitting:', err);
      toast.error('Failed to record stock out ❌');
    }
  };

  const columns = [
    'stockOutID',
    'productID',
    'quantity',
    'dispatchedBy',
    'date',
    'remarks'
  ];

  return (
    <div>
      <h2>Stock Out (Manual Dispatch)</h2>
      <FormBuilder
        fields={fields}
        onSubmit={handleSubmit}
        initialValues={formValues}
        onFieldChange={(field, value) =>
          setFormValues(prev => ({ ...prev, [field]: value }))
        }
      />
      <DataTable columns={columns} rows={stockOuts} />
    </div>
  );
}

export default StockOut;
