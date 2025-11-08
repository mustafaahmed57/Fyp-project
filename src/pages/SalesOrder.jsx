import React, { useState, useEffect } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function SalesOrder() {
  const [orders, setOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [addsOnRequired, setAddsOnRequired] = useState(false);
  // const [statusValue, setStatusValue] = useState({ status: 'Active' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formValues, setFormValues] = useState({ status: 'Active' });

  const navigate = useNavigate();

  const orderApi = 'http://localhost:5186/api/SalesOrder';
  // const inquiryApi = 'http://localhost:5186/api/SalesInquiry';
  const inquiryApi = 'http://localhost:5186/api/SalesOrder/available-inquiries';

  // Load Sales Orders
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    fetch(orderApi)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(() => toast.error("Failed to load sales orders"));
  };

  // // Load Inquiries
  // useEffect(() => {
  //   fetch(inquiryApi)
  //     .then(res => res.json())
  //     .then(data => setInquiries(data))
  //     .catch(() => toast.error("Failed to load inquiries"));
  // }, []);
  useEffect(() => {
  fetch(inquiryApi)
    .then(res => res.json())
    .then(data => {
      setInquiries(data);
    })
    .catch(() => toast.error("Failed to load available inquiries"));
}, []);

  const inquiryOptions = inquiries.map((inq) => ({
  value: inq.inquiryID,
  label: `SI${inq.inquiryID.toString().padStart(5, '0')} - ${inq.customerName}`
}));

  // const inquiryOptions = inquiries.map((inq) => ({
  //   value: inq.inquiryID,
  //   label: `SI${inq.inquiryID.toString().padStart(5, '0')} - ${inq.customerName}`
  // }));

  const fields = [
    {
      name: 'inquiryID',
      label: 'Sales Inquiry',
      type: 'select',
      options: inquiryOptions,
      disabled: isEditing
    },
    { name: 'customerName', label: 'Customer Name', type: 'text', disabled: true },
    { name: 'productName', label: 'Product Name', type: 'text', disabled: true },
    { name: 'customerContact', label: 'Customer Contact', type: 'text', disabled: true },
    { name: 'customerEmail', label: 'Customer Email', type: 'text', disabled: true },
    { name: 'quantityOrdered', label: 'Quantity Ordered', type: 'number', disabled: true },
    { name: 'pricePerUnit', label: 'Price Per Unit', type: 'number', readOnly: true },
    { name: 'totalAmount', label: 'Total Amount', type: 'number', readOnly: true, disabled: true },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: ['Active', 'Used', 'Cancelled'],
      disabled: !isEditing
    },
    ...(addsOnRequired
      ? [
          { name: 'addsOnDescription', label: 'Adds On Description', type: 'textarea' },
          { name: 'descriptionAmount', label: 'Description Amount', type: 'number', min: 0 }
        ]
      : []
    ),
    { name: 'addsOnRequired', type: 'hidden', value: !!addsOnRequired, required: false }
  ];

  const handleFieldChange = (fieldName, value, setFormValues) => {
    setFormValues(prev => {
      const newForm = { ...prev, [fieldName]: value };

      if (['quantityOrdered', 'pricePerUnit', 'descriptionAmount'].includes(fieldName)) {
        const quantity = parseFloat(newForm.quantityOrdered) || 0;
        const price = parseFloat(newForm.pricePerUnit) || 0;
        const descAmt = addsOnRequired ? (parseFloat(newForm.descriptionAmount) || 0) : 0;
        newForm.totalAmount = quantity * price + descAmt;
      }

      if (fieldName === 'inquiryID') {
        const selected = inquiries.find(i => i.inquiryID === parseInt(value));
        if (selected) {
          newForm.customerName = selected.customerName;
          newForm.productName = selected.productRequested;
          newForm.customerContact = selected.customerContact;
          newForm.customerEmail = selected.customerEmail;
          newForm.quantityOrdered = selected.quantityRequested;
          newForm.addsOnRequired = selected.addsOnRequired;
          newForm.status = 'Active';

          setAddsOnRequired(selected.addsOnRequired);
          // setStatusValue('Pending');

          fetch(`http://localhost:5186/api/Products/price?productName=${encodeURIComponent(selected.productRequested)}`)
            .then(res => res.json())
            .then(priceData => {
              setFormValues(prev2 => {
                const updated = { ...prev2, pricePerUnit: priceData.price };
                const qty = parseFloat(updated.quantityOrdered) || 0;
                const price = parseFloat(updated.pricePerUnit) || 0;
                const descAmt = addsOnRequired ? (parseFloat(updated.descriptionAmount) || 0) : 0;
                updated.totalAmount = qty * price + descAmt;
                return updated;
              });
            })
            .catch(() => toast.error("Failed to fetch product price ❌"));
        }
      }

      return newForm;
    });
  };

  const handleSubmit = async (data) => {
    if (addsOnRequired && !data.addsOnDescription?.trim()) {
      toast.error("Adds On Description is required.");
      return;
    }

    const orderDate = new Date().toISOString().split('T')[0];
    const totalAmount = parseFloat(data.quantityOrdered || 0) * parseFloat(data.pricePerUnit || 0) + (addsOnRequired ? parseFloat(data.descriptionAmount || 0) : 0);

    const payload = {
      ...data,
      totalAmount,
      addsOnRequired: Boolean(data.addsOnRequired),
      orderDate
    };

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${orderApi}/${editId}` : orderApi;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error("Failed to save: " + (error.message || '❌'));
        return;
      }

      toast.success(`Sales Order ${isEditing ? 'updated' : 'created'} ✅`);
      setFormValues({ status: 'Active' });
      setIsEditing(false);
      setEditId(null);
      fetchOrders();

      if (!isEditing) {
        setTimeout(() => navigate('/delivery-note'), 3000);
      }
    } catch {
      toast.error("Server error ❌");
    }
  };

  const handleEdit = (id) => {
    const order = orders.find(o => o.orderID === id);
    if (order) {
      setFormValues(order);
      setIsEditing(true);
      setEditId(id);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sales order?")) return;
    try {
      const res = await fetch(`${orderApi}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success("Sales Order deleted ✅");
      fetchOrders();
    } catch {
      toast.error("Failed to delete sales order ❌");
    }
  };

  const columns = [
    'orderCode',
    'customerName',
    // 'customerContact',
    // 'customerEmail',
    'productName',
    'quantityOrdered',
    'pricePerUnit',
    'descriptionAmount',
    'totalAmount',
    'addsOnRequired',
    'addsOnDescription',
    'status',
    'orderDate',
    'actions'
  ];

  const tableRows = orders.map(order => ({
    ...order,
    orderDate: new Date(order.orderDate).toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }),
    // addsOnDescription: order.addsOnDescription || 'N/A', // 👈 Default when empty
    addsOnDescription: order.addsOnDescription
  ? order.addsOnDescription
  : <span style={{ fontWeight: 'bold', color: '#888' }}>N/A</span>,

    actions: (
      <>
        <button className="btn edit-btn" onClick={() => handleEdit(order.orderID)}>Edit</button>
        <button className="btn delete-btn" style={{ marginLeft: '6px' }} onClick={() => handleDelete(order.orderID)}>Delete</button>
      </>
    )
  }));

//   const tableRows = orders.map(order => ({
//   ...order,
//   addsOnDescription: order.addsOnDescription
//     ? order.addsOnDescription
//     : <span style={{ fontWeight: 'bold', color: '#888' }}>N/A</span>,

//   actions: (
//     <>
//       {(order.status === 'Active' || order.status === 'Cancelled') ? (
//         <>
//           <button className="btn edit-btn" onClick={() => handleEdit(order.orderID)}>Edit</button>
//           <button
//             className="btn delete-btn"
//             style={{ marginLeft: '6px' }}
//             onClick={() => handleDelete(order.orderID)}
//           >
//             Delete
//           </button>
//         </>
//       ) : (
//         <span style={{ color: 'gray', fontStyle: 'italic' }}>Locked 🔒</span>
//       )}
//     </>
//   )
// }));


  return (
    <div className="table-wrapper">
      <h2>Sales Order</h2>
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

export default SalesOrder;
