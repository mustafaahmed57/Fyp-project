// src/pages/BOM.jsx
import React, { useEffect, useState } from "react";
import FormBuilder from "../components/FormBuilder";
import DataTable from "../components/DataTable";
import { toast } from "react-toastify";
import { formatDateTime } from "../components/dateFormatter";

function BOM() {
  const apiUrl = "http://localhost:5186/api/Bom";

  const [boms, setBoms] = useState([]);
  const [finishedProducts, setFinishedProducts] = useState([]);
  const [components, setComponents] = useState([]);
  const [formValues, setFormValues] = useState({
    finishedProductId: "",
    effectiveDate: "",
    remarks: "",
    status: "Active",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [lines, setLines] = useState([
    { rawMaterialId: "", uom: "", quantityPerProduct: "", stock: 0, code: "" } // 👈 1 default line
  ]);

  // ---------- Fetchers ----------
  const fetchList = () => {
    fetch(apiUrl)
      .then(r => r.json())
      .then(setBoms)
      .catch(() => toast.error("Failed to load BOMs ❌"));
  };

  const fetchFinished = () => {
    fetch(`${apiUrl}/products/finished`)
      .then(r => r.json())
      .then(data => {
        // expect: [{ value, label, code, uom }]
        setFinishedProducts(
          (data || []).map(fp => ({
            value: fp.value,
            label: `${fp.label} (${fp.code || "-"})`, // show code in dropdown only
            raw: fp, // keep raw for other uses if needed
          }))
        );
      })
      .catch(() => toast.error("Failed to load finished products ❌"));
  };

  const fetchComponents = () => {
    fetch(`${apiUrl}/products/components`)
      .then(r => r.json())
      .then(data => {
        // expect: [{ value, label, code, uom, stock }]
        setComponents(
          (data || []).map(c => ({
            value: c.value,
            label: `${c.label} (${c.code || "-"})`, // show code in dropdown only
            uom: c.uom || "",
            stock: Number(c.stock ?? 0),
            code: c.code || "",
            name: c.label
          }))
        );
      })
      .catch(() => toast.error("Failed to load components ❌"));
  };

  useEffect(() => {
    fetchList();
    fetchFinished();
    fetchComponents();
    // ensure defaults on mount
    setFormValues(prev => ({ ...prev, status: "Active" }));
    // ensure at least one line if cleared elsewhere
    setLines(prev => (prev?.length ? prev : [{ rawMaterialId: "", uom: "", quantityPerProduct: "", stock: 0, code: "" }]));
  }, []);

  // ---------- Form fields ----------
  const fields = [
    {
      name: "finishedProductId",
      label: "Finished Product",
      type: "select",
      options: finishedProducts,
      required: true,
      disabled: isEditing, // editing: only status allowed
    },
    { name: "effectiveDate", label: "Effective Date", type: "date", required: true, disabled: isEditing },
    { name: "remarks", label: "Remarks", type: "text", disabled: isEditing },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "Active" },
        { label: "Used", value: "Used" },
        { label: "Cancelled", value: "Cancelled" },
      ],
      disabled: !isEditing, // status editable only in edit
    },
  ];

  // ensure FormBuilder + our local state both update
  const handleHeaderChange = (fieldName, value, setFormData) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    setFormValues(prev => ({ ...prev, [fieldName]: value }));
  };

  // ---------- Components (lines) ----------
  const defaultLine = () => ({ rawMaterialId: "", uom: "", quantityPerProduct: "", stock: 0, code: "" });

  const addLine = () => {
    if (isEditing) return; // editing: locked
    setLines(prev => [...prev, defaultLine()]);
  };

  const removeLine = (idx) => {
    if (isEditing) return; // editing: locked
    setLines(prev => {
      const next = prev.filter((_, i) => i !== idx);
      // keep at least one line visible
      return next.length ? next : [defaultLine()];
    });
  };

  const updateLine = (idx, key, value) => {
    setLines(prev => {
      const arr = [...prev];
      const next = { ...arr[idx], [key]: value };

      // when component changes → auto-fill UOM + stock + code
      if (key === "rawMaterialId") {
        const prod = components.find(c => String(c.value) === String(value));
        if (prod) {
          next.uom = prod.uom || "";
          next.stock = Number(prod.stock ?? 0);
          next.code  = prod.code || "";
        } else {
          next.uom = "";
          next.stock = 0;
          next.code = "";
        }
      }

      // live client-side stock check on quantity change
      if (key === "quantityPerProduct") {
        const n = Number(value);
        const available = Number(arr[idx]?.stock ?? next.stock ?? 0);
        if (!Number.isNaN(n) && n > 0 && available >= 0 && n > available) {
          toast.error(`Line ${idx + 1}: Quantity exceeds available stock (${available}) ❌`);
        }
      }

      arr[idx] = next;
      return arr;
    });
  };

  // ---------- Validation ----------
  const validateBeforeSubmit = () => {
    if (!formValues.finishedProductId) return "Finished Product is required.";
    if (!formValues.effectiveDate) return "Effective Date is required.";

    if (!isEditing) {
      if (lines.length === 0) return "At least one component line is required.";
      const seen = new Set();
      for (const [i, ln] of lines.entries()) {
        if (!ln.rawMaterialId) return `Line ${i + 1}: Raw Material is required.`;
        const qty = Number(ln.quantityPerProduct);
        if (!qty || qty <= 0) return `Line ${i + 1}: Quantity must be > 0.`;
        const key = `${ln.rawMaterialId}`;
        if (seen.has(key)) return `Duplicate component on line ${i + 1}.`;
        seen.add(key);

        // stock check (client)
        const comp = components.find(c => String(c.value) === String(ln.rawMaterialId));
        const available = Number(comp?.stock ?? ln.stock ?? 0);
        if (qty > available) return `Line ${i + 1}: Quantity exceeds available stock (${available}).`;
      }
    }
    return null;
  };

  // ---------- Submit ----------
  const handleSubmit = async (data) => {
    // NOTE: don't reset form on error; only reset after success
    const err = validateBeforeSubmit();
    if (err) {
      toast.error(err + " ❌");
      return;
    }

    const isStatusUpdate = isEditing;

    const payload = isStatusUpdate
      ? { bomId: data.bomId, status: data.status }
      : {
          finishedProductId: parseInt(data.finishedProductId),
          effectiveDate: data.effectiveDate,
          remarks: data.remarks || "",
          status: data.status || "Active",
          lines: lines.map(l => ({
            rawMaterialId: parseInt(l.rawMaterialId),
            quantityPerProduct: parseFloat(l.quantityPerProduct),
            uom: l.uom || "",
          })),
        };

    const method = isStatusUpdate ? "PUT" : "POST";
    const url = isStatusUpdate ? `${apiUrl}/${data.bomId}` : apiUrl;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // try to parse RFC 7807 problem+json (field-wise) from backend
        const text = await res.text();
        try {
          const p = JSON.parse(text);
          // if problem details with errors
          if (p.errors) {
            const msgs = Object.values(p.errors).flat().slice(0, 4); // show a few
            msgs.forEach(m => toast.error(m));
          } else {
            toast.error((p.title || p.message || "Failed") + " ❌");
          }
        } catch {
          toast.error(text || "Failed ❌");
        }
        return; // DO NOT reset on error
      }

      toast.success(isStatusUpdate ? "BOM status updated ✅" : "BOM created ✅");

      // Reset only after success
      setIsEditing(false);
      setFormValues({ finishedProductId: "", effectiveDate: "", remarks: "", status: "Active" });
      setLines([defaultLine()]); // keep one default line
      fetchList();
    } catch (e) {
      toast.error(e.message || "Server error ❌");
      // don't reset on error
      setFormValues(prev => ({ ...prev, status: prev.status || "Active" }));
    }
  };

  // ---------- Edit / Delete ----------
  const handleEdit = async (idx) => {
    const row = boms[idx];
    try {
      const res = await fetch(`${apiUrl}/${row.bomId}`);
      if (!res.ok) throw new Error("Failed to load BOM");
      const full = await res.json();

      setFormValues({
        bomId: full.bomId,
        finishedProductId: full.finishedProductId,
        effectiveDate: full.effectiveDate?.split("T")[0],
        remarks: full.remarks,
        status: full.status,
      });

      setLines(
        (full.rawMaterials || []).map(l => ({
          rawMaterialId: l.rawMaterialId,
          quantityPerProduct: l.quantityPerProduct,
          uom: l.uom,
          stock: 0, // not needed in edit (locked)
          code: "",
        }))
      );

      setIsEditing(true); // in edit mode, only status is editable (frontend)
    } catch {
      toast.error("Failed to load BOM ❌");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this BOM?")) return;
    try {
      const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("BOM deleted ✅");
      fetchList();
    } catch {
      toast.error("Failed to delete ❌");
    }
  };

  // ---------- Table ----------
  const columns = ["bomCode", "finishedProductId", "effectiveDate", "remarks", "status", "createdAt", "updatedAt", "actions"];
  const columnLabels = {
    bomCode: "BOM Code",
    finishedProductId: "Finished Product",
    effectiveDate: "Effective Date",
    remarks: "Remarks",
    status: "Status",
    createdAt: "Created At",
    updatedAt: "Updated At",
    actions: "Actions",
  };

  const tableRows = boms.map((b, index) => ({
    ...b,
    actions: (
      <>
        {b.status === "Active" || b.status === "Cancelled" ? (
          <>
            <button className="btn edit-btn" onClick={() => handleEdit(index)}>Edit</button>
            <button className="btn delete-btn" style={{ marginLeft: 6 }} onClick={() => handleDelete(b.bomId)}>Delete</button>
          </>
        ) : (
          <span style={{ color: "gray", fontStyle: "italic" }}>Locked 🔒</span>
        )}
      </>
    ),
  }));

  // ---------- Lightweight styles for Components area ----------
  const compWrap = {
    marginTop: 12,
    marginBottom: 12,
    background: "#f8fafc",        // subtle slate-50
    border: "1px solid #e5e7eb",  // slate-200
    borderRadius: 12,
    padding: 12,
  };
  const compRow = {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr auto",
    gap: 8,
    marginTop: 8,
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
  };
  const helpText = { fontSize: 12, color: "#6b7280", marginTop: 4 };

  return (
    <div style={{ paddingLeft: 15, paddingRight: 10 }}>
      <h2>Bill of Materials (BOM)</h2>

      <FormBuilder
        fields={fields}
        initialValues={formValues}
        onFieldChange={handleHeaderChange}
        onSubmit={handleSubmit}
      />

      {/* Components editor */}
      <div style={compWrap}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Components</h3>
          {!isEditing && (
            <button className="btn add-btn" onClick={addLine}>
              + Add Line
            </button>
          )}
        </div>

        {lines.map((ln, idx) => {
          const comp = components.find(c => String(c.value) === String(ln.rawMaterialId));
          const available = Number(comp?.stock ?? ln.stock ?? 0);
          const qty = Number(ln.quantityPerProduct);
          const over = qty > 0 && qty > available;

          return (
            <div key={idx} style={compRow}>
              <select
                value={ln.rawMaterialId}
                onChange={(e) => updateLine(idx, "rawMaterialId", e.target.value)}
                disabled={isEditing}
              >
                <option value="">-- select component --</option>
                {components.map(c => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              <div>
                <input
                  type="number"
                  placeholder="Qty / product"
                  value={ln.quantityPerProduct}
                  onChange={(e) => updateLine(idx, "quantityPerProduct", e.target.value)}
                  disabled={isEditing || !ln.rawMaterialId}
                  style={{
                    width: "90%",
                    border: over ? "1px solid #ef4444" : "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "6px 8px",
                  }}
                />
                {!!ln.rawMaterialId && (
                  <div style={helpText}>
                    Available: {available} {ln.uom || comp?.uom || ""} {over ? " • Not enough stock" : ""}
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="UOM"
                value={ln.uom}
                onChange={(e) => updateLine(idx, "uom", e.target.value)}
                disabled={isEditing}
                style={{ borderRadius: 8, padding: "6px 8px", border: "1px solid #e5e7eb" }}
              />

              {!isEditing && (
                <button className="btn delete-btn" onClick={() => removeLine(idx)}>
                  Remove
                </button>
              )}
            </div>
          );
        })}

        {!isEditing && lines.length > 0 && (
          <button className="btn add-btn" style={{ marginTop: 8 }} onClick={addLine}>
            + Add Another
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={tableRows}
        columnLabels={columnLabels}
        resolveDisplayValue={(col, value) => {
          if (col === "finishedProductId") {
            const p = finishedProducts.find(fp => fp.value === value);
            return p ? p.raw?.label : value; // table me code nahi dikhana (aapki req)
          }
          if (col === "effectiveDate" || col === "createdAt" || col === "updatedAt") return formatDateTime(value);
          return value;
        }}
      />
    </div>
  );
}

export default BOM;
