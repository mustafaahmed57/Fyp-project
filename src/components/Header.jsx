import React from 'react';
// import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <h2>DASHBOARD</h2>
      </div>
      <div className="header-right">
        <span className="user-role">Admin</span>
        <span className="user-name">MUSTAFA</span>
        <img
          src="https://i.pravatar.cc/40"
          alt="avatar"
          className="avatar"
        />
        {/* <button className="logout-btn">Logout</button> */}
      </div>
    </header>
  );
}

export default Header;
