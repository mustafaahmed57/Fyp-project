import React, { useEffect, useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { validateDateInRange } from '../components/validateDate';
import { getMinMaxDateRange } from '../components/getMinMaxDateRange';
import { formatDateTime } from '../components/dateFormatter';

function PurchaseRequest() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { min, max } = getMinMaxDateRange(0, 7);

  const apiUrl = 'http://localhost:5186/api/PurchaseRequest';

  const fetchRequests = () => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(() => toast.error("Failed to load purchase requests ❌"));
  };

  const fetchUsers = () => {
    fetch(`${apiUrl}/users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => toast.error("Failed to load users ❌"));
  };

  const fetchProducts = () => {
    fetch(`${apiUrl}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => toast.error("Failed to load products ❌"));
  };

  useEffect(() => {
    fetchRequests();
    fetchUsers();
    fetchProducts();
    setFormValues({ status: 'Active' }); // 👈 Set default here
  }, []);

 const fields = [
  // { name: 'requestedBy', label: 'Requested By', type: 'select', options: users, readOnly: isEditing },
  // { name: 'productName', label: 'Product Name', type: 'select', options: products, readOnly: isEditing },
  { name: 'requestedBy', label: 'Requested By', type: 'select', options: users, disabled: isEditing },
{ name: 'productName', label: 'Product Name', type: 'select', options: products, disabled: isEditing },
  { name: 'quantity', label: 'Quantity Needed', type: 'number', readOnly: isEditing },
  { name: 'costPrice', label: 'Cost Price', type: 'number', readOnly: true },
  { name: 'total', label: 'Total Cost', type: 'number', readOnly: true },
  { name: 'requiredDate', label: 'Required Date', type: 'date', min, max, },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'Active' },
      { label: 'Used', value: 'Used' },
      { label: 'Cancelled', value: 'Cancelled' }
    ],
    // readOnly: false  // 🔓 Always editable
     disabled: !isEditing  // 👈 disabled when creating, enabled when editing
  }
];


  // const handleFieldChange = (fieldName, value, setFormData) => {
  //   if (fieldName === 'productName') {
  //     const selectedProduct = products.find(p => p.value === value);
  //     if (selectedProduct) {
  //       setFormData(prev => ({
  //         ...prev,
  //         productName: value,
  //         costPrice: selectedProduct.costPrice
  //       }));
  //     }
  //   }
    
  //   else {
  //     setFormData(prev => ({
  //       ...prev,
  //       [fieldName]: value
  //     }));
  //   }
  // };
  const handleFieldChange = (fieldName, value, setFormData) => {
  setFormData(prev => {
    let updated = { ...prev, [fieldName]: value };

    if (fieldName === 'productName') {
      const selectedProduct = products.find(p => p.value === value);
      if (selectedProduct) {
        updated.costPrice = selectedProduct.costPrice;
      }
    }

    // ✅ Auto-calculate total if quantity and costPrice are available
    const quantity = parseFloat(updated.quantity);
    const costPrice = parseFloat(updated.costPrice);
    if (!isNaN(quantity) && !isNaN(costPrice)) {
      updated.total = quantity * costPrice;
    }

    return updated;
  });
};


  const handleSubmit = async (data) => {
    if (!data.requiredDate) {
    toast.error("Required Date is required ❌");
    return;
  }
    const fixedData = {
      ...data,
      requestedBy: parseInt(data.requestedBy),
      quantity: parseInt(data.quantity),
      costPrice: parseFloat(data.costPrice),
       total: parseFloat(data.total)
    };

    const dateCheck = validateDateInRange(data.requiredDate, { minDays: 0, maxDays: 2 });
    if (!dateCheck.valid) {
      toast.error(dateCheck.message + " ❌");
      return;
    }

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${apiUrl}/${data.id}` : apiUrl;
    const payload = isEditing ? { ...fixedData, id: data.id } : fixedData;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // if (!res.ok) {
      //   const text = await res.text();
      //   let msg = "Failed";
      //   try {
      //     const json = JSON.parse(text);
      //     msg = json.message || msg;
      //   } catch {
      //     msg = text || msg;
      //   }
      //   throw new Error(msg);
      // }
      if (!res.ok) {
  const text = await res.text();
let msg = "Failed";
try {
  const json = JSON.parse(text);
  msg = json.title || json.message || msg;
} catch {
  msg = text || msg;
}
// throw new Error(JSON.stringify({ title: msg }));
throw new Error(msg);
      }


      toast.success(`Request ${isEditing ? 'updated' : 'submitted'} ✅`);
      // setFormValues({});
      setFormValues({ status: 'Active' }); // 👈 Reset to default after submit
      setIsEditing(false);
      fetchRequests();
      if (!isEditing) setTimeout(() => navigate('/purchase-order'), 2000);
    } catch (err) {
      toast.error(err.message || "Server error ❌");
    }
  };

  const handleEdit = (index) => {
    const selected = requests[index];
    setFormValues({
      ...selected,
      requiredDate: selected.requiredDate?.split('T')[0]
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        const res = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Delete failed");
        toast.success("Request deleted ✅");
        fetchRequests();
      } catch {
        toast.error("Failed to delete ❌");
      }
    }
  };

  const columns = [
    'prCode',
    'requestedBy',
    'productName',
    'quantity',
    'costPrice',
     'total',   
    'requiredDate',
    'requestDate',
    'status',
    'actions'
  ];

  const columnLabels = {
    prCode: 'PR Code',
    requestedBy: 'Requested By',
    productName: 'Product',
    quantity: 'Quantity',
    costPrice: 'Cost Price',
    total: 'Total Cost', 
    requiredDate: 'Required Date',
    requestDate: 'Request Date',
    status: 'Status',
    actions: 'Actions'
  };
  
 const tableRows = requests.map((req, index) => ({
  ...req,
  actions: (
    <>
      {(req.status === 'Active' || req.status === 'Cancelled') ? (
        <>
          <button className="btn edit-btn" onClick={() => handleEdit(index)}>Edit</button>
          <button
            className="btn delete-btn"
            onClick={() => handleDelete(req.id)}
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
    <div style={{ paddingLeft: '15px', paddingRight: '10px' }}>
      <h2>Purchase Request (PR)s</h2>
      <FormBuilder
        fields={fields}
        initialValues={formValues}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
      />
      <DataTable
        columns={columns}
        rows={tableRows}
        columnLabels={columnLabels}
        resolveDisplayValue={(col, value) => {
          if (col === 'requestedBy') {
            const user = users.find(u => u.value === value);
            return user ? user.label : value;
          }
          if (col === 'requiredDate' || col === 'requestDate') {
            return formatDateTime(value);
          }
          return value;
        }}
      />
    </div>
  );
}

export default PurchaseRequest;
