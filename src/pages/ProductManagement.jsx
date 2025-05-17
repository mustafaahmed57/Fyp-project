import React, { useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [editIndex, setEditIndex] = useState(null);

  const fields = [
    { name: 'name', label: 'Product Name', type: 'text' },
    { name: 'sku', label: 'SKU', type: 'text' },
    { name: 'price', label: 'Price', type: 'number' },
    { name: 'quantity', label: 'Quantity', type: 'number' }
  ];

  const handleSubmit = (data) => {
    if (editIndex !== null) {
      const updated = [...products];
      updated[editIndex] = { ...updated[editIndex], ...data };
      setProducts(updated);
      toast.info('Product updated ✅');
      setEditIndex(null);
    } else {
      const productId = products.length + 1;
      setProducts([...products, { id: productId, ...data }]);
      toast.success('Product added ✅');
    }
    setFormValues({});
  };

  const handleEdit = (index) => {
    setFormValues(products[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
    toast.error('Product deleted ❌');
  };

  const columns = ['id', 'name', 'sku', 'price', 'quantity', 'actions'];

  const rows = products.map((product, index) => ({
    ...product,
    actions: (
      <div className="action-buttons">
        <button className="btn edit-btn" onClick={() => handleEdit(index)}>Edit</button>
        <button className="btn delete-btn" onClick={() => handleDelete(index)}>Delete</button>
      </div>
    )
  }));

  return (
    <div>
      <h2>Product Management</h2>
      <FormBuilder fields={fields} onSubmit={handleSubmit} initialValues={formValues} />
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}

export default ProductManagement;
