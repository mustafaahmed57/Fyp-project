import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('loggedInUser')) || {};
  const [currentTime, setCurrentTime] = useState(new Date());

 useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000); // ✅ update every second
  return () => clearInterval(interval);
}, []);


  const parts = location.pathname.split('/').filter(Boolean);
  const title =
    parts
      .map((part) =>
        part.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
      )
      .join(' / ') || 'Dashboard';

  const rawRole = user.role || '';
  const cleanRole = rawRole.trim().toLowerCase();

  const getRoleBadgeClass = () => {
    switch (cleanRole) {
      case 'admin':
        return 'admin-badge';
      case 'inventory':
        return 'inventory-badge';
      case 'purchase':
        return 'purchase-badge';
      case 'sales':
        return 'sales-badge';
      case 'manufacturing':
        return 'manufacturing-badge';
      default:
        return 'default-badge';
    }
  };

 const formatTime = (date) => {
  return date.toLocaleString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit' // ✅ add seconds
  });
};


  return (
    <header className="header">
      {/* ✅ Left: Page Title */}
      <div className="header-left">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      {/* ✅ Right: Time + Badge + Name */}
      <div className="header-right flex items-center gap-4">
        {/* <span className="text-sm text-gray-600">{formatTime(currentTime)}</span> */}
        <span className="header-datetime">
  {formatTime(currentTime)}
</span>

        <span className={`user-role ${getRoleBadgeClass()}`}>{cleanRole}</span>
        <span className="user-name font-semibold text-gray-800 uppercase tracking-wide">
          {user.fullName}
        </span>
      </div>
    </header>
  );
}

export default Header;
