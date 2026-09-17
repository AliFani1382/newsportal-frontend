import { apiClient } from "./client";

export function getAllCities() {
  return apiClient.get("/cities").then((res) => res.data);
}

export function getCityBySlug(slug) {
  return apiClient.get(`/cities/by-slug/${slug}`).then((res) => res.data);
}

export function createCity({ name, slug }) {
  return apiClient
    .post("/cities", { name, slug })
    .then((res) => res.data);
}

export function updateCity(id, { name, slug }) {
  return apiClient
    .put(`/cities/${id}`, { name, slug })
    .then((res) => res.data);
}

export function deleteCity(id) {
  return apiClient.delete(`/cities/${id}`).then((res) => res.data);
}
