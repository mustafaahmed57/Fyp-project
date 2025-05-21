import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';

function InventoryReport() {
  const [products, setProducts] = useState([]);
  const baseURL = 'http://localhost:5186/api/products';
  const LOW_STOCK_THRESHOLD = 10;

  const hasWarned = useRef(false); // ✅ Track toast status

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const response = await axios.get(baseURL);
      const productList = response.data;
      setProducts(productList);

      const lowStockItems = productList.filter(p => p.stock < LOW_STOCK_THRESHOLD);
      if (lowStockItems.length > 0 && !hasWarned.current) {
        toast.warn(`${lowStockItems.length} product(s) are low on stock! 🔔`);
        hasWarned.current = true; // ✅ Mark as done
      }

    } catch (err) {
      console.error('Error fetching inventory report:', err);
      toast.error('Failed to load inventory report ❌');
    }
  };

  const columns = [
    'productCode',
    'name',
    'category',
    'uom',
    'stock',
    'status'
  ];

  const rows = products.map((p) => ({
    productCode: p.productCode,
    name: p.name,
    category: p.category,
    uom: p.uom,
    stock: p.stock < LOW_STOCK_THRESHOLD ? `⚠️ ${p.stock}` : p.stock,
    status: p.status
  }));

  return (
    <div>
      <h2>Inventory Report</h2>
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}

export default InventoryReport;
