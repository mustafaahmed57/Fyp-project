import React, { useEffect, useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import { validateDateInRange } from '../components/validateDate';
import { getMinMaxDateRange } from '../components/getMinMaxDateRange';
import { formatDateTime } from '../components/dateFormatter';

function PurchaseOrder() {
  const [formValues, setFormValues] = useState({});
  const [poList, setPoList] = useState([]);
  const [prList, setPrList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const apiUrl = 'http://localhost:5186/api/PurchaseOrder';

  const { min, max } = getMinMaxDateRange(1, 1);

  const fetchPOs = () => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => setPoList(data))
      .catch(() => toast.error("Failed to load Purchase Orders"));
  };

  const fetchPRs = () => {
    fetch(`${apiUrl}/pr-dropdown`)
      .then(res => res.json())
      .then(data => {
        const clean = data.map(pr => ({
          value: pr.value,
          label: pr.label,
          productName: pr.productName,
          quantity: pr.quantity,
          costPrice: pr.costPrice
        }));
        setPrList(clean);
      })
      .catch(() => toast.error("Failed to load Purchase Requests"));
  };

  const fetchSuppliers = () => {
    fetch(`${apiUrl}/supplier-dropdown`)
      .then(res => res.json())
      .then(data => {
        const clean = data.map(sup => ({
          value: sup.value,
          label: sup.label
        }));
        setSupplierList(clean);
      })
      .catch(() => toast.error("Failed to load Suppliers"));
  };

  // useEffect(() => {
  //   fetchPOs();
  //   fetchPRs();
  //   fetchSuppliers();
    
  // }, []);
  useEffect(() => {
  fetchPOs();
  fetchPRs();
  fetchSuppliers();
  if (!isEditing) {
    setFormValues({ status: 'Active' }); // ✅ Default value
  }
}, [isEditing]);


  const handleFieldChange = (name, value, setFormValues) => {
    setFormValues((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === 'prId') {
        const selected = prList.find(p => p.value === parseInt(value));
        if (selected) {
          updated.productName = selected.productName;
          updated.quantityOrdered = selected.quantity;
          updated.pricePerUnit = selected.costPrice;
          updated.totalPrice = selected.quantity * selected.costPrice;
        }
      }

      const qty = parseFloat(updated.quantityOrdered || 0);
      const price = parseFloat(updated.pricePerUnit || 0);
      updated.totalPrice = qty * price;

      return updated;
    });
  };

  const handleSubmit = (data) => {
    if (!isEditing) {
      const dateCheck = validateDateInRange(data.poDate, { minDays: 0, maxDays: 2 });
      if (!dateCheck.valid) {
        toast.error(dateCheck.message + "❌");
        return;
      }
    }

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${apiUrl}/${data.id}` : apiUrl;

    const payload = isEditing
      ? {status: data.status }
      : {
          ...data,
          quantityOrdered: parseInt(data.quantityOrdered),
          pricePerUnit: parseFloat(data.pricePerUnit),
          totalPrice: parseFloat(data.totalPrice),
          poDate: new Date(data.poDate).toISOString().split('T')[0]
        };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to save");
        return isEditing ? null : res.json();
      })
      .then(saved => {
        if (!isEditing) {
          setPoList(prev => [saved, ...prev]);
        } else {
          fetchPOs();
        }
        toast.success(isEditing ? "Order updated ✅" : "Order created ✅");
        // setFormValues({});
        setFormValues({ status: 'Active' }); // ✅ Reset to Active
        setIsEditing(false);
      })
      .catch(() => toast.error("Error submitting PO ❌"));
  };

const handleEdit = (selected) => {
   if (selected.status === "Used") {
    toast.warn("Cannot edit a PO that is already marked as Used.");
    return;
  }
  setFormValues({
    ...selected,
    poDate: selected.poDate?.split('T')[0]
  });
  setIsEditing(true);
};



  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        const res = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Delete failed");
        toast.success("Order deleted ✅");
        fetchPOs();
      } catch {
        toast.error("Failed to delete ❌");
      }
    }
  };

  const prOptions = prList.map(pr => ({
    value: pr.value,
    label: pr.label
  }));

  const supplierOptions = supplierList.map(s => ({
    value: s.value,
    label: s.label
  }));

  const fields = [
    { name: 'prId', label: 'Purchase Request', type: 'select', options: prOptions, disabled: isEditing },
    { name: 'supplierId', label: 'Supplier', type: 'select', options: supplierOptions, disabled: isEditing },
    { name: 'productName', label: 'Product Name', type: 'text', disabled: true },
    { name: 'quantityOrdered', label: 'Quantity Ordered', type: 'number', disabled: true },
    { name: 'pricePerUnit', label: 'Price Per Unit', type: 'number', disabled: true },
    { name: 'totalPrice', label: 'Total Price', type: 'number', disabled: true },
    { name: 'poDate', label: 'PO Date', type: 'date', min, max, disabled: isEditing },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Used', 'Cancelled'],  disabled: !isEditing }
  ];

  const columns = [
    "poCode", "prCode", "supplierCode", "supplierName",
    "productName", "quantityOrdered", "pricePerUnit", "total", "poDate","status","actions"
  ];

  const columnLabels = {
    poCode: "PO Code",
    prCode: "PR Code",
    supplierCode: "Supplier Code",
    supplierName: "Supplier Name",
    productName: "Product Name",
    quantityOrdered: "Quantity",
    pricePerUnit: "Unit Price",
    total: "Total",
    poDate: "PO Date",
     status: "Status", // ✅ Add this
      actions: "Actions" // ✅ Add this
  };

  const tableRows = poList.map(po => ({
  ...po,
  actions: (
    <>
      {(po.status === 'Active' || po.status === 'Cancelled') ? (
        <>
          <button className="btn edit-btn" onClick={() => handleEdit(po)}>Edit</button>
          <button className="btn delete-btn" onClick={() => handleDelete(po.id)} style={{ marginLeft: '6px' }}>
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
    <div style={{ paddingLeft: '15px', paddingRight: '10px'}}>
      <h2>Purchase Order (PO)</h2>
      <FormBuilder
        fields={fields}
        initialValues={formValues}
        onSubmit={handleSubmit}
        onFieldChange={handleFieldChange}
      />
      <DataTable
        columns={columns}
        columnLabels={columnLabels}
        rows={tableRows}
        // onEdit={handleEdit}
        // onDelete={handleDelete}
        resolveDisplayValue={(col, value) => {
          if (col === 'poDate') return formatDateTime(value);
          return value;
        }}
        exportFileName="PurchaseOrders"
      />
    </div>
  );
}

export default PurchaseOrder;
