import React, { useEffect, useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [userOptions, setUserOptions] = useState([]);


  const apiUrl = 'http://localhost:5186/api/Suppliers';

  const fields = [
    { name: 'supplierCode', label: 'Supplier Code', type: 'text', readOnly: true },
    { name: 'name', label: 'Name', type: 'text',readOnly: isEditing },
    // { name: 'contactPerson', label: 'Contact Person', type: 'text' },
    { name: 'contactPerson', label: 'Contact Person', type: 'select', options: userOptions }, // will be filled dynamically
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'address', label: 'Address', type: 'text' }
  ];

  const fetchUsers = () => {
  fetch('http://localhost:5186/api/Users/dropdown')
    .then(res => res.json())
    .then(data => {
      const formatted = data.map(u => ({
        value: u.name,
        label: u.name
      }));
      setUserOptions(formatted);
    })
    .catch(() => toast.error("Failed to load users ❌"));
};

  const fetchSuppliers = () => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => setSuppliers(data))
      .catch(() => toast.error("Failed to load suppliers ❌"));
  };

  useEffect(() => {
    fetchSuppliers();
     fetchUsers(); //
  }, []);

  const handleSubmit = async (data) => {
    if (!/^\d{11}$/.test(data.phone)) {
      toast.error("Phone must be exactly 11 digits ❌");
      return;
    }

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${apiUrl}/${data.id}` : apiUrl;
    // const payload = isEditing ? data : { ...data, supplierCode: undefined };
    const payload = isEditing ? { ...data, id: data.id } : { ...data, supplierCode: undefined };


    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async res => {
  if (!res.ok) {
    const errText = await res.text(); // get text fallback
    let errMessage = "Failed";

    try {
      const errJson = JSON.parse(errText);
      errMessage = errJson.message || errMessage;
    } catch {
      errMessage = errText || errMessage;
    }

    throw new Error(errMessage);
  }

  // ✅ Return response only if there's body
  if (res.status === 204) return null; // No content
  return res.json();
})

      .then(() => {
        toast.success(`Supplier ${isEditing ? 'updated' : 'created'} ✅`);
        setFormValues({});
        setIsEditing(false);
        fetchSuppliers();
      })
      .catch((err) => toast.error(err.message || "Failed to save ❌"));
  };

  const handleEdit = (index) => {
    const selected = suppliers[index];
    setFormValues(selected);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error("Delete failed");
        toast.success("Supplier deleted ✅");
        fetchSuppliers();
      })
      .catch(() => toast.error("Failed to delete ❌"));
  };

  const columns = ['supplierCode', 'name', 'contactPerson', 'phone', 'email', 'address', 'actions'];

  const columnLabels = {
    supplierCode: 'Supplier Code',
    name: 'Name',
    contactPerson: 'Contact Person',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    actions: 'Actions'
  };

  const tableRows = suppliers.map((supplier, index) => ({
    ...supplier,
    actions: (
      <>
        <button className="btn edit-btn" onClick={() => handleEdit(index)}>Edit</button>
        <button className="btn delete-btn" onClick={() => handleDelete(supplier.id)} style={{ marginLeft: '6px' }}>
          Delete
        </button>
      </>
    )
  }));

  return (
    <div style={{ paddingLeft: '30px', paddingRight: '30px' }}>
      <h2>Suppliers</h2>
      <FormBuilder
  fields={fields}
  initialValues={formValues}
  onSubmit={handleSubmit}
/>

      <DataTable
        columns={columns}
        rows={tableRows}
        columnLabels={columnLabels}
      />
    </div>
  );
}

export default Suppliers;
