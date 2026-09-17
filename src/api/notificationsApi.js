import { apiClient } from "./client";

export function getNotifications() {
  return apiClient.get("/notifications").then((res) => res.data);
}

export function getUnreadCount() {
  return apiClient
    .get("/notifications/unread-count")
    .then((res) => res.data);
}

export function markAsRead(id) {
  return apiClient.put(`/notifications/${id}/read`).then((res) => res.data);
}

export function markAllAsRead() {
  return apiClient.put("/notifications/read-all").then((res) => res.data);
}
