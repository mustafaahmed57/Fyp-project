import React, { useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';


function PurchaseOrder() {
  const [orders, setOrders] = useState([]);

  const fields = [
    { name: 'requestID', label: 'Request ID', type: 'number' },
    { name: 'supplierName', label: 'Supplier Name', type: 'text' },
    { name: 'productName', label: 'Product Name', type: 'text' },
    { name: 'quantityOrdered', label: 'Quantity Ordered', type: 'number' },
    { name: 'purchasePricePerUnit', label: 'Price Per Unit', type: 'number' },
    { name: 'poDate', label: 'PO Date', type: 'date' },
  ];

  // const handleSubmit = (data) => {
  //   const poID = orders.length + 1;
  //   const totalAmount = data.quantityOrdered * data.purchasePricePerUnit;

  //   const newOrder = {
  //     poID,
  //     requestID: data.requestID,
  //     supplierName: data.supplierName,
  //     productName: data.productName,
  //     quantityOrdered: data.quantityOrdered,
  //     purchasePricePerUnit: data.purchasePricePerUnit,
  //     totalAmount,
  //     poDate: data.poDate,
  //   };

  //   setOrders((prev) => [...prev, newOrder]);
  // };

  const handleSubmit = (data) => {
  const orderDate = new Date().toISOString().split('T')[0];
  const total = parseFloat(data.unitPrice || 0) * parseFloat(data.quantityOrdered || 0);
  const newEntry = {
    ...data,
    OrderID: orders.length + 1,
    OrderDate: orderDate,
    totalAmount: total,
  };
  setOrders((prev) => [...prev, newEntry]);
  toast.success("Purchase Order created");
};


  const columns = [
    'poID',
    'requestID',
    'supplierName',
    'productName',
    'quantityOrdered',
    'purchasePricePerUnit',
    'totalAmount',
    'poDate',
  ];

  return (
    <div>
      <h2>Purchase Order</h2>
      <FormBuilder fields={fields} onSubmit={handleSubmit} />
      <DataTable columns={columns} rows={orders} />
    </div>
  );
}

export default PurchaseOrder;
