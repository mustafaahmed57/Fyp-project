import React from 'react';
// import { useNavigate } from 'react-router-dom';

function NotFound() {
  // const navigate = useNavigate();

  return (
    <div className="wrapper">
      <div className="container not-found-container">
        <h1 style={{ fontSize: '3rem', color: '#e74c3c' }}>404</h1>
        <p style={{ fontSize: '18px', marginBottom: '20px' }}>
          Oops! The page you're looking for doesn't exist.
        </p>
        {/* <button
          className="back-btn"
          onClick={() => navigate('/dashboard')}
        >
          🔙 Back to Dashboard
        </button> */}
      </div>
    </div>
  );
}

export default NotFound;
