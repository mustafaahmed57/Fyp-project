import React from 'react';

function InvoicePrint({ invoice }) {
  if (!invoice) return null;

  const {
    sinvCode,
    invoiceDate,
    supplierName,
    productName,
    quantityInvoiced,
    pricePerUnit,
    totalAmount,
    grnCode
  } = invoice;

  return (
    <div style={{ fontFamily: 'Arial', padding: '30px', width: '700px', margin: 'auto', border: '1px solid #ccc' }}>
      <h1 style={{ textAlign: 'center' }}>CARTEZA ERP</h1>

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <strong>Invoice Code:</strong> {sinvCode} <br />
          <strong>Date:</strong> {new Date(invoiceDate).toLocaleDateString()}
        </div>
        <div>
          <strong>GRN:</strong> {grnCode} <br />
          <strong>Supplier:</strong> {supplierName}
        </div>
      </div>

      <hr />

      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Product</th>
            <th style={th}>Quantity</th>
            <th style={th}>Unit Price</th>
            <th style={th}>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={td}>{productName}</td>
            <td style={td}>{quantityInvoiced}</td>
            <td style={td}>Rs. {pricePerUnit.toFixed(2)}</td>
            <td style={td}>Rs. {totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ textAlign: 'right', marginTop: '30px' }}>
        <h3>Total: Rs. {totalAmount.toFixed(2)}</h3>
      </div>

      <div style={{ marginTop: '40px', fontSize: '12px', textAlign: 'center', color: '#888' }}>
        Thank you for doing business with us! <br />
        This is a system generated invoice.
      </div>
    </div>
  );
}

const th = {
  border: '1px solid #ccc',
  padding: '8px',
  background: '#f0f0f0',
  textAlign: 'left'
};

const td = {
  border: '1px solid #ccc',
  padding: '8px'
};

export default InvoicePrint;
