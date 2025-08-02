import React, { useState, useEffect } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { validateDateInRange } from '../components/validateDate';
import { getMinMaxDateRange } from '../components/getMinMaxDateRange';
import { formatDateTime } from '../components/dateFormatter';

function GoodsReceipt() {
  const navigate = useNavigate();

  const initialFormValues = {
    poID: '',
    supplierName: '',
    productName: '',
    quantityOrdered: '',
    pricePerUnit: '',
    totalPrice: '',
    poDate: '',
    quantityReceived: '',
    receiptDate: '',
    remarks: '',
    status: '' 
  };

  const [formValues, setFormValues] = useState(initialFormValues);
  const [receipts, setReceipts] = useState([]);
  const [poList, setPoList] = useState([]);
  const { min, max } = getMinMaxDateRange(1, 1);
const [isEditing, setIsEditing] = useState(false);
const [editingId, setEditingId] = useState(null);


  

  const fetchReceipts = () => {
    fetch('http://localhost:5186/api/GoodsReceipt')
      .then(res => res.json())
      .then(data => setReceipts(data))
      .catch(() => toast.error("Failed to load Goods Receipts"));
  };

  const fetchPOs = () => {
    fetch('http://localhost:5186/api/PurchaseOrder/po-dropdown')
      .then(res => res.json())
      .then(data => {
        const clean = data.map(po => ({
          value: po.value,
          label: po.label,
          supplierName: po.supplierName,
          productName: po.productName,
          quantityOrdered: po.quantityOrdered,
          pricePerUnit: po.pricePerUnit,
          totalPrice: po.totalPrice,
          poDate: po.poDate
        }));
        setPoList(clean);
      })
      .catch(() => toast.error("Failed to load Purchase Orders"));
  };

  useEffect(() => {
    fetchReceipts();
    fetchPOs();
  }, []);

  const poOptions = poList.map(po => ({
    value: po.value,
    label: po.label
  }));

  const handleFieldChange = (fieldName, value, setFormValues) => {
    setFormValues(prev => {
      const updated = { ...prev, [fieldName]: value };

      if (fieldName === 'poID') {
        const selected = poList.find(p => p.value === parseInt(value));
        if (selected) {
          updated.supplierName = selected.supplierName || '';
          updated.productName = selected.productName || '';
          updated.quantityOrdered = selected.quantityOrdered && selected.quantityOrdered > 0
            ? selected.quantityOrdered.toString()
            : '1';
          updated.pricePerUnit = selected.pricePerUnit && selected.pricePerUnit > 0
            ? selected.pricePerUnit.toString()
            : '1';
          updated.totalPrice = selected.totalPrice != null
            ? selected.totalPrice.toString()
            : (selected.pricePerUnit * selected.quantityOrdered).toString();
          updated.poDate = selected.poDate
            ? new Date(selected.poDate).toISOString().split('T')[0]
            : '';
        }
      }

      return updated;
    });
  };

  const fields = [
    { name: 'poID', label: 'Purchase Order', type: 'select', options: poOptions, disabled: isEditing },
    { name: 'supplierName', label: 'Supplier Name', type: 'text', disabled: true },
    { name: 'productName', label: 'Product Name', type: 'text', disabled: true },
    { name: 'quantityOrdered', label: 'Quantity Ordered', type: 'number', disabled: true },
    { name: 'pricePerUnit', label: 'Price Per Unit', type: 'number', disabled: true },
    { name: 'totalPrice', label: 'Total Price', type: 'number', disabled: true },
    { name: 'poDate', label: 'PO Date', type: 'date', disabled: true },
    { name: 'quantityReceived', label: 'Quantity Received', type: 'number', disabled: isEditing },
    { name: 'receiptDate', label: 'Receipt Date', type: 'date', min, max, disabled: isEditing },
    { name: 'remarks', label: 'Remarks', type: 'textarea',disabled: isEditing},
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Used', 'Cancelled'] }
  ];

  const handleSubmit = (data) => {
       const dateCheck = validateDateInRange(data.receiptDate, { minDays: 0, maxDays: 2 });
            if (!dateCheck.valid) {
              toast.error(dateCheck.message + "❌");
              return;
            }
    if (parseInt(data.quantityReceived) > parseInt(formValues.quantityOrdered)) {
      toast.error("Quantity Received cannot be greater than Quantity Ordered ❌");
      return;
    }

    const payload = {
      ...data,
      quantityOrdered: formValues.quantityOrdered ? parseInt(formValues.quantityOrdered) : 1,
      pricePerUnit: formValues.pricePerUnit ? parseFloat(formValues.pricePerUnit) : 1,
      totalPrice: formValues.totalPrice ? parseFloat(formValues.totalPrice) : 0,
      poDate: formValues.poDate ? new Date(formValues.poDate).toISOString() : new Date().toISOString(),
      quantityReceived: data.quantityReceived ? parseInt(data.quantityReceived) : 0,
      receiptDate: data.receiptDate ? new Date(data.receiptDate).toISOString().split('T')[0] : '',
      remarks: data.remarks || "",
       status: data.status || "Active"  // ✅ Add this
    };

    console.log('🚀 Submitting Payload:', payload);

  //   fetch('http://localhost:5186/api/GoodsReceipt', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(payload)
  //   })
  //     .then(res => {
  //       if (!res.ok) throw new Error("Failed to submit");
  //       return res.json();
  //     })
  //     .then(() => {
  //       toast.success("Goods Receipt saved ✅");

  //       setFormValues(initialFormValues);

  //       fetchReceipts();
  //       setTimeout(() => navigate('/supplier-invoice'), 2000);
  //     })
  //     .catch(() => toast.error("Quantity Received is greater than Quantity Ordered. ❌"));
  // };
const method = isEditing ? 'PUT' : 'POST';
const url = isEditing
  ? `http://localhost:5186/api/GoodsReceipt/${editingId}`
  : 'http://localhost:5186/api/GoodsReceipt';

fetch(url, {
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
  .then(async res => {
    if (!res.ok) {
      const errorMessage = await res.text();
      throw new Error(errorMessage);
    }

    if (res.status === 204) return {};
    return res.json();
  })
  .then(() => {
    toast.success(isEditing ? "Receipt updated ✅" : "Receipt saved ✅");
    setFormValues(initialFormValues);
    setIsEditing(false);
    setEditingId(null);
    fetchReceipts();
    if (!isEditing) {
      setTimeout(() => navigate('/supplier-invoice'), 2000);
    }
  })
  .catch((err) => {
    toast.error(err.message || "Failed to save/update receipt ❌");
  });
  }

 
  const handleEdit = (receipt) => {
    if (receipt.status === "Used") {
        toast.warn("Cannot edit a PO that is already marked as Used.");
        return;
      }
  setFormValues({
    ...receipt,
    poID: receipt.poID.toString(),
    receiptDate: receipt.receiptDate?.split('T')[0],
    poDate: receipt.poDate?.split('T')[0]
  });
  setIsEditing(true);
  setEditingId(receipt.id);
};

const handleDelete = async (id) => {
  if (window.confirm("Are you sure you want to delete this receipt?")) {
    try {
      const res = await fetch(`http://localhost:5186/api/GoodsReceipt/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Receipt deleted ✅");
      fetchReceipts();
    } catch {
      toast.error("Failed to delete ❌");
    }
  }
};


//   const tableRows = receipts.map(receipt => ({
//   ...receipt,
//   actions: (
//     <>
//       <button className="btn edit-btn" onClick={() => handleEdit(receipt)}>Edit</button>
//       <button className="btn delete-btn" onClick={() => handleDelete(receipt.id)} style={{ marginLeft: '6px' }}>
//         Delete
//       </button>
//     </>
//   )
// }));

 const tableRows = receipts.map(receipt => ({
  ...receipt,
  actions: (
    <>
      {(receipt.status === 'Active' || receipt.status === 'Cancelled') ? (
        <>
          <button className="btn edit-btn" onClick={() => handleEdit(receipt)}>Edit</button>
          <button className="btn delete-btn" onClick={() => handleDelete(receipt.id)} style={{ marginLeft: '6px' }}>
            Delete
          </button>
        </>
      ) : (
        <span style={{ color: 'gray', fontStyle: 'italic' }}>Locked 🔒</span>
      )}
    </>
  )
}));



  const columns = [
    'grnCode',
    'poCode',  // ✅ Add this
    'supplierCode',
    // 'poID',
    'supplierName',
    'productName',
    'quantityOrdered',
    'pricePerUnit',
    'totalPrice',
    'quantityReceived',
    'receiptDate',
    'status',
    'actions'
  ];

  const columnLabels = {
    grnCode: 'GRN Code',
    poCode: 'PO Code',  // ✅ Add this line
    supplierCode: 'Supplier Code',
    // poID: 'PO Code',
    supplierName: 'Supplier',
    productName: 'Product',
    quantityOrdered: 'Qty Ordered',
    pricePerUnit: 'Price/Unit',
    totalPrice: 'Total',
    quantityReceived: 'Qty Received',
    receiptDate: 'Receipt Date',
    status: 'Status',
    actions: 'Actions'
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Goods Receipt</h2>
      <FormBuilder
        fields={fields}
        initialValues={formValues}
        onSubmit={handleSubmit}
        onFieldChange={handleFieldChange}
      />
      <DataTable
        columns={columns}
        columnLabels={columnLabels}
        // rows={receipts}
         rows={tableRows}
        exportFileName="GoodsReceipts"
         resolveDisplayValue={(col, value) => {
                  if (col === 'receiptDate') return formatDateTime(value);
                  return value;
                }}
      />
    </div>
  );
}

export default GoodsReceipt;
