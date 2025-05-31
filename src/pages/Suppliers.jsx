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
    { name: 'supplierCode', label: 'Supplier Code', type: 'text', readOnly: true }, // ✅ shown as non-editable
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'contactPerson', label: 'Contact Person', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'address', label: 'Address', type: 'text' }
  ];

  // ✅ Fetch suppliers
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
    // ✅ Validate phone (exactly 11 digits)
    if (!/^\d{11}$/.test(data.phone)) {
      toast.error("Phone must be exactly 11 digits ❌");
      return;
    }

    // ✅ Prevent duplicate name or email
    const isDuplicate = suppliers.some((s, idx) =>
      idx !== editIndex &&
      (s.name === data.name || s.email === data.email)
    );

    if (isDuplicate) {
      toast.error("Duplicate name or email ❌");
      return;
    }

    const method = editIndex !== null ? 'PUT' : 'POST';
    const url = editIndex !== null ? `${apiUrl}/${suppliers[editIndex].id}` : apiUrl;

    // ✅ Remove supplierCode on create (backend will generate it)
    const payload = method === 'POST'
      ? { ...data, supplierCode: undefined }
      : data;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed");
        }
        return res.json();
      })
      .then(() => {
        toast.success(`Supplier ${editIndex !== null ? 'updated' : 'created'} ✅`);
        setFormValues({});
        setEditIndex(null);
        fetchSuppliers();
      })
      .catch((err) => toast.error(err.message || "Failed to save ❌"));
  };

  const handleEdit = (index) => {
    const selected = suppliers[index];
    setFormValues(selected);
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

  const columns = ['supplierCode', 'name', 'contactPerson', 'phone', 'email', 'address'];
  const columnLabels = {
    supplierCode: 'Code',
    name: 'Name',
    contactPerson: 'Contact Person',
    phone: 'Phone',
    email: 'Email',
    address: 'Address'
  };

  return (
    <div style={{ paddingLeft: '30px', paddingRight: '30px'  }}>
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
