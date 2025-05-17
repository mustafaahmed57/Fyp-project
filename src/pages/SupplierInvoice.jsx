import React, { useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify'; // ✅ Toast import



function SupplierInvoice() {
  const [invoices, setInvoices] = useState([]);
  const fields = [
    { name: 'grnID', label: 'GRN ID', type: 'number' },
    { name: 'supplierName', label: 'Supplier Name', type: 'text' },
    { name: 'productName', label: 'Product Name', type: 'text' },
    { name: 'quantityInvoiced', label: 'Quantity Invoiced', type: 'number' },
    { name: 'pricePerUnit', label: 'Price Per Unit', type: 'number' },
    { name: 'invoiceDate', label: 'Invoice Date', type: 'date' },
  ];

  // const handleSubmit = (data) => {
  //   const invoiceID = invoices.length + 1;
  //   const totalAmount = data.quantityInvoiced * data.pricePerUnit;

  //   const newInvoice = {
  //     invoiceID,
  //     grnID: data.grnID,
  //     supplierName: data.supplierName,
  //     productName: data.productName,
  //     quantityInvoiced: data.quantityInvoiced,
  //     pricePerUnit: data.pricePerUnit,
  //     totalAmount,
  //     invoiceDate: data.invoiceDate,
  //   };

  //   setInvoices((prev) => [...prev, newInvoice]);
  // };

  const handleSubmit = (data) => {
    const invoiceID = invoices.length + 1;
    const totalAmount = data.quantityInvoiced * data.pricePerUnit;

    const newInvoice = {
      invoiceID,
      grnID: data.grnID,
      supplierName: data.supplierName,
      productName: data.productName,
      quantityInvoiced: data.quantityInvoiced,
      pricePerUnit: data.pricePerUnit,
      totalAmount,
      invoiceDate: data.invoiceDate,
    };

    setInvoices((prev) => [...prev, newInvoice]);
    toast.success("Supplier Invoice generated ✅"); // ✅ Toast here
     toast.success("Purchase Order created");
  };

  const columns = [
    'invoiceID',
    'grnID',
    'supplierName',
    'productName',
    'quantityInvoiced',
    'pricePerUnit',
    'totalAmount',
    'invoiceDate',
  ];

  return (
    <div>
      <h2>Supplier Invoice</h2>
      <FormBuilder fields={fields} onSubmit={handleSubmit} />
      <DataTable columns={columns} rows={invoices} />
    </div>
  );
}

export default SupplierInvoice;
