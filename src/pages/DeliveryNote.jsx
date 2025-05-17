import React, { useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';

function DeliveryNote() {
  const [deliveries, setDeliveries] = useState([]);

  const fields = [
    { name: 'orderID', label: 'Order ID', type: 'number' },
    { name: 'deliveredQuantity', label: 'Delivered Quantity', type: 'number' },
  ];

  const handleSubmit = (data) => {
    const deliveryDate = new Date().toISOString().split('T')[0]; // auto-fill current date

    const newEntry = {
      ...data,
      DeliveryID: deliveries.length + 1,
      DeliveryDate: deliveryDate,
    };

    setDeliveries((prev) => [...prev, newEntry]);
  };

  const columns = [
    'DeliveryID',
    'orderID',
    'deliveredQuantity',
    'DeliveryDate'
  ];

  return (
    <div style={{ paddingLeft: '30px', paddingRight: '30px' }}>
      <h2>Delivery Note</h2>
      <FormBuilder fields={fields} onSubmit={handleSubmit} />
      <DataTable columns={columns} rows={deliveries} />
    </div>
  );
}

export default DeliveryNote;
