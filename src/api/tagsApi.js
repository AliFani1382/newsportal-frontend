import { apiClient } from "./client";

export function getAllTags() {
  return apiClient.get("/tags").then((res) => res.data);
}

export function getTagById(id) {
  return apiClient.get(`/tags/${id}`).then((res) => res.data);
}

export function createTag({ name, slug }) {
  return apiClient.post("/tags", { name, slug }).then((res) => res.data);
}

export function updateTag(id, { name, slug }) {
  return apiClient.put(`/tags/${id}`, { name, slug }).then((res) => res.data);
}

export function deleteTag(id) {
  return apiClient.delete(`/tags/${id}`).then((res) => res.data);
}
