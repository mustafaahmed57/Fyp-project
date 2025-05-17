import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// ✅ Added setIsLoggedIn as prop
function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');

    // ✅ Dummy login check (replace later with API logic)
    if (email === 'admin@123' && password === 'admin') {
      toast.success('Login successful ✅');
      setIsLoggedIn(true); // ✅ Now user is marked as logged in
      navigate('/dashboard'); // ✅ Navigate to Dashboard
    } else {
      toast.error('Invalid credentials ❌');
    }
  };

  return (
    <div className="wrapper"> {/* ✅ OUTERMOST DIV for center fix */}
      <div className="container">
        <div className="form-box">
          <h2>Login to Carteza</h2>
          <form onSubmit={handleSubmit}>
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
            {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
            <button type="submit">Login</button>
          </form>
          <div className="switch-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
