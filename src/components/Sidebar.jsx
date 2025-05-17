// ✅ Full Working & Styled Sidebar Component
import React, { useState } from 'react';
import { NavLink,  } from 'react-router-dom';
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

const sidebarModules = [
  {
    name: 'Dashboard',
    icon: <FaHome />,
    children: [
      { name: 'Dashboard', path: '/dashboard' },
    ],
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
    children: [
      { name: 'User Management', path: '/users' },
    ],
  },
];

function Sidebar() {
  const [openModule, setOpenModule] = useState('Dashboard');

  const toggleModule = (name) => {
    setOpenModule((prev) => (prev === name ? '' : name));
  };

  return (
    <div className="sidebar">
      <h2 className="logo">Carteza ERP</h2>

      <div className="modules">
        {sidebarModules.map((module) => (
          <div key={module.name} className="module-section">
            <div
              className="module-header"
              onClick={() => toggleModule(module.name)}
            >
              <span className="icon-text">
                {module.icon}<span>{module.name}</span>
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

      <div className="logout-wrapper">
        <button className="logout-btn">
          <FaSignOutAlt style={{ marginRight: '8px' }} /> Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
