import { apiClient } from "./client";

// منطبق با ReactionsController.cs واقعی: GET/PUT /api/news/{newsId}/reaction
// Type به‌صورت رشته ("Like"/"Dislike") ارسال می‌شود؛ بک‌اند خودش آن را
// به enum ReactionType تبدیل می‌کند (برخلاف NewsStatus که عدد می‌خواهد).

export function getReaction(newsId) {
  return apiClient.get(`/news/${newsId}/reaction`).then((res) => res.data);
}

export function setReaction(newsId, type) {
  return apiClient
    .put(`/news/${newsId}/reaction`, { type })
    .then((res) => res.data);
}
