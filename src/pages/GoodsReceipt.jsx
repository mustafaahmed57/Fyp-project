import React, { useState, useEffect } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function GoodsReceipt() {
  const [formValues, setFormValues] = useState({});
  const [receipts, setReceipts] = useState([]);
  const [poList, setPoList] = useState([]);
  const navigate = useNavigate();

  // ✅ Load existing receipts
  const fetchReceipts = () => {
    fetch('http://localhost:5186/api/GoodsReceipt')
      .then(res => res.json())
      .then(data => setReceipts(data))
      .catch(() => toast.error("Failed to load Goods Receipts"));
  };

  // ✅ Load PO Dropdown
  const fetchPOs = () => {
    fetch('http://localhost:5186/api/PurchaseOrder/po-dropdown')
      .then(res => res.json())
      .then(data => setPoList(data))
      .catch(() => toast.error("Failed to load Purchase Orders"));
  };

  useEffect(() => {
    fetchReceipts();
    fetchPOs();
  }, []);

  const poOptions = poList.map(po => ({
    value: po.value,
    label: po.label,
    supplierName: po.supplierName,
    productName: po.productName
  }));

  const handleFieldChange = (fieldName, value, setFormValues) => {
    if (fieldName === 'poID') {
      const selected = poOptions.find(p => p.value === parseInt(value));
      if (selected) {
        setFormValues(prev => ({
          ...prev,
          supplierName: selected.supplierName,
          productName: selected.productName
        }));
      }
    }
  };

  const fields = [
    { name: 'poID', label: 'Purchase Order', type: 'select', options: poOptions },
    { name: 'supplierName', label: 'Supplier Name', type: 'text', disabled: true },
    { name: 'productName', label: 'Product Name', type: 'text', disabled: true },
    { name: 'quantityReceived', label: 'Quantity Received', type: 'number' },
    { name: 'receiptDate', label: 'Receipt Date', type: 'date' }
  ];

  const handleSubmit = (data) => {
    fetch('http://localhost:5186/api/GoodsReceipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to submit");
        return res.json();
      })
      .then(() => {
        toast.success("Goods Receipt saved ✅");
        setFormValues({});
        fetchReceipts();
        setTimeout(() => navigate('/supplier-invoice'), 2000);
      })
      .catch(() => toast.error("Submission failed ❌"));
  };

  const columns = [
    // 'grnID',
    'grnCode', // ✅ Show GRN00001 here
    'poID',
    'supplierName',
    'productName',
    'quantityReceived',
    'receiptDate'
  ];

  const columnLabels = {
    grnID: 'GRN ID',
    poID: 'PO ID',
    grnCode: 'GRN Code', // 🆕
    supplierName: 'Supplier',
    productName: 'Product',
    quantityReceived: 'Quantity Received',
    receiptDate: 'Receipt Date'
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
        exportFileName="GoodsReceipts"
      />
    </div>
  );
}

export default GoodsReceipt;
