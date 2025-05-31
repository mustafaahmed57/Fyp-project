import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';
import PurchaseRequest from './pages/PurchaseRequest';
import PurchaseOrder from './pages/PurchaseOrder';
import GoodsReceipt from './pages/GoodsReceipt';
import SupplierInvoice from './pages/SupplierInvoice';
import Users from './pages/Users';
import SalesInquiry from './pages/SalesInquiry';
import SalesOrder from './pages/SalesOrder';
import DeliveryNote from './pages/DeliveryNote';
import NotFound from './pages/NotFound';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductManagement from './pages/ProductManagement';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import InventoryReport from './pages/InventoryReport';
import WelcomePage from './pages/WelcomePage';
import Suppliers from './pages/Suppliers';
import Customer from './pages/Customer'; // ✅ adjust path if needed
import CustomerInvoice from './pages/CustomerInvoice';






function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(''); // ✅ Stores current user's role

  return (
    <>
      <BrowserRouter>
        <Routes>

          {/* ✅ Public Routes */}
          <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />} />

          {/* ✅ Protected Routes */}
          {isLoggedIn ? (
            <Route path="/" element={<MainLayout userRole={userRole} />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="purchase-request" element={<PurchaseRequest />} />
              <Route path="purchase-order" element={<PurchaseOrder />} />
              <Route path="goods-receipt" element={<GoodsReceipt />} />
              <Route path="supplier-invoice" element={<SupplierInvoice />} />
              <Route path="users" element={<Users />} />
              <Route path="/customers" element={<Customer />} /> 
              <Route path="sales-inquiry" element={<SalesInquiry />} />
              <Route path="sales-order" element={<SalesOrder />} />
              <Route path="delivery-note" element={<DeliveryNote />} />
              <Route path="product-management" element={<ProductManagement />} />
              <Route path="stock-in" element={<StockIn />} />
              <Route path="stock-out" element={<StockOut />} />
              <Route path="inventory-report" element={<InventoryReport />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="/customer-invoice" element={<CustomerInvoice />} />
              

            </Route>
          ) : (
            // ✅ Redirect if not logged in
            <Route path="*" element={<Navigate to="/" />} />
          )}

          {/* ✅ 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
}

export default App;
