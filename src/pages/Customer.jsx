import React, { useEffect, useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [editIndex, setEditIndex] = useState(null);

  const apiUrl = 'http://localhost:5186/api/Customers';

  const fields = [
    { name: 'customerCode', label: 'Customer Code', type: 'text', readOnly: true },
    // { name: 'fullName', label: 'Full Name', type: 'text' },
    { name: 'name', label: 'Full Name', type: 'text' },           // ✅ Matches backend
  { name: 'contact', label: 'Phone', type: 'text' },            // ✅ Matches backend
    { name: 'email', label: 'Email', type: 'email' },
    // { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'address', label: 'Address', type: 'text' },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'country', label: 'Country', type: 'text' },
    { name: 'addsOnRequired', label: 'Adds On Required?', type: 'checkbox' } // ✅ NEW
  ];

  // 🔁 Load from API
  const fetchCustomers = () => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(() => toast.error("Failed to load customers ❌"));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ✅ Submit
 const handleSubmit = async (data) => {
  const method = editIndex !== null ? 'PUT' : 'POST';
  const url = editIndex !== null ? `${apiUrl}/${customers[editIndex].id}` : apiUrl;

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errorData = await res.json();

      // ✅ If it has model validation errors
      if (errorData && errorData.errors) {
        const allErrors = Object.entries(errorData.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');

        toast.error(`Validation failed:\n${allErrors}`);
        return;
      }

      // ✅ Generic error
      throw new Error(errorData.message || 'Failed to save');
    }

    await res.json();
    toast.success(`Customer ${editIndex !== null ? 'updated' : 'added'} ✅`);
    setFormValues({});
    setEditIndex(null);
    fetchCustomers();

  } catch (err) {
    toast.error(err.message || "Error saving customer ❌");
  }
};


  // ✅ Edit
  const handleEdit = (index) => {
    setFormValues(customers[index]);
    setEditIndex(index);
  };

  // ✅ Delete
  const handleDelete = (index) => {
    const id = customers[index].id;
    fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        toast.success("Customer deleted ✅");
        fetchCustomers();
      })
      .catch(() => toast.error("Failed to delete ❌"));
  };

  const columns = ['customerCode', 'name', 'email', 'contact', 'address', 'city', 'country', 'addsOnRequired'];
  const columnLabels = {
    customerCode: 'Customer Code',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    country: 'Country'
    
  };

  return (
    <div style={{ paddingLeft: '30px', paddingRight: '30px'  }}>
      <h2>Customers</h2>
      <FormBuilder
        fields={fields}
        formValues={formValues}
        setFormValues={setFormValues}
        onSubmit={handleSubmit}
        checkDuplicate={(name, value) => {
          if (name === 'email') return customers.some(c => c.email === value && c.id !== formValues.id);
          if (name === 'phone') return customers.some(c => c.phone === value && c.id !== formValues.id);
          return false;
        }}
      />
      <DataTable
        columns={columns}
        rows={customers}
        columnLabels={columnLabels}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default Customer;
