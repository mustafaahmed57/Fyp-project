import React, { useEffect, useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [editIndex, setEditIndex] = useState(null);

  const apiUrl = 'http://localhost:5186/api/Suppliers';

  const fields = [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'contactPerson', label: 'Contact Person', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'address', label: 'Address', type: 'text' }
  ];

  // 🔁 Fetch suppliers
  const fetchSuppliers = () => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => setSuppliers(data))
      .catch(() => toast.error("Failed to load suppliers ❌"));
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // ✅ Submit handler
  const handleSubmit = async (data) => {
    const method = editIndex !== null ? 'PUT' : 'POST';
    const url = editIndex !== null ? `${apiUrl}/${suppliers[editIndex].id}` : apiUrl;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to save");
        return res.json();
      })
      .then(() => {
        toast.success(`Supplier ${editIndex !== null ? 'updated' : 'added'} successfully ✅`);
        setFormValues({});
        setEditIndex(null);
        fetchSuppliers();
      })
      .catch(() => toast.error("Failed to save supplier ❌"));
  };

  // ✅ Edit & Delete handlers
  const handleEdit = (index) => {
    setFormValues(suppliers[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const id = suppliers[index].id;

    fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error("Delete failed");
        toast.success("Supplier deleted ✅");
        fetchSuppliers();
      })
      .catch(() => toast.error("Failed to delete ❌"));
  };

  const columns = ['name', 'contactPerson', 'phone', 'email', 'address'];
  const columnLabels = {
    name: 'Name',
    contactPerson: 'Contact Person',
    phone: 'Phone',
    email: 'Email',
    address: 'Address'
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2>Suppliers</h2>
      <FormBuilder
        fields={fields}
        formValues={formValues}
        setFormValues={setFormValues}
        onSubmit={handleSubmit}
      />
      <DataTable
        columns={columns}
        rows={suppliers}
        columnLabels={columnLabels}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default Suppliers;
