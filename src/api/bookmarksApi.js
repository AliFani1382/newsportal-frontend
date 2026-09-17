import { apiClient } from "./client";

export function getMyBookmarks() {
  return apiClient.get("/bookmarks").then((res) => res.data);
}

export function isBookmarked(newsId) {
  return apiClient.get(`/news/${newsId}/bookmark`).then((res) => res.data);
}

export function addBookmark(newsId) {
  return apiClient.post(`/news/${newsId}/bookmark`).then((res) => res.data);
}

export function removeBookmark(newsId) {
  return apiClient.delete(`/news/${newsId}/bookmark`).then((res) => res.data);
}
