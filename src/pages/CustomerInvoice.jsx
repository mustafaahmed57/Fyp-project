import React, { useState, useEffect } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import InvoiceModal from '../components/InvoiceModal'; // ✅ modal reuse
import InvoicePrint from './InvoicePrint'; // ✅ print component reuse
import SalesInvoicePrint from './SalesInvoicePrint ';

function CustomerInvoice() {
  const [formValues, setFormValues] = useState({});
  const [invoiceList, setInvoiceList] = useState([]);
  const [deliveryList, setDeliveryList] = useState([]);

  // ✅ Modal state
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = () => {
    fetch('http://localhost:5186/api/CustomerInvoice')
      .then(res => res.json())
      .then(data => setInvoiceList(data))
      .catch(() => toast.error("Failed to load invoices"));
  };

  const fetchDeliveries = () => {
    fetch('http://localhost:5186/api/CustomerInvoice/delivery-dropdown')
      .then(res => res.json())
      .then(data => setDeliveryList(data))
      .catch(() => toast.error("Failed to load deliveries"));
  };

  useEffect(() => {
    fetchInvoices();
    fetchDeliveries();
  }, []);

  const handleFieldChange = (fieldName, value, setFormValues) => {
    if (fieldName === 'deliveryID') {
      const selected = deliveryList.find(d => d.value === parseInt(value));
      if (selected) {
        setFormValues(prev => {
          const updated = {
            ...prev,
            deliveryID: selected.value,
            deliveryCode: selected.label,
            customerName: selected.customerName,
            productName: selected.productName,
            quantityInvoiced: selected.quantity,
            pricePerUnit: selected.pricePerUnit.toString(),
            totalAmount: (parseFloat(selected.pricePerUnit) * parseInt(selected.quantity)).toFixed(2)
          };
          return updated;
        });
      }
    }

    if (fieldName === 'invoiceDate') {
      setFormValues(prev => ({
        ...prev,
        invoiceDate: value
      }));
    }
  };

  const handleSubmit = (data) => {
    fetch('http://localhost:5186/api/CustomerInvoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to save invoice");
        return res.json();
      })
      .then(() => {
        toast.success("Customer Invoice created ✅");
        setFormValues({});
         fetchInvoices();       // ✅ refresh invoices
      fetchDeliveries();     // ✅ refresh delivery dropdown live
        fetchInvoices();
      })
      .catch(err => toast.error(err.message));
  };

  // ✅ Modal open logic
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    console.log("Selected invoice (raw):", invoice);
    setShowInvoice(true);
  };

  const columns = [
    'cinvCode',
    'deliveryCode',
    'customerName',
    'productName',
    'quantityInvoiced',
    'pricePerUnit',
    'totalAmount',
    'invoiceDate',
    'actions' // ✅ Add action column
  ];

  const columnLabels = {
    cinvCode: 'Invoice Code',
    deliveryCode: 'Delivery Code',
    customerName: 'Customer',
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
      );
    }

    return val;
  };

  const fields = [
    { name: 'deliveryID', label: 'Delivery Note', type: 'select', options: deliveryList },
    { name: 'deliveryCode', label: 'Delivery Code', type: 'text', disabled: true },
    { name: 'customerName', label: 'Customer Name', type: 'text', disabled: true },
    { name: 'productName', label: 'Product Name', type: 'text', disabled: true },
    { name: 'quantityInvoiced', label: 'Quantity Invoiced', type: 'number', disabled: true },
    { name: 'pricePerUnit', label: 'Price Per Unit', type: 'number', disabled: true },
    { name: 'totalAmount', label: 'Total Amount', type: 'number', disabled: true },
    { name: 'invoiceDate', label: 'Invoice Date', type: 'date' }
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Customer Invoice</h2>

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
        resolveDisplayValue={resolveDisplayValue} // ✅ to handle action column
        exportFileName="CustomerInvoices"
      />

      {/* ✅ Invoice Modal */}
      <InvoiceModal isOpen={showInvoice} onClose={() => setShowInvoice(false)}>
        {/* <InvoicePrint invoice={selectedInvoice} /> */}
        <SalesInvoicePrint invoice={selectedInvoice} />
      </InvoiceModal>
    </div>
  );
}

export default CustomerInvoice;
