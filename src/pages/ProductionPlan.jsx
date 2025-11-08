import React, { useEffect, useState } from "react";
import FormBuilder from "../components/FormBuilder";
import DataTable from "../components/DataTable";
import { toast } from "react-toastify";
import { formatDateTime } from "../components/dateFormatter";

function ProductionPlan() {
  const apiUrl = "http://localhost:5186/api/ProductionPlan";
  const bomApi = "http://localhost:5186/api/Bom";

  const [plans, setPlans] = useState([]);
  const [bomOptions, setBomOptions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const [formValues, setFormValues] = useState({
    planId: null,
    planCode: "",
    bomCode: "",
    plannedQuantity: "",
    plannedStartDate: "",
    plannedEndDate: "",
    status: "Open",
  });

  const fetchPlans = () => {
    fetch(apiUrl)
      .then(r => r.json())
      .then(setPlans)
      .catch(() => toast.error("Failed to load Production Plans ❌"));
  };

  const fetchActiveBomCodes = () => {
    fetch(bomApi)
      .then(r => r.json())
      .then((data = []) => {
        const active = data.filter(b => b.status === "Active");
        const opts = active.map(b => ({
          value: b.bomId,   // <-- backend ko ye chahiye
  label: b.bomCode, // <-- user ko ye dikhna chahiye
        }));
        setBomOptions(opts);
      })
      .catch(() => toast.error("Failed to load BOM codes ❌"));
  };

  useEffect(() => {
    fetchPlans();
    fetchActiveBomCodes();
  }, []);

  // Form fields (dynamic based on create/edit mode)
  const fields = [
  {
    name: "bomCode",
    label: "BOM Code",
    type: "select",
    options: bomOptions,
    required: true,
    disabled: isEditing, // <-- edit me disable kar diya
  },
  {
    name: "plannedQuantity",
    label: "Planned Quantity",
    type: "number",
    required: true,
    disabled: isEditing, // <-- edit me disable kar diya
  },
  {
    name: "plannedStartDate",
    label: "Planned Start Date",
    type: "date",
    required: true,
    disabled: isEditing, // <-- edit me disable kar diya
  },
  {
    name: "plannedEndDate",
    label: "Planned End Date",
    type: "date",
    required: true,
    disabled: false, // <-- edit me editable rahegi
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "Open", label: "Open" },
      { value: "In Progress", label: "In Progress" },
      { value: "Completed", label: "Completed" },
      { value: "Closed", label: "Closed" },
    ],
    required: true,
    disabled: false, // <-- edit me editable rahegi
  },
];


  const validate = (data) => {
    if (isEditing) {
      if (!data.plannedEndDate) return "End Date is required.";
      const e = new Date(data.plannedEndDate);
      const s = new Date(formValues.plannedStartDate); // keep original start date
      if (e < s) return "End date cannot be before start date.";
      if (!["Open", "Closed"].includes(data.status)) return "Invalid status.";
    } else {
      if (!data.bomCode) return "BOM Code is required.";
      const qty = Number(data.plannedQuantity);
      if (!qty || qty <= 0) return "Planned Quantity must be greater than 0.";
      if (!data.plannedStartDate) return "Start Date is required.";
      if (!data.plannedEndDate) return "End Date is required.";
      const s = new Date(data.plannedStartDate);
      const e = new Date(data.plannedEndDate);
      if (e < s) return "End date cannot be before start date.";
      if (!["Open", "Closed"].includes(data.status)) return "Invalid status.";
    }
    return null;
  };

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
      // ✅ Only send allowed fields in edit
      payload = {
        status: data.status,
        plannedEndDate: data.plannedEndDate,
      };
      url = `${apiUrl}/${formValues.planId}`;
      method = "PUT";
    } else {
      payload = {
        // bomCode: data.bomCode,
        bomId: data.bomCode,  // data.bomCode me actually bomId aayega ab
        plannedQuantity: Number(data.plannedQuantity),
        plannedStartDate: data.plannedStartDate,
        plannedEndDate: data.plannedEndDate,
        status: data.status || "Open",
      };
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || (isEditing ? "Update failed" : "Create failed"));
      }

      toast.success(isEditing ? "Plan updated ✅" : "Plan created ✅");
      setIsEditing(false);
      setFormValues({
        planId: null,
        planCode: "",
        bomCode: "",
        plannedQuantity: "",
        plannedStartDate: "",
        plannedEndDate: "",
        status: "Open",
      });
      fetchPlans();
    } catch (e) {
      toast.error(e.message || "Server error ❌");
    }
  };

  const handleEdit = async (rowIndex) => {
    const row = plans[rowIndex];
    try {
      const res = await fetch(`${apiUrl}/${row.planId}`);
      if (!res.ok) throw new Error("Failed to load plan");
      const plan = await res.json();

      setFormValues({
        planId: plan.planId,
        planCode: plan.planCode,
        bomCode: plan.bomCode,
        plannedQuantity: plan.plannedQuantity,
        plannedStartDate: (plan.plannedStartDate || "").split("T")[0],
        plannedEndDate: (plan.plannedEndDate || "").split("T")[0],
        status: plan.status,
      });
      setIsEditing(true);
    } catch {
      toast.error("Failed to load plan ❌");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Production Plan?")) return;
    try {
      const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Plan deleted ✅");
      fetchPlans();
    } catch {
      toast.error("Failed to delete ❌");
    }
  };

  const columns = [
    "planCode",
    "bomCode",
    "plannedQuantity",
    "plannedStartDate",
    "plannedEndDate",
    "status",
    "createdAt",
    // "updatedAt",
    // "actions",
  ];

  const columnLabels = {
    planCode: "Plan Code",
    bomCode: "BOM Code",
    plannedQuantity: "Quantity",
    plannedStartDate: "Start Date",
    plannedEndDate: "End Date",
    status: "Status",
    createdAt: "Created At",
    updatedAt: "Updated At",
    actions: "Actions",
  };

  const tableRows = plans.map((p, index) => ({
    ...p,
    plannedStartDate: formatDateTime(p.plannedStartDate),
    plannedEndDate: formatDateTime(p.plannedEndDate),
    createdAt: formatDateTime(p.createdAt),
    updatedAt: formatDateTime(p.updatedAt),
    actions: (
      <>
        <button className="btn edit-btn" onClick={() => handleEdit(index)}>
          Edit
        </button>
        <button
          className="btn delete-btn"
          style={{ marginLeft: 6 }}
          onClick={() => handleDelete(p.planId)}
        >
          Delete
        </button>
      </>
    ),
  }));

  const handleHeaderChange = (fieldName, value, setFormData) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    setFormValues(prev => ({ ...prev, [fieldName]: value }));
  };

  return (
    <div style={{ paddingLeft: 15, paddingRight: 10 }}>
      <h2>Production Plan</h2>

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

export default ProductionPlan;
