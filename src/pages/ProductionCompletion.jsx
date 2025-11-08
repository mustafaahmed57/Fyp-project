import React, { useEffect, useMemo, useState, useCallback } from "react";
import FormBuilder from "../components/FormBuilder";
import DataTable from "../components/DataTable";
import { toast } from "react-toastify";
import { formatDateTime } from "../components/dateFormatter";

function ProductionCompletion() {
  const api = "http://localhost:5186/api/ProductionCompletion";
  const orderHelper = `${api}/in-process-orders`;
  const headerHelper = (orderId) => `${api}/header/${orderId}`;

  const [rows, setRows] = useState([]);
  const [orderOptions, setOrderOptions] = useState([]);

  const [formValues, setFormValues] = useState({
    orderId: "",
    planCode: "",
    bomCode: "",
    productCode: "",
    productName: "",
    uom: "",
    plannedQty: "",   // ✅ Added plannedQty
    producedQty: "",
    scrapQty: "",
    goodQty: "",      // auto (readonly)
    remarks: ""
  });

  // Load table + dropdown
  const loadData = useCallback(async () => {
    try {
      const [listRes, ordersRes] = await Promise.all([
        fetch(api),
        fetch(orderHelper)
      ]);

      if (!listRes.ok || !ordersRes.ok) throw new Error("Fetch failed");

      const list = await listRes.json();
      const orders = await ordersRes.json();

      setRows(list);
      setOrderOptions(
        orders.map(o => ({
          value: o.orderId,
          label: `${o.orderCode} (${o.productCode})`
        }))
      );
    } catch {
      toast.error("Failed to load production completions or orders ❌");
    }
  }, [api, orderHelper]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-calc GoodQty
  const goodQty = useMemo(() => {
    const p = parseFloat(formValues.producedQty || "0");
    const s = parseFloat(formValues.scrapQty || "0");
    const g = p - s;
    return isNaN(g) ? "" : (g < 0 ? 0 : g);
  }, [formValues.producedQty, formValues.scrapQty]);

  // Keep goodQty in state whenever produced/scrap change
  useEffect(() => {
    setFormValues(prev => ({ ...prev, goodQty }));
  }, [goodQty]);

  const fields = [
    {
      name: "orderId",
      label: "Production Order",
      type: "select",
      options: orderOptions, // only "In Process"
      required: true
    },
    { name: "planCode", label: "Plan Code", type: "text", disabled: true },
    { name: "bomCode", label: "BOM Code", type: "text", disabled: true },
    { name: "productCode", label: "Product Code", type: "text", disabled: true },
    { name: "productName", label: "Product Name", type: "text", disabled: true },
    { name: "uom", label: "UOM", type: "text", disabled: true },
    { name: "plannedQty", label: "Planned Qty", type: "number", disabled: true }, // ✅ Show Planned Qty
    { name: "producedQty", label: "Produced Qty", type: "number", required: true },
    { name: "scrapQty", label: "Scrap Qty", type: "number", required: true },
    { name: "goodQty", label: "Good Qty (Auto)", type: "number", disabled: true },
    { name: "remarks", label: "Remarks", type: "textarea" }
  ];

  // When order changes, fetch header to auto-fill
  const handleFieldChange = async (fieldName, value, setFormData) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    setFormValues(prev => ({ ...prev, [fieldName]: value }));

    if (fieldName === "orderId" && value) {
      try {
        const res = await fetch(headerHelper(value));
        if (!res.ok) throw new Error();
        const h = await res.json();

        setFormValues(prev => ({
          ...prev,
          planCode: h.planCode || "",
          bomCode: h.bomCode || "",
          productCode: h.productCode || "",
          productName: h.productName || "",
          uom: h.uom || "",
          plannedQty: h.plannedQty || 0   // ✅ Store Planned Qty
        }));
      } catch {
        toast.error("Failed to fetch order header ❌");
      }
    }
  };

  // Validation (Produced >= 0, Scrap >= 0, Scrap <= Produced, Good >= 0, Total <= Planned)
  const validate = (data) => {
    if (!data.orderId) return "Production Order is required.";
    const p = parseFloat(data.producedQty);
    const s = parseFloat(data.scrapQty);
    const planned = parseFloat(data.plannedQty || 0);

    if (isNaN(p) || p < 0) return "Produced Qty must be 0 or more.";
    if (isNaN(s) || s < 0) return "Scrap Qty must be 0 or more.";
    if (s > p) return "Scrap Qty cannot exceed Produced Qty.";
    if (planned > 0 && (p + s) > planned)
      return `Total Produced + Scrap (${p+s}) cannot exceed Planned Qty (${planned}).`;

    return null;
  };

  const handleSubmit = async (data) => {
    const err = validate(data);
    if (err) { toast.error(err + " ❌"); return; }

    const payload = {
      orderId: data.orderId,
      producedQty: parseFloat(data.producedQty),
      scrapQty: parseFloat(data.scrapQty),
      remarks: data.remarks
    };

    try {
      const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Save failed");
      }

      toast.success("Production completed & stock updated ✅");
      setFormValues({
        orderId: "",
        planCode: "",
        bomCode: "",
        productCode: "",
        productName: "",
        uom: "",
        plannedQty: "",
        producedQty: "",
        scrapQty: "",
        goodQty: "",
        remarks: ""
      });

      loadData(); // refresh table + options
    } catch (e) {
      toast.error(e.message || "Server error ❌");
    }
  };

  // Table
  const columns = [
    "completionCode",
    "orderId",
    "planCode",
    "bomCode",
    "productCode",
    "productName",
    "uom",
    "plannedQty",
    "producedQty",
    "scrapQty",
    "goodQty",
    "remarks",
    "createdAt"
  ];

  const columnLabels = {
    completionCode: "Completion Code",
    orderId: "Order #",
    planCode: "Plan",
    bomCode: "BOM",
    productCode: "Product Code",
    productName: "Product",
    uom: "UOM",
    plannedQty: "Planned Qty",
    producedQty: "Produced",
    scrapQty: "Scrap",
    goodQty: "Good",
    remarks: "Remarks",
    createdAt: "Created At"
  };

  const tableRows = rows.map(r => ({
    ...r,
    createdAt: formatDateTime(r.createdAt)
  }));

  return (
    <div style={{ paddingLeft: 15, paddingRight: 10 }}>
      <h2>Production Completion</h2>

      <FormBuilder
        fields={fields}
        initialValues={formValues}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        submitLabel="Save Completion"
      />

      <DataTable
        columns={columns}
        rows={tableRows}
        columnLabels={columnLabels}
      />
    </div>
  );
}

export default ProductionCompletion;
