import React, { useEffect, useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';
import InvoiceModal from '../components/InvoiceModal';
import InvoicePrint from './InvoicePrint';
import { validateDateInRange } from '../components/validateDate';
import { getMinMaxDateRange } from '../components/getMinMaxDateRange';
import { formatDateTime } from '../components/dateFormatter';


function SupplierInvoice() {
  const [formValues, setFormValues] = useState({});
  const [invoiceList, setInvoiceList] = useState([]);
  const [grnList, setGrnList] = useState([]);
  const { min, max } = getMinMaxDateRange(1, 1);
  // ✅ Modal states
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isEditing] = useState(false);
  
  
  // Load Invoices
  const fetchInvoices = () => {
    fetch('http://localhost:5186/api/SupplierInvoice')
      .then(res => res.json())
      .then(data => setInvoiceList(data))
      .catch(() => toast.error("Failed to load invoices"));
  };

  // Load GRNs for dropdown
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
        setFormValues(prev => {
          const updated = {
            ...prev,
            grnID: selected.value,
            grnCode: selected.label,
            supplierName: selected.supplierName,
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
    if (!isEditing) {
        const dateCheck = validateDateInRange(data.poDate, { minDays: 0, maxDays: 2 });
        if (!dateCheck.valid) {
          toast.error(dateCheck.message + "❌");
          return;
        }
      }
  fetch('http://localhost:5186/api/SupplierInvoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(async res => {
      if (!res.ok) {
        const errorData = await res.json();
        const message = errorData.title || "Failed to save invoice";
        throw new Error(message);
      }
      return res.json();
    })
    .then(() => {
      toast.success("Supplier Invoice created ✅");
      setFormValues({});
      fetchInvoices();
      fetchGRNs(); // 🆕 Refresh GRN dropdown here (💥 real-time update)

    })
    .catch(err => toast.error(err.message));
};


  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoice(true);
  };

  const columns = [
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
    sinvCode: 'Invoice Code',
    grnCode: 'GRN Code',
    supplierName: 'Supplier',
    productName: 'Product',
    quantityInvoiced: 'Quantity',
    pricePerUnit: 'Unit Price',
    totalAmount: 'Total Amount',
    invoiceDate: 'Invoice Date',
    actions: 'Actions'
  };

  const fields = [
    { name: 'grnID', label: 'GRN', type: 'select', options: grnList },
    { name: 'grnCode', label: 'GRN Code', type: 'text', disabled: true },
    { name: 'supplierName', label: 'Supplier Name', type: 'text', disabled: true },
    { name: 'productName', label: 'Product Name', type: 'text', disabled: true },
    { name: 'quantityInvoiced', label: 'Quantity Invoiced', type: 'number', disabled: true },
    { name: 'pricePerUnit', label: 'Price Per Unit', type: 'number', disabled: true },
    { name: 'totalAmount', label: 'Total Amount', type: 'number', disabled: true },
    { name: 'invoiceDate', label: 'Invoice Date', type: 'date', min , max }
  ];

  // const resolveDisplayValue = (col, val, row) => {
  //   if (col === 'actions') {
  //     return (
  //       <button className="btn view" onClick={() => handleViewInvoice(row)}>
  //         View Invoice
  //       </button>
  //     );
  //   }
  //   return val;
  // };

  const resolveDisplayValue = (col, value, row) => {
  if (col === 'invoiceDate') return formatDateTime(value);
  if (col === 'actions') {
    return (
      <button className="btn view" onClick={() => handleViewInvoice(row)}>
        View Invoice
      </button>
    );
  }
  return value;
};


  return (
    <div style={{ paddingLeft: '15px', paddingRight: '10px' }}>
      <h2 >Supplier Invoice (SI)</h2>

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

      <InvoiceModal isOpen={showInvoice} onClose={() => setShowInvoice(false)}>
        <InvoicePrint invoice={selectedInvoice} />
      </InvoiceModal>
    </div>
  );
}

export default SupplierInvoice;
