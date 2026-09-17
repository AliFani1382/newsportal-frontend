import { apiClient } from "./client";

export function getComments(newsId) {
  return apiClient.get(`/news/${newsId}/comments`).then((res) => res.data);
}

export function createComment(newsId, content) {
  return apiClient
    .post(`/news/${newsId}/comments`, { content })
    .then((res) => res.data);
}

export function getPendingComments() {
  return apiClient.get("/comments/pending").then((res) => res.data);
}

export function approveComment(id) {
  return apiClient.put(`/comments/${id}/approve`).then((res) => res.data);
}

export function rejectComment(id) {
  return apiClient.put(`/comments/${id}/reject`).then((res) => res.data);
}

export function deleteComment(id) {
  return apiClient.delete(`/comments/${id}`).then((res) => res.data);
}
