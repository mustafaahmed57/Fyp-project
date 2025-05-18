import axios from 'axios';

const API_BASE = "http://localhost:5186/api/Users"; // Replace with your actual port if different

export const getAllUsers = async () => {
  const response = await axios.get(API_BASE);
  return response.data;
};

export const createUser = async (user) => {
  const response = await axios.post(API_BASE, user);
  return response.data;
};

export const updateUser = async (id, user) => {
  const response = await axios.put(`${API_BASE}/${id}`, user);
  return response.data;
};

export const deleteUser = async (id) => {
  await axios.delete(`${API_BASE}/${id}`);
};
