import React, { useState, useEffect } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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
    remarks: ''
  };

  const [formValues, setFormValues] = useState(initialFormValues);
  const [receipts, setReceipts] = useState([]);
  const [poList, setPoList] = useState([]);

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
    { name: 'poID', label: 'Purchase Order', type: 'select', options: poOptions },
    { name: 'supplierName', label: 'Supplier Name', type: 'text', disabled: true },
    { name: 'productName', label: 'Product Name', type: 'text', disabled: true },
    { name: 'quantityOrdered', label: 'Quantity Ordered', type: 'number', disabled: true },
    { name: 'pricePerUnit', label: 'Price Per Unit', type: 'number', disabled: true },
    { name: 'totalPrice', label: 'Total Price', type: 'number', disabled: true },
    { name: 'poDate', label: 'PO Date', type: 'date', disabled: true },
    { name: 'quantityReceived', label: 'Quantity Received', type: 'number' },
    { name: 'receiptDate', label: 'Receipt Date', type: 'date' },
    { name: 'remarks', label: 'Remarks', type: 'textarea' }
  ];

  const handleSubmit = (data) => {
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
      remarks: data.remarks || ""
    };

    console.log('🚀 Submitting Payload:', payload);

    fetch('http://localhost:5186/api/GoodsReceipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to submit");
        return res.json();
      })
      .then(() => {
        toast.success("Goods Receipt saved ✅");

        setFormValues(initialFormValues);

        fetchReceipts();
        setTimeout(() => navigate('/supplier-invoice'), 2000);
      })
      .catch(() => toast.error("Submission failed ❌"));
  };

  const columns = [
    'grnCode',
    'poID',
    'supplierName',
    'productName',
    'quantityOrdered',
    'pricePerUnit',
    'totalPrice',
    'quantityReceived',
    'receiptDate',
    'status'
  ];

  const columnLabels = {
    grnCode: 'GRN Code',
    poID: 'PO Code',
    supplierName: 'Supplier',
    productName: 'Product',
    quantityOrdered: 'Qty Ordered',
    pricePerUnit: 'Price/Unit',
    totalPrice: 'Total',
    quantityReceived: 'Qty Received',
    receiptDate: 'Receipt Date',
    status: 'Status'
  };

  const resolveDisplayValue = (column, value) => {
    if (column === 'poID') {
      const po = poList.find(p => p.value === value);
      return po ? po.label : value;
    }

    if (column === 'receiptDate') {
      if (!value) return 'N/A';
      const date = new Date(value);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    if (column === 'status') {
      const badgeStyle = {
        backgroundColor: value === "Pending" ? '#fbbf24' :
                         value === "Approved" ? '#34d399' :
                         value === "Cancelled" ? '#f87171' : '#d1d5db',
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
          {value}
        </span>
      );
    }

    return value;
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
        rows={receipts}
        resolveDisplayValue={resolveDisplayValue}
        exportFileName="GoodsReceipts"
      />
    </div>
  );
}

export default GoodsReceipt;
