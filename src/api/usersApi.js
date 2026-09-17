import { apiClient } from "./client";

export function getAllUsers() {
  return apiClient.get("/users").then((res) => res.data);
}

export function changeUserRole(id, role) {
  return apiClient
    .put(`/users/${id}/role`, { role })
    .then((res) => res.data);
}
