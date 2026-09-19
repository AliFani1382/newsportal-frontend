import { apiClient } from "./client";

export function requestPasswordReset(email) {
  return apiClient
    .post("/auth/forgot-password", { email })
    .then((res) => res.data);
}

export function resetPassword({ token, newPassword }) {
  return apiClient
    .post("/auth/reset-password", { token, newPassword })
    .then((res) => res.data);
}
