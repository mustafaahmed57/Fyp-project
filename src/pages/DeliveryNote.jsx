import React, { useState, useEffect } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';

function DeliveryNote() {
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);

  // 🔁 Load Approved Sales Orders
  useEffect(() => {
    fetch('http://localhost:5186/api/SalesOrder')
      .then(res => res.json())
      .then(data => {
        const approved = data.filter(o => o.status === 'Approved');
        setOrders(approved);
      })
      .catch(() => toast.error("Failed to load sales orders"));
  }, []);

  // 🔁 Load Delivery Notes
  useEffect(() => {
    fetch('http://localhost:5186/api/DeliveryNote')
      .then(res => res.json())
      .then(data => setDeliveries(data))
      .catch(() => toast.error("Failed to load delivery notes"));
  }, []);

  const orderOptions = orders.map((o) => ({
    value: o.orderID,
    label: `SO${o.orderID.toString().padStart(5, '0')} - ${o.customerName}`
  }));

  const fields = [
    {
      name: 'salesOrderID',
      label: 'Sales Order',
      type: 'select',
      options: orderOptions
    },
    { name: 'customerName', label: 'Customer Name', type: 'text', disabled: true },
    { name: 'productName', label: 'Product Name', type: 'text', disabled: true },
    { name: 'quantityOrdered', label: 'Quantity Ordered', type: 'number', disabled: true },
    { name: 'deliveredQuantity', label: 'Delivered Quantity', type: 'number' }
  ];

  const handleFieldChange = (fieldName, value, setFormValues) => {
    if (fieldName === 'salesOrderID') {
      const selected = orders.find(o => o.orderID === parseInt(value));
      if (selected) {
        setFormValues(prev => ({
          ...prev,
          customerName: selected.customerName,
          productName: selected.productName,
          quantityOrdered: selected.quantityOrdered
        }));
      }
    }
  };

  const handleSubmit = async (data) => {
  if (parseInt(data.deliveredQuantity) > parseInt(data.quantityOrdered)) {
    toast.error("Delivered quantity cannot exceed ordered quantity❌");
    return;
  }

  try {
    const response = await fetch('http://localhost:5186/api/DeliveryNote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.json();
      setDeliveries(prev => [...prev, result]);
      toast.success("Delivery Note submitted 🚚");
    } else {
      toast.error("Failed to submit delivery note ❌");
    }
  } catch (err) {
    console.error(err);
    toast.error("Server error ❌");
  }
};


  const columns = [
    'deliveryID',
    'deliveryCode',
    'salesOrderID',
    'customerName',
    'productName',
    'quantityOrdered',
    'deliveredQuantity',
    'deliveryDate'
  ];

  return (
    <div style={{ paddingLeft: '30px', paddingRight: '30px' }}>
      <h2>Delivery Note</h2>
      <FormBuilder
        fields={fields}
        onSubmit={handleSubmit}
        onFieldChange={handleFieldChange}
      />
      <DataTable columns={columns} rows={deliveries} />
    </div>
  );
}

export default DeliveryNote;
