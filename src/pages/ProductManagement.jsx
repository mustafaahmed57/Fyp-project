import React, { useState, useEffect } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import {
  getAllProducts,
  getLastProductCode,
  addProduct,
  updateProduct,
  deleteProduct
} from '../services/productService';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [editId, setEditId] = useState(null);

  // ✅ Load products initially
  const fetchProducts = async () => {
    try {
      const response = await getAllProducts();
      setProducts(response.data);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load products ❌');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fields = [
    { name: 'productCode', label: 'Product Code', type: 'text', disabled: true },
    { name: 'name', label: 'Product Name', type: 'text' },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: ['Raw Material', 'Semi Finished Goods', 'Finished Goods', 'Packaging']
    },
    {
      name: 'uom',
      label: 'Unit of Measure (UOM)',
      type: 'select',
      options: ['PCS', 'SHT', 'MTR', 'KG', 'BOX']
    },
    { name: 'stock', label: 'Stock Quantity', type: 'number' },
    { name: 'price', label: 'Selling Price', type: 'number' }, // ✅ New field
    { name: 'costPrice', label: 'Cost Price', type: 'number' }, // ✅ New field
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: ['Active', 'Inactive', 'Discontinued']
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea'
    }
  ];

  const handleCategoryChange = async (selectedCategory) => {
    let prefix = '';
    switch (selectedCategory) {
      case 'Raw Material': prefix = 'RMF'; break;
      case 'Semi Finished Goods': prefix = 'SFG'; break;
      case 'Finished Goods': prefix = 'FG'; break;
      case 'Packaging': prefix = 'PKG'; break;
      default: prefix = 'GEN';
    }

    try {
      const res = await getLastProductCode(prefix);
      const lastCode = res.data;

      let newNumber = 1;
      if (lastCode) {
        const num = parseInt(lastCode.slice(prefix.length));
        newNumber = num + 1;
      }

      const generatedCode = `${prefix}${String(newNumber).padStart(5, '0')}`;

      setFormValues((prev) => ({
        ...prev,
        category: selectedCategory,
        productCode: generatedCode
      }));
    } catch (err) {
      console.error('Code gen error:', err);
    }
  };

  const handleSubmit = async (data) => {
    if (!data.name || !data.category || !data.productCode || !data.uom || !data.stock || !data.status || !data.price || !data.costPrice) {
      toast.error('All fields are required ❌');
      return;
    }

    if (!editId) {
      const duplicate = products.find(p => p.productCode === data.productCode);
      if (duplicate) {
        toast.error('Duplicate Product Code ❌');
        return;
      }
    }

    try {
      if (editId) {
        await updateProduct(editId, data);
        toast.info('Product updated ✅');
      } else {
        await addProduct(data);
        toast.success('Product added ✅');
      }

      setFormValues({});
      setEditId(null);
      fetchProducts();
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Error saving product ❌');
    }
  };

  const handleEdit = (index) => {
    const selected = products[index];
    setFormValues(selected);
    setEditId(selected.productID);
  };

  const handleDelete = async (index) => {
    const id = products[index].productID;
    try {
      await deleteProduct(id);
      toast.error('Product deleted ❌');
      fetchProducts();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete ❌');
    }
  };

  const columns = [
    'productCode',
    'name',
    'category',
    'uom',
    'stock',
    'price', // ✅ Column added
    'costPrice', // ✅ Column added
    'status',
    'description',
    // 'actions'
  ];

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
      <FormBuilder
        fields={fields}
        onSubmit={handleSubmit}
        initialValues={formValues}
        onFieldChange={(field, value) => {
          if (field === 'category') {
            handleCategoryChange(value);
          } else {
            setFormValues((prev) => ({ ...prev, [field]: value }));
          }
        }}
      />
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}

export default ProductManagement;
