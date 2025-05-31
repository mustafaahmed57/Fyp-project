import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaChevronDown, FaChevronUp, FaShoppingCart, FaCashRegister,
  FaWarehouse, FaIndustry, FaUsers, FaHome, FaSignOutAlt,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import LogoutModal from '../components/LogoutModal'; // ✅ create this file below

// ✅ Role-wise allowed modules
const roleAccess = {
  Admin: ['Dashboard', 'Purchase', 'Sales', 'Inventory', 'Manufacturing', 'Users', 'Vendor'],
  Procurement: ['Purchase', 'Vendor'],
  Sales: ['Sales'],
  Inventory: ['Inventory'],
  Manufacturing: ['Manufacturing'],
};

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
      { name: 'Supplier Management', path: '/suppliers' },
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
      { name: 'Customers Management', path: '/customers' }, // ✅ NEW LINE
      { name: 'Sales Inquiry', path: '/sales-inquiry' },
      { name: 'Sales Order', path: '/sales-order' },
      { name: 'Delivery Note', path: '/delivery-note' },
      { name: 'Invoice', path: '/customer-invoice' },
    ],
  },
  {
    name: 'Inventory',
    icon: <FaWarehouse />,
    children: [
      { name: 'Product Management', path: '/product-management' },
      { name: 'Stock In', path: '/stock-in' },
      { name: 'Stock Out', path: '/stock-out' },
      { name: 'Inventory Report', path: '/inventory-report' },
    ],
  },
//   {
//   name: 'Vendor',
//   icon: <FaUsers />, // or FaTruck or FaAddressBook if you want a different icon
//   children: [
//     { name: 'Suppliers', path: '/suppliers' }
//   ],
// },

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

function Sidebar({ userRole }) {
  const [openModule, setOpenModule] = useState('Dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const toggleModule = (name) => {
    setOpenModule((prev) => (prev === name ? '' : name));
  };

  const allowedModules = sidebarModules.filter((module) =>
    roleAccess[userRole]?.includes(module.name)
  );

  const confirmLogout = () => {
    localStorage.removeItem('loggedInUser');
    toast.success('Logout successful 👋');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <h2 className="logo">Carteza ERP</h2>

      <div className="modules">
        {allowedModules.map((module) => (
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
        <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
          <FaSignOutAlt style={{ marginRight: '8px' }} /> Logout
        </button>
      </div>

      {/* ✅ Custom logout modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}

export default Sidebar;
