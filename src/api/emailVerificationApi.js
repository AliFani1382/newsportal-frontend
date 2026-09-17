import { apiClient } from "./client";

export function verifyEmail(token) {
  return apiClient.post("/auth/verify-email", { token }).then((res) => res.data);
}

export function resendVerificationEmail(email) {
  return apiClient
    .post("/auth/resend-verification", { email })
    .then((res) => res.data);
}
