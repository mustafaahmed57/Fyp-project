import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // ✅ Navigate added
import { useState } from 'react'; // ✅ useState added

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
import ProductManagement from './pages/ProductManagement';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import InventoryReport from './pages/InventoryReport';

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ login state added

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* ✅ Pass setIsLoggedIn to Login */}
          <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signup" element={<Signup />} />

          {/* ✅ Protected MainLayout */}
          {/* <Route path="/" element={isLoggedIn ? <MainLayout /> : <Navigate to="/" />}> */}
          <Route path="/" element={isLoggedIn ? <MainLayout setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/" />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="purchase-request" element={<PurchaseRequest />} />
            <Route path="purchase-order" element={<PurchaseOrder />} />
            <Route path="goods-receipt" element={<GoodsReceipt />} />
            <Route path="supplier-invoice" element={<SupplierInvoice />} />
            <Route path="users" element={<Users />} />

            {/* ✅ Sales Module pages */}
            <Route path="sales-inquiry" element={<SalesInquiry />} />
            <Route path="sales-order" element={<SalesOrder />} />
            <Route path="delivery-note" element={<DeliveryNote />} />

            {/* ✅ Inventory Module pages */}
            <Route path="product-management" element={<ProductManagement />} />
            <Route path="stock-in" element={<StockIn />} />
<Route path="stock-out" element={<StockOut />} />
<Route path="inventory-report" element={<InventoryReport />} />

          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
}

export default App;
