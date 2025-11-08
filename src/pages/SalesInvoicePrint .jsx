import React from 'react';

function SalesInvoicePrint({ invoice }) {
  if (!invoice) return null;

  const {
    cinvCode,
    invoiceDate,
    customerName,
    // customerAddress,
    // customerPhone,
    productName,
    quantityInvoiced,
    pricePerUnit,
    totalAmount,
    deliveryCode,
    // salespersonName,
    // paymentTerms,
    taxAmount,
    discountAmount
  } = invoice;

  // Fallbacks to prevent errors
  const unitPrice = (pricePerUnit ?? 0).toFixed(2);
  const subTotal = totalAmount - (taxAmount ?? 0) + (discountAmount ?? 0);
  const grandTotal = (totalAmount ?? 0).toFixed(2);

  return (
    <div style={{ fontFamily: 'Arial', padding: '30px', width: '700px', margin: 'auto', border: '1px solid #ccc' }}>
      {/* Company Header */}
      <h1 style={{ textAlign: 'center', margin: 0 }}>CARTEZA ERP</h1>
      <p style={{ textAlign: 'center', fontSize: '12px', margin: 0 }}>
        Gulistan-e-Johar block 14, Karachi, Pakistan | Phone: 0300-1234567 | Email: info@carteza.com
      </p>

      <hr />

      {/* Invoice Info */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
        <div>
          <strong>Invoice Code:</strong> {cinvCode} <br />
          <strong>Date:</strong> {new Date(invoiceDate).toLocaleDateString()} <br />
          {/* <strong>Salesperson:</strong> {salespersonName ?? '-'} <br /> */}
          {/* <strong>Payment Terms:</strong> {paymentTerms ?? '-'} */}
        </div>
        <div>
          <strong>Delivery Note:</strong> {deliveryCode} <br />
          <strong>Customer:</strong> {customerName} <br />
          {/* <strong>Address:</strong> {customerAddress ?? '-'} <br /> */}
          {/* <strong>Phone:</strong> {customerPhone ?? '-'} */}
        </div>
      </div>

      {/* Product Table */}
      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr>
            <th style={th}>Product</th>
            <th style={th}>Qty</th>
            <th style={th}>Unit Price</th>
            <th style={th}>Discount</th>
            <th style={th}>Tax</th>
            <th style={th}>Line Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={td}>{productName}</td>
            <td style={td}>{quantityInvoiced}</td>
            <td style={td}>Rs. {unitPrice}</td>
            <td style={td}>Rs. {(discountAmount ?? 0).toFixed(2)}</td>
            <td style={td}>Rs. {(taxAmount ?? 0).toFixed(2)}</td>
            <td style={td}>Rs. {grandTotal}</td>
          </tr>
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '14px' }}>
        <p>Subtotal: Rs. {subTotal.toFixed(2)}</p>
        <p>Discount: Rs. {(discountAmount ?? 0).toFixed(2)}</p>
        <p>Tax: Rs. {(taxAmount ?? 0).toFixed(2)}</p>
        <h3>Grand Total: Rs. {grandTotal}</h3>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '40px', fontSize: '12px', textAlign: 'center', color: '#888' }}>
        Thank you for doing business with us! <br />
        This is a system generated invoice — no signature required.
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

export default SalesInvoicePrint;
