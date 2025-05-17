import React, { useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify'; // ✅ Toast import

function Users() {
  const [userList, setUserList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [formValues, setFormValues] = useState({});

  const fields = [
    { name: 'fullName', label: 'Full Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: ['Admin', 'Procurement', 'Sales', 'Inventory', 'Manufacturing'],
    }
  ];

  const handleSubmit = (data) => {
    if (editIndex !== null) {
      const updatedList = [...userList];
      updatedList[editIndex] = { ...updatedList[editIndex], ...data };
      setUserList(updatedList);
      setEditIndex(null);
      toast.info("User updated successfully ✅"); // 🟡 Toast
    } else {
      const userId = userList.length + 1;
      setUserList([...userList, { userId, ...data }]);
      toast.success("New user created ✅"); // 🟢 Toast
    }
    setFormValues({});
  };

  const handleDelete = (index) => {
    const updatedList = [...userList];
    updatedList.splice(index, 1);
    setUserList(updatedList);
    toast.error("User deleted ❌"); // 🔴 Toast
  };

  const handleEdit = (index) => {
    const selected = userList[index];
    setEditIndex(index);
    setFormValues(selected);
  };

  const columns = ['userId', 'fullName', 'email', 'role', 'actions'];

  const tableRows = userList.map((user, index) => ({
    ...user,
    actions: (
      <div className="action-buttons">
        <button className="btn edit-btn" onClick={() => handleEdit(index)}>Edit</button>
        <button className="btn delete-btn" onClick={() => handleDelete(index)}>Delete</button>
      </div>
    )
  }));

  return (
    <div>
      <h2>User Management</h2>
      <FormBuilder fields={fields} onSubmit={handleSubmit} initialValues={formValues} />
      <DataTable columns={columns} rows={tableRows} />
    </div>
  );
}

export default Users;
