import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // ✅ Added useNavigate
import {
  FaChevronDown,
  FaChevronUp,
  FaShoppingCart,
  FaCashRegister,
  FaWarehouse,
  FaIndustry,
  FaUsers,
  FaHome,
  FaSignOutAlt,
} from 'react-icons/fa';
import { toast } from 'react-toastify'; // ✅ Add this


// ✅ Receive setIsLoggedIn as prop
function Sidebar({ setIsLoggedIn }) {
  const [openModule, setOpenModule] = useState('Dashboard');
  const navigate = useNavigate(); // ✅ For redirecting on logout

  const sidebarModules = [
    {
      name: 'Dashboard',
      icon: <FaHome />,
      children: [{ name: 'Dashboard', path: '/dashboard' }],
    },
    {
      name: 'Purchase',
      icon: <FaShoppingCart />,
      children: [
        { name: 'Purchase Request', path: '/purchase-request' },
        { name: 'Purchase Order', path: '/purchase-order' },
        { name: 'Goods Receipt', path: '/goods-receipt' },
        { name: 'Supplier Invoice', path: '/supplier-invoice' },
      ],
    },
    {
      name: 'Sales',
      icon: <FaCashRegister />,
      children: [
        { name: 'Sales Inquiry', path: '/sales-inquiry' },
        { name: 'Sales Order', path: '/sales-order' },
        { name: 'Delivery Note', path: '/delivery-note' },
      ],
    },
    {
      name: 'Inventory',
      icon: <FaWarehouse />,
      children: [],
    },
    {
      name: 'Manufacturing',
      icon: <FaIndustry />,
      children: [],
    },
    {
      name: 'Users',
      icon: <FaUsers />,
      children: [{ name: 'User Management', path: '/users' }],
    },
  ];

  const toggleModule = (name) => {
    setOpenModule((prev) => (prev === name ? '' : name));
  };

  // const handleLogout = () => {
  //   setIsLoggedIn(false); // ✅ Logout
  //   navigate('/');        // ✅ Redirect to login
  // };

  const handleLogout = () => {
  setIsLoggedIn(false);        // ✅ Remove session
  toast.info('You have been logged out'); // ✅ Show toast
  navigate('/');               // ✅ Back to login
};


  return (
    <div className="sidebar">
      <h2 className="logo">Carteza ERP</h2>

      <div className="modules">
        {sidebarModules.map((module) => (
          <div key={module.name} className="module-section">
            <div className="module-header" onClick={() => toggleModule(module.name)}>
              <span className="icon-text">
                {module.icon}
                <span>{module.name}</span>
              </span>
              <span className="chevron">
                {openModule === module.name ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </div>

            {openModule === module.name && module.children.length > 0 && (
              <ul className="module-children">
                {module.children.map((child) => (
                  <li key={child.path}>
                    <NavLink
                      to={child.path}
                      className={({ isActive }) =>
                        isActive ? 'child-link active' : 'child-link'
                      }
                    >
                      {child.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* ✅ Working Logout Button */}
      <div className="logout-wrapper">
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt style={{ marginRight: '8px' }} /> Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
