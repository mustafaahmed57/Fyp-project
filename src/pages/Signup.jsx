import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setError('All fields including role are required.');
      return;
    }
    setError('');
    alert(`Account created for ${name} as ${role}`);
    // Later: send data to backend
  };

  return (
    <div className="wrapper">
      <div className="container">
        <div className="form-box">
          <h2>Create a New Account</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Procurement">Procurement</option>
              <option value="Sales">Sales</option>
              <option value="Inventory">Inventory</option>
              <option value="Manufacturing">Manufacturing</option>
            </select>

            {error && (
              <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>
            )}
            <button type="submit">Sign Up</button>
          </form>
          <div className="switch-link">
            Already have an account? <Link to="/">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
