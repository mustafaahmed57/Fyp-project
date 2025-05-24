import React, { useEffect, useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';

function PurchaseOrder() {
  const [formValues, setFormValues] = useState({});
  const [poList, setPoList] = useState([]);
  const [prList, setPrList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);

  const fetchPOs = () => {
    fetch('http://localhost:5186/api/PurchaseOrder')
      .then(res => res.json())
      .then(data => setPoList(data))
      .catch(() => toast.error("Failed to load Purchase Orders"));
  };

  const fetchPRs = () => {
    fetch('http://localhost:5186/api/PurchaseOrder/pr-dropdown')
      .then(res => res.json())
      .then(data => {
        const clean = data.map(pr => ({
          value: pr.value,
          label: `PR${pr.value.toString().padStart(5, '0')}`,
          productName: pr.productName,
          quantity: pr.quantity
        }));
        setPrList(clean);
      })
      .catch(() => toast.error("Failed to load Purchase Requests"));
  };

  const fetchSuppliers = () => {
    fetch('http://localhost:5186/api/PurchaseOrder/supplier-dropdown')
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

  useEffect(() => {
    fetchPOs();
    fetchPRs();
    fetchSuppliers();
  }, []);

  const handleFieldChange = (name, value, setFormValues) => {
  setFormValues((prev) => {
    const updated = { ...prev, [name]: value };

    // Auto-fill product and quantity from selected PR
    if (name === 'prId') {
      const selected = prList.find(p => p.value === parseInt(value));
      if (selected) {
        updated.productName = selected.productName;
        updated.quantityOrdered = selected.quantity;
      }
    }

    // ✅ Live calculate total
    const quantity = parseFloat(updated.quantityOrdered || 0);
    const price = parseFloat(updated.pricePerUnit || 0);
    updated.totalPrice = quantity * price;

    return updated;
  });
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
    { name: 'prId', label: 'Purchase Request', type: 'select', options: prOptions },
    { name: 'supplierId', label: 'Supplier', type: 'select', options: supplierOptions },
    { name: 'productName', label: 'Product Name', type: 'text', disabled: true },
    { name: 'quantityOrdered', label: 'Quantity Ordered', type: 'number', disabled: true },
    { name: 'pricePerUnit', label: 'Price Per Unit', type: 'number' },
    { name: 'totalPrice', label: 'Total Price', type: 'number', disabled: true }, // ✅ Added here
    { name: 'poDate', label: 'PO Date', type: 'date' }
  ];

  const handleSubmit = (data) => {
    const payload = {
      ...data,
      quantityOrdered: parseInt(data.quantityOrdered),
      pricePerUnit: parseFloat(data.pricePerUnit),
      poDate: new Date(data.poDate).toISOString()
    };

    fetch('http://localhost:5186/api/PurchaseOrder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to save");
        return res.json();
      })
      .then(saved => {
        setPoList(prev => [...prev, saved]);
        toast.success("Purchase Order submitted ✅");
        setFormValues({});
      })
      .catch(() => toast.error("Error submitting PO ❌"));
  };

  const columns = [
    "poCode",
    "prId",
    "supplierId",
    "productName",
    "quantityOrdered",
    "pricePerUnit",
    "totalPrice",
    "status",
    "poDate"
  ];

  const columnLabels = {
    poCode: "PO Code",
    prId: "PR Code",
    supplierId: "Supplier",
    productName: "Product",
    quantityOrdered: "Quantity",
    pricePerUnit: "Unit Price",
    totalPrice: "Total",
    status: "Status",
    poDate: "PO Date"
  };

  const resolveDisplayValue = (column, value, row) => {
  if (column === 'prId') {
    const pr = prList.find(p => p.value === value);
    return pr ? pr.label : value;
  }

  if (column === 'supplierId') {
    const s = supplierList.find(s => s.value === value);
    return s ? s.label : value;
  }

  if (column === 'poDate') {
    if (!value) return 'N/A';
    const date = new Date(value);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // ✅ NEW: status badge logic
  if (column === 'status') {
    const today = new Date();
    const poDate = new Date(row.poDate);
    const isOverdue = poDate < new Date(today.setHours(0, 0, 0, 0));

    const badgeStyle = {
      backgroundColor: isOverdue ? '#f87171' : '#38bdf8',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '8px',
      fontWeight: 'bold',
      display: 'inline-block',
      minWidth: '80px',
      textAlign: 'center'
    };

    return (
      <span style={badgeStyle}>
        {isOverdue ? 'Overdue' : 'Upcoming'}
      </span>
    );
  }

  return value;
};


  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Purchase Order</h2>
      <FormBuilder
        fields={fields}
        initialValues={formValues}
        onSubmit={handleSubmit}
        onFieldChange={handleFieldChange}
      />
      <DataTable
        columns={columns}
        columnLabels={columnLabels}
        rows={poList}
        resolveDisplayValue={resolveDisplayValue}
        exportFileName="PurchaseOrders"
      />
    </div>
  );
}

export default PurchaseOrder;
