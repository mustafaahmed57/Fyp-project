import React, { useState, useEffect } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function SalesInquiry() {
  const [inquiries, setInquiries] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [formValues, setFormValues] = useState({ status: 'Active' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const navigate = useNavigate();

  const inquiryApi = 'http://localhost:5186/api/SalesInquiry';
  const customerApi = 'http://localhost:5186/api/Customers/dropdown-with-details';
  const productApi = 'http://localhost:5186/api/Products/dropdown-finished';

  const fields = [
  {
    name: 'customerCode',
    label: 'Customer',
    type: 'select',
    options: customerOptions.map(c => ({
      value: c.customerCode,
      label: `${c.customerCode} - ${c.name}`
    })),
    disabled: isEditing,  // disable when editing
  },
  { name: 'customerName', label: 'Customer Name', type: 'text', readOnly: true },
  { name: 'customerContact', label: 'Customer Contact', type: 'text', readOnly: true },
  { name: 'customerEmail', label: 'Customer Email', type: 'email', readOnly: true },
  {
    name: 'productRequested',
    label: 'Product Requested',
    type: 'select',
    options: productOptions,
    disabled: isEditing,  // disable when editing
  },
  { name: 'quantityRequested', label: 'Quantity Requested', type: 'number', readOnly: isEditing },
  { name: 'addsOnRequired', label: 'Adds On Required?', type: 'checkbox',  readOnly: isEditing},  // <-- use readOnly here so checkbox disables},
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'Active' },
      { label: 'Used', value: 'Used' },
      { label: 'Cancelled', value: 'Cancelled' }
    ],
    // disabled: false, // always enabled (editable)
     disabled: !isEditing
  }
];

  useEffect(() => {
    fetchInquiries();
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchInquiries = () => {
    fetch(inquiryApi)
      .then(res => res.json())
      .then(data => setInquiries(data))
      .catch(() => toast.error("Failed to load inquiries"));
  };

  const fetchCustomers = () => {
    fetch(customerApi)
      .then(res => res.json())
      .then(data => setCustomerOptions(data))
      .catch(() => toast.error("Failed to load customers"));
  };

  const fetchProducts = () => {
    fetch(productApi)
      .then(res => res.json())
      .then(data => setProductOptions(data))
      .catch(() => toast.error("Failed to load products"));
  };

  const handleFieldChange = (name, value, setForm) => {
    if (name === 'customerCode') {
      const selected = customerOptions.find(c => c.customerCode === value);
      if (selected) {
        setForm(prev => ({
          ...prev,
          customerCode: selected.customerCode,
          customerName: selected.name,
          customerContact: selected.contact,
          customerEmail: selected.email,
        }));
      }
    }
  };

 const handleSubmit = async (data) => {
  try {
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${inquiryApi}/${editId}` : inquiryApi;

    // Add InquiryID in payload when editing
    const payload = isEditing ? { ...data, InquiryID: editId } : data;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      toast.error(error.title || error.message || "Error saving inquiry ❌");
      return;
    }

    await res.json();

    toast.success(`Inquiry ${isEditing ? 'updated' : 'submitted'} ✅`);
    setFormValues({ status: 'Active' });
    setIsEditing(false);
    setEditId(null);
    fetchInquiries();

    if (!isEditing) setTimeout(() => navigate('/sales-order'), 2000);
  } catch {
    toast.error("Something went wrong ❌");
  }
};



  // Edit handler: Load inquiry data into form for editing
const handleEdit = (id) => {
  const inquiry = inquiries.find(i => i.inquiryID === id);
  if (inquiry) {
    setFormValues({
      ...inquiry,
      InquiryID: id,  // Add this line to keep the ID in formValues
    });
    setIsEditing(true);
    setEditId(id);
  }
};

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;

    try {
      const res = await fetch(`${inquiryApi}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");

      toast.success("Inquiry deleted ✅");
      fetchInquiries();
    } catch {
      toast.error("Failed to delete inquiry ❌");
    }
  };

  const columns = [
    'inquiryCode',
    'customerCode',
    'customerName',
    'customerContact',
    'customerEmail',
    'productRequested',
    'quantityRequested',
    'addsOnRequired',
    'inquiryDate',
    'status',
    'actions'
  ];

  const tableRows = inquiries.map((inquiry) => ({
  ...inquiry,
  inquiryDate: new Date(inquiry.inquiryDate).toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }),
  actions: (
    <>
      {(inquiry.status === 'Active' || inquiry.status === 'Cancelled') ? (
        <>
          <button
            className="btn edit-btn"
            onClick={() => handleEdit(inquiry.inquiryID)}
          >
            Edit
          </button>
          <button
            className="btn delete-btn"
            onClick={() => handleDelete(inquiry.inquiryID)}
            style={{ marginLeft: '6px' }}
          >
            Delete
          </button>
        </>
      ) : (
        <span style={{ color: 'gray', fontStyle: 'italic' }}>Locked 🔒</span>
      )}
    </>
  )
}));


  return (
    <div className="table-wrapper">
      <h2>Sales Inquiry</h2>
      <FormBuilder
        fields={fields}
        initialValues={formValues}
        setFormValues={setFormValues}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
      />
      <DataTable columns={columns} rows={tableRows} />
    </div>
  );
}

export default SalesInquiry;
