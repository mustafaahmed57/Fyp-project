import React, { useEffect, useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import InvoicePrint from './InvoicePrint';
import InvoiceModal from '../components/InvoiceModal'; // ✅ Your custom modal

function SupplierInvoice() {
  const [formValues, setFormValues] = useState({});
  const [invoiceList, setInvoiceList] = useState([]);
  const [grnList, setGrnList] = useState([]);

  // ✅ New modal logic
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // 🔁 Fetch all invoices
  const fetchInvoices = () => {
    fetch('http://localhost:5186/api/SupplierInvoice')
      .then(res => res.json())
      .then(data => setInvoiceList(data))
      .catch(() => toast.error("Failed to load invoices"));
  };

  // 🔁 Load GRNs for dropdown
  const fetchGRNs = () => {
    fetch('http://localhost:5186/api/SupplierInvoice/grn-dropdown')
      .then(res => res.json())
      .then(data => setGrnList(data))
      .catch(() => toast.error("Failed to load GRNs"));
  };

  useEffect(() => {
    fetchInvoices();
    fetchGRNs();
  }, []);

  const handleFieldChange = (fieldName, value, setFormValues) => {
    if (fieldName === 'grnID') {
      const selected = grnList.find(grn => grn.value === parseInt(value));
      if (selected) {
        setFormValues(prev => ({
          ...prev,
          grnCode: selected.label,
          supplierName: selected.supplierName,
          productName: selected.productName,
          quantityInvoiced: selected.quantity
        }));
      }
    }
  };

  const handleSubmit = (data) => {
    fetch('http://localhost:5186/api/SupplierInvoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to save invoice");
        return res.json();
      })
      .then(saved => {
        toast.success("Supplier Invoice created ✅");
        setFormValues({});
        setInvoiceList(prev => [...prev, saved]);
      })
      .catch(err => toast.error(err.message));
  };

  // ✅ New modal open
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoice(true);
  };

  // 🖨️ Old logic - now disabled
  // const handlePrint = (invoice) => {
  //   setPrintInvoice(invoice);
  //   setTimeout(() => {
  //     window.print();
  //     setPrintInvoice(null);
  //   }, 300);
  // };

  const columns = [
    // 'invoiceID',
    'sinvCode',
    'grnCode',
    'supplierName',
    'productName',
    'quantityInvoiced',
    'pricePerUnit',
    'totalAmount',
    'invoiceDate',
    'actions'
  ];

  const columnLabels = {
    invoiceID: 'Invoice ID',
    sinvCode: 'Invoice Code',
    grnCode: 'GRN Code',
    supplierName: 'Supplier',
    productName: 'Product',
    quantityInvoiced: 'Quantity',
    pricePerUnit: 'Unit Price',
    totalAmount: 'Total',
    invoiceDate: 'Invoice Date',
    actions: 'Actions'
  };

  const resolveDisplayValue = (col, val, row) => {
    if (col === 'totalAmount') {
      return (row.quantityInvoiced * row.pricePerUnit).toFixed(2);
    }
    if (col === 'actions') {
      return (
        <button className="btn view" onClick={() => handleViewInvoice(row)}>
          View Invoice
        </button>
        // 🖨️ Old logic
        // <button onClick={() => handlePrint(row)}>🖨 Print</button>
      );
    }
    return val;
  };

  const fields = [
    { name: 'grnID', label: 'GRN', type: 'select', options: grnList },
    { name: 'grnCode', label: 'GRN Code', type: 'text', disabled: true },
    { name: 'supplierName', label: 'Supplier Name', type: 'text', disabled: true },
    { name: 'productName', label: 'Product Name', type: 'text', disabled: true },
    { name: 'quantityInvoiced', label: 'Quantity Invoiced', type: 'number', disabled: true },
    { name: 'pricePerUnit', label: 'Price Per Unit', type: 'number' },
    { name: 'invoiceDate', label: 'Invoice Date', type: 'date' }
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Supplier Invoice</h2>

      <FormBuilder
        fields={fields}
        initialValues={formValues}
        onSubmit={handleSubmit}
        onFieldChange={handleFieldChange}
      />

      <DataTable
        columns={columns}
        columnLabels={columnLabels}
        rows={invoiceList}
        resolveDisplayValue={resolveDisplayValue}
        exportFileName="SupplierInvoices"
      />

      {/* 🔒 Commented old inline print */}
      {/* {printInvoice && (
        <div style={{ display: 'none' }}>
          <InvoicePrint data={printInvoice} />
        </div>
      )} */}

      {/* ✅ New modal-based invoice preview */}
      <InvoiceModal isOpen={showInvoice} onClose={() => setShowInvoice(false)}>
        <InvoicePrint invoice={selectedInvoice} />
      </InvoiceModal>
    </div>
  );
}

export default SupplierInvoice;
