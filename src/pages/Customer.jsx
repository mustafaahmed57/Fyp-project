import React, { useEffect, useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [formValues, setFormValues] = useState({});
  // const [editIndex, setEditIndex] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);



  const apiUrl = 'http://localhost:5186/api/Customers';

  const fields = [
    { name: 'customerCode', label: 'Customer Code', type: 'text', readOnly: true },
    // { name: 'fullName', label: 'Full Name', type: 'text' },
    { name: 'name', label: 'Full Name', type: 'text', disabled:isEditing },           // ✅ Matches backend
  { name: 'contact', label: 'Phone', type: 'text' },            // ✅ Matches backend
    { name: 'email', label: 'Email', type: 'email' },
    // { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'address', label: 'Address', type: 'text' },
    // { name: 'city', label: 'City', type: 'text' },
    { name: 'city', label: 'City', type: 'select', options: cityOptions },
    // { name: 'country', label: 'Country', type: 'text' },
    { name: 'country', label: 'Country', type: 'select', options: countryOptions },
    // { name: 'addsOnRequired', label: 'Adds On Required?', type: 'checkbox' } // ✅ NEW
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
    // Load cities from local JSON
  // fetch("/services/cities.json")
  fetch("/data/cities.json")
    .then(res => res.json())
    .then(data => {
      const options = data.map(city => ({
        label: city,
        value: city
      }));
      setCityOptions(options);
    });

    // Load countries from local JSON
fetch("/data/countries.json")
  .then(res => res.json())
  .then(data => {
    const options = data.map(country => ({
      label: country,
      value: country
    }));
    setCountryOptions(options);
  });

  }, []);

  // ✅ Submit
 const handleSubmit = async (data) => {

//   const method = editIndex !== null ? 'PUT' : 'POST';
//   const url = editIndex !== null ? `${apiUrl}/${customers[editIndex].id}` : apiUrl;

//   try {
//     const res = await fetch(url, {
//       method,
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data)
//     });

//     if (!res.ok) {
//       const errorData = await res.json();

//       // ✅ If it has model validation errors
//       if (errorData && errorData.errors) {
//         const allErrors = Object.entries(errorData.errors)
//           .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
//           .join('\n');

//         toast.error(`Validation failed:\n${allErrors}`);
//         return;
//       }

//       // ✅ Generic error
//       throw new Error(errorData.message || 'Failed to save');
//     }

//     await res.json();
//     toast.success(`Customer ${editIndex !== null ? 'updated' : 'added'} ✅`);
//     setFormValues({});
//     setEditIndex(null);
//     fetchCustomers();

//   } catch (err) {
//     toast.error(err.message || "Error saving customer ❌");
//   }
// };

const method = isEditing ? 'PUT' : 'POST';
  const url = isEditing ? `${apiUrl}/${data.id}` : apiUrl;
  const payload = isEditing ? data : { ...data, customerCode: undefined };

  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(async res => {
      if (!res.ok) {
        const text = await res.text();
        let msg = "Failed";
        try {
          msg = JSON.parse(text).message || msg;
        } catch { msg = text || msg; }
        throw new Error(msg);
      }
      return res.status === 204 ? null : res.json();
    })
    .then(() => {
      toast.success(`Customer ${isEditing ? 'updated' : 'created'} ✅`);
      setFormValues({});
      setIsEditing(false);
      fetchCustomers();
    })
    .catch(err => toast.error(err.message || "Failed to save ❌"));
};
  // // ✅ Edit
  // const handleEdit = (index) => {
  //   setFormValues(customers[index]);
  //   setEditIndex(index);
  // };

  // // ✅ Delete
  // const handleDelete = (index) => {
  //   const id = customers[index].id;
  //   fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
  //     .then((res) => {
  //       if (!res.ok) throw new Error("Delete failed");
  //       toast.success("Customer deleted ✅");
  //       fetchCustomers();
  //     })
  //     .catch(() => toast.error("Failed to delete ❌"));
  // };

  const handleEdit = (index) => {
  const selected = customers[index];
  setFormValues(selected);
  setIsEditing(true);
};

const handleDelete = (id) => {
  if (!window.confirm("Are you sure you want to delete this customer?")) return;

  fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Customer deleted ✅");
      fetchCustomers();
    })
    .catch(() => toast.error("Failed to delete ❌"));
};


  const columns = ['customerCode', 'name', 'email', 'contact', 'address', 'city', 'country','actions' ];
  const columnLabels = {
    customerCode: 'Customer Code',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    country: 'Country',
    actions: 'Actions'
    
    
  };

  const tableRows = customers.map((c, index) => ({
  ...c,
  actions: (
    <>
      <button className="btn edit-btn" onClick={() => handleEdit(index)}>Edit</button>
      <button className="btn delete-btn" onClick={() => handleDelete(c.id)} style={{ marginLeft: '6px' }}>
        Delete
      </button>
    </>
  )
}));


  return (
    <div style={{ paddingLeft: '30px', paddingRight: '30px'  }}>
      <h2>Customers</h2>
      <FormBuilder
  fields={fields}
  initialValues={formValues}
  onSubmit={handleSubmit}
  checkDuplicate={(name, value) => {
    if (name === 'email') return customers.some(c => c.email === value && c.id !== formValues.id);
    if (name === 'phone') return customers.some(c => c.phone === value && c.id !== formValues.id);
    return false;
  }}
/>

      <DataTable
        columns={columns}
        rows={tableRows}
        columnLabels={columnLabels}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default Customer;
