import axios from 'axios';

const BASE_URL = 'http://localhost:5186/api/products';

export const getAllProducts = () => axios.get(BASE_URL);

export const getLastProductCode = (prefix) =>
  axios.get(`${BASE_URL}/last-code?prefix=${prefix}`);

export const addProduct = (product) =>
  axios.post(BASE_URL, product);

export const updateProduct = (id, product) =>
  axios.put(`${BASE_URL}/${id}`, product);

export const deleteProduct = (id) =>
  axios.delete(`${BASE_URL}/${id}`);
