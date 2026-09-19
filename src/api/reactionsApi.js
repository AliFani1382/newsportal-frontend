import { apiClient } from "./client";

export function getReaction(newsId) {
  return apiClient.get(`/news/${newsId}/reaction`).then((res) => res.data);
}

export function setReaction(newsId, type) {
  return apiClient
    .put(`/news/${newsId}/reaction`, { type })
    .then((res) => res.data);
}
