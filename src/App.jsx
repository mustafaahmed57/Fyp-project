import { BrowserRouter, Routes, Route } from 'react-router-dom';
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


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* All module pages go inside MainLayout */}
        <Route path="/" element={<MainLayout />}>
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
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
