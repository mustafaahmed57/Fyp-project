import React, { useEffect, useState } from "react";
import FormBuilder from "../components/FormBuilder";
import DataTable from "../components/DataTable";
import { toast } from "react-toastify";
import { formatDateTime } from "../components/dateFormatter";

function ProductionOrder() {
  const apiUrl = "http://localhost:5186/api/ProductionOrder";
  const planApi = "http://localhost:5186/api/ProductionPlan";
  const bomApi = "http://localhost:5186/api/Bom";

  const [orders, setOrders] = useState([]);
  const [planOptions, setPlanOptions] = useState([]);
  const [bomOptions, setBomOptions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  

  const [formValues, setFormValues] = useState({
    orderId: null,
    orderCode: "",
    planId: "",
    bomId: "",
    productCode: "",
    productName: "",
    uom: "",
    quantityToProduce: "",
    plannedStartDate: "",
    plannedEndDate: "",
    status: "Draft",
    remarks: "",
  });

  // Fetch Orders
  const fetchOrders = () => {
    fetch(apiUrl)
      .then(r => r.json())
      .then(setOrders)
      .catch(() => toast.error("Failed to load Production Orders ❌"));
  };

  // Fetch Open Plans
  const fetchPlans = () => {
    fetch(planApi)
      .then(r => r.json())
      .then((data = []) => {
        const openPlans = data.filter(p => p.status === "Open");
        const opts = openPlans.map(p => ({
          value: p.planId,
          label: p.planCode,
          plan: p,
        }));
        setPlanOptions(opts);
      })
      .catch(() => toast.error("Failed to load Plans ❌"));
  };

  // Fetch Active BOMs
  const fetchBoms = () => {
    fetch(bomApi)
      .then(r => r.json())
      .then((data = []) => {
        const active = data.filter(b => b.status === "Active");
        const opts = active.map(b => ({
          value: b.bomId,
          label: b.bomCode,
          bom: b,
        }));
        setBomOptions(opts);
      })
      .catch(() => toast.error("Failed to load BOMs ❌"));
  };

  useEffect(() => {
    fetchOrders();
    fetchPlans();
    fetchBoms();
  }, []);

  // Form Fields
  const fields = [
    {
      name: "planId",
      label: "Production Plan",
      type: "select",
      options: planOptions,
      required: true,
      disabled: isEditing,
    },
    {
      name: "bomId",
      label: "BOM Code",
      type: "select",
      options: bomOptions,
      required: true,
      disabled: isEditing,
    },
    { name: "productCode", label: "Product Code", type: "text", disabled: true },
    { name: "productName", label: "Product Name", type: "text", disabled: true },
    { name: "uom", label: "UOM", type: "text", disabled: true },
    { name: "quantityToProduce", label: "Quantity to Produce", type: "number", disabled: true },
    { name: "plannedStartDate", label: "Planned Start Date", type: "date", disabled: true },
    { name: "plannedEndDate", label: "Planned End Date", type: "date", disabled: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "Draft", label: "Draft" },
        { value: "In Process", label: "In Process" },
        { value: "Completed", label: "Completed" },
        { value: "Closed", label: "Closed" },
      ],
      required: true,
      disabled: false,
    },
    { name: "remarks", label: "Remarks", type: "textarea", disabled: false },
  ];

  // Auto-fill data when selecting Plan or BOM
  const handleHeaderChange = (fieldName, value, setFormData) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    setFormValues(prev => ({ ...prev, [fieldName]: value }));

    if (fieldName === "planId") {
      const plan = planOptions.find(p => p.value === value)?.plan;
      if (plan) {
        setFormValues(prev => ({
          ...prev,
          quantityToProduce: plan.plannedQuantity,
          plannedStartDate: (plan.plannedStartDate || "").split("T")[0],
          plannedEndDate: (plan.plannedEndDate || "").split("T")[0],
        }));
      }
    }

    // if (fieldName === "bomId") {
    //   const bom = bomOptions.find(b => b.value === value)?.bom;
    //   if (bom) {
    //     setFormValues(prev => ({
    //       ...prev,
    //       productCode: bom.productCode,
    //       productName: bom.productName,
    //       uom: bom.uom,
    //     }));
    //   }
    // }

    if (fieldName === "bomId") {
  if (value) {
    fetch(`${apiUrl}/GetProductByBOM/${value}`)
      .then(r => {
        if (!r.ok) throw new Error("Failed to fetch product for BOM");
        return r.json();
      })
      .then(data => {
        setFormValues(prev => ({
          ...prev,
          productCode: data.productCode,
          productName: data.productName,
          uom: data.uom,
        }));
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to fetch Product from BOM ❌");
      });
  }
}

  };

  // Validate
  const validate = (data) => {
    if (!data.planId) return "Production Plan is required.";
    if (!data.bomId) return "BOM Code is required.";
    if (!["Draft", "In Process", "Completed", "Closed"].includes(data.status))
      return "Invalid status.";
    return null;
  };

  // Submit
  const handleSubmit = async (data) => {
    const err = validate(data);
    if (err) {
      toast.error(err + " ❌");
      return;
    }

    let payload;
    let url = apiUrl;
    let method = "POST";

    if (isEditing) {
      payload = { status: data.status, remarks: data.remarks };
      url = `${apiUrl}/${formValues.orderId}`;
      method = "PUT";
    } else {
      payload = {
        planId: data.planId,
        bomId: data.bomId,
        productId: 0, // agar BOM me productId aa raha hai toh use karna
        productCode: data.productCode,
        productName: data.productName,
        uom: data.uom,
        status: data.status,
        remarks: data.remarks,
      };
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // if (!res.ok) {
      //   const text = await res.text();
      //   throw new Error(text || (isEditing ? "Update failed" : "Create failed"));
      // }
      if (!res.ok) {
  const data = await res.json().catch(() => null);

  if (data && data.message) {
    // Backend ka structured error hai
    let errorMsg = data.message;

    if (data.shortages && data.shortages.length > 0) {
      errorMsg += "\n\nShortages:\n";
      data.shortages.forEach(item => {
        errorMsg += `${item.name} (${item.productCode}) - Required: ${item.required}, Available: ${item.available}, Short By: ${item.shortBy} ${item.uom}\n`;
      });
    }

    throw new Error(errorMsg);
  } else {
    // fallback agar backend ne plain text bheja
    const text = await res.text();
    throw new Error(text || (isEditing ? "Update failed" : "Create failed"));
  }
}

toast.success(isEditing ? "Order updated ✅" : "Order created ✅");


      toast.success(isEditing ? "Order updated ✅" : "Order created ✅");
      setIsEditing(false);
      setFormValues({
        orderId: null,
        orderCode: "",
        planId: "",
        bomId: "",
        productCode: "",
        productName: "",
        uom: "",
        quantityToProduce: "",
        plannedStartDate: "",
        plannedEndDate: "",
        status: "Draft",
        remarks: "",
      });
      fetchOrders();
    } catch (e) {
      toast.error(e.message || "Server error ❌");
    }
  };

  // Edit
  const handleEdit = async (rowIndex) => {
    const row = orders[rowIndex];
    try {
      const res = await fetch(`${apiUrl}/${row.orderId}`);
      if (!res.ok) throw new Error("Failed to load order");
      const order = await res.json();

      setFormValues({
        orderId: order.orderId,
        orderCode: order.orderCode,
        planId: order.planId,
        bomId: order.bomId,
        productCode: order.productCode,
        productName: order.productName,
        uom: order.uom,
        quantityToProduce: order.quantityToProduce,
        plannedStartDate: (order.plannedStartDate || "").split("T")[0],
        plannedEndDate: (order.plannedEndDate || "").split("T")[0],
        status: order.status,
        remarks: order.remarks,
      });
      setIsEditing(true);
    } catch {
      toast.error("Failed to load order ❌");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Production Order?")) return;
    try {
      const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Order deleted ✅");
      fetchOrders();
    } catch {
      toast.error("Failed to delete ❌");
    }
  };

  // Table Columns
  const columns = [
    "orderCode",
    "planCode",
    "bomCode",
    "productCode",
    "productName",
    "uom",
    "quantityToProduce",
    "plannedStartDate",
    "plannedEndDate",
    "status",
    "remarks",
    "createdAt",
  ];

  const columnLabels = {
    orderCode: "Order Code",
    planCode: "Plan Code",
    bomCode: "BOM Code",
    productCode: "Product Code",
    productName: "Product Name",
    uom: "UOM",
    quantityToProduce: "Quantity",
    plannedStartDate: "Start Date",
    plannedEndDate: "End Date",
    status: "Status",
    remarks: "Remarks",
    createdAt: "Created At",
    updatedAt: "Updated At",
    actions: "Actions",
  };

  const tableRows = orders.map((o, index) => ({
    ...o,
    plannedStartDate: formatDateTime(o.plannedStartDate),
    plannedEndDate: formatDateTime(o.plannedEndDate),
    createdAt: formatDateTime(o.createdAt),
    updatedAt: formatDateTime(o.updatedAt),
    actions: (
      <>
        <button className="btn edit-btn" onClick={() => handleEdit(index)}>
          Edit
        </button>
        <button
          className="btn delete-btn"
          style={{ marginLeft: 6 }}
          onClick={() => handleDelete(o.orderId)}
        >
          Delete
        </button>
      </>
    ),
  }));

  return (
    <div style={{ paddingLeft: 15, paddingRight: 10 }}>
      <h2>Production Order</h2>

      <FormBuilder
        fields={fields}
        initialValues={formValues}
        onFieldChange={handleHeaderChange}
        onSubmit={handleSubmit}
        submitLabel={isEditing ? "Update" : "Create"}
      />

      <DataTable
        columns={columns}
        rows={tableRows}
        columnLabels={columnLabels}
      />
    </div>
  );
}

export default ProductionOrder;
