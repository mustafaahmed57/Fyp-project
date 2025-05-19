import React from 'react';
// import './LogoutModal.css';

function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Confirm Logout</h3>
        <p>Are you sure you want to logout?</p>
        <div className="modal-actions">
          <button onClick={onClose} className="btn cancel">Cancel</button>
          <button onClick={onConfirm} className="btn logout">Logout</button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
