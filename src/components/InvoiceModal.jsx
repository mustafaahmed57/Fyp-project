import React from 'react';
// import '../../style.css';
// import './InvoiceModal.css'; // Optional: style separately

function InvoiceModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal-content">
        <div className="invoice-modal-header">
          <h3>Invoice Preview</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="invoice-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default InvoiceModal;
