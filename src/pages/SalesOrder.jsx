import React, { useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';

function SalesOrder() {
  const [orders, setOrders] = useState([]);

  const fields = [
    { name: 'customerName', label: 'Customer Name', type: 'text' },
    { name: 'productName', label: 'Product Name', type: 'text' },
    { name: 'quantityOrdered', label: 'Quantity Ordered', type: 'number' },
    { name: 'pricePerUnit', label: 'Price Per Unit', type: 'number' },
  ];

  const handleSubmit = (data) => {
    const orderDate = new Date().toISOString().split('T')[0]; // auto-fill current date
    const totalAmount = parseFloat(data.quantityOrdered || 0) * parseFloat(data.pricePerUnit || 0);

    const newEntry = {
      ...data,
      TotalAmount: totalAmount,
      OrderID: orders.length + 1,
      OrderDate: orderDate,
    };

    setOrders((prev) => [...prev, newEntry]);
  };

  const columns = [
    'OrderID',
    'customerName',
    'productName',
    'quantityOrdered',
    'pricePerUnit',
    'TotalAmount',
    'OrderDate'
  ];

  return (
    <div style={{ paddingLeft: '30px', paddingRight: '30px' }}>
      <h2>Sales Order</h2>
      <FormBuilder fields={fields} onSubmit={handleSubmit} />
      <DataTable columns={columns} rows={orders} />
    </div>
  );
}

export default SalesOrder;
