import React, { useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';


function GoodsReceipt() {
  const [receipts, setReceipts] = useState([]);

  const fields = [
    { name: 'poID', label: 'PO ID', type: 'number' },
    { name: 'supplierName', label: 'Supplier Name', type: 'text' },
    { name: 'productName', label: 'Product Name', type: 'text' },
    { name: 'quantityReceived', label: 'Quantity Received', type: 'number' },
    { name: 'receiptDate', label: 'Receipt Date', type: 'date' },
  ];

  // const handleSubmit = (data) => {
  //   const grnID = receipts.length + 1;
  //   const newEntry = { ...data, grnID };
  //   setReceipts((prev) => [...prev, newEntry]);
  // };

  const handleSubmit = (data) => {
  const receiptDate = new Date().toISOString().split('T')[0];
  const newEntry = { ...data, ReceiptID: receipts.length + 1, ReceiptDate: receiptDate };
  setReceipts((prev) => [...prev, newEntry]);
  toast.success("Goods Received ✅");
};


  const columns = [
    'grnID',
    'poID',
    'supplierName',
    'productName',
    'quantityReceived',
    'receiptDate',
  ];

  return (
    <div>
      <h2>Goods Receipt</h2>
      <FormBuilder fields={fields} onSubmit={handleSubmit} />
      <DataTable columns={columns} rows={receipts} />
    </div>
  );
}

export default GoodsReceipt;
