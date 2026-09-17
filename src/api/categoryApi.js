import { apiClient } from "./client";

export function getAllCategories() {
  return apiClient.get("/categories").then((res) => res.data);
}

export function getCategoryBySlug(slug) {
  return apiClient.get(`/categories/by-slug/${slug}`).then((res) => res.data);
}

export function createCategory({ name, slug }) {
  return apiClient
    .post("/categories", { name, slug })
    .then((res) => res.data);
}

export function updateCategory(id, { name, slug }) {
  return apiClient
    .put(`/categories/${id}`, { name, slug })
    .then((res) => res.data);
}

export function deleteCategory(id) {
  return apiClient.delete(`/categories/${id}`).then((res) => res.data);
}
