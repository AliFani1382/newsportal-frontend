import { apiClient } from "./client";

export function getMyProfile() {
  return apiClient.get("/profile").then((res) => res.data);
}

export function updateMyProfile({ fullName, email }) {
  return apiClient
    .put("/profile", { fullName, email })
    .then((res) => res.data);
}

export function changeMyPassword({
  currentPassword,
  newPassword,
  confirmPassword,
}) {
  return apiClient
    .put("/profile/change-password", {
      currentPassword,
      newPassword,
      confirmPassword,
    })
    .then((res) => res.data);
}
