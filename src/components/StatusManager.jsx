// components/StatusManager.jsx
import React from 'react';

function StatusManager({ id, currentStatus, onChange }) {
  const statuses = ['Active', 'Used', 'Cancelled'];

  return (
    <div style={{ display: 'flex', gap: '5px' }}>
      {statuses.map(status => (
        <button
          key={status}
          onClick={() => onChange(id, status)}
          disabled={currentStatus === status}
          style={{
            padding: '3px 8px',
            fontSize: '12px',
            cursor: 'pointer',
            backgroundColor: currentStatus === status ? '#ccc' : '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '5px'
          }}
        >
          {status}
        </button>
      ))}
    </div>
  );
}

export default StatusManager;
