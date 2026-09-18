import { apiClient } from "./client";

// بدنه دقیق مطابق RegisterDto.cs بک‌اند
export function register({ fullName, username, email, password }) {
  return apiClient
    .post("/auth/register", { fullName, username, email, password })
    .then((res) => res.data);
}

// بدنه دقیق مطابق LoginDto.cs بک‌اند (فیلد usernameOrEmail است، نه username)
export function login({ usernameOrEmail, password }) {
  return apiClient
    .post("/auth/login", { usernameOrEmail, password })
    .then((res) => res.data);
}

export function refreshAccessToken(refreshToken) {
  return apiClient.post("/auth/refresh", { refreshToken }).then((r) => r.data);
}

export function logout(refreshToken) {
  return apiClient.post("/auth/logout", { refreshToken }).then((r) => r.data);
}
