import { apiClient } from "./client";

export function getPagedNews({
  pageNumber = 1,
  pageSize = 10,
  categoryId,
  cityId,
  search,
} = {}) {
  return apiClient
    .get("/news", {
      params: { pageNumber, pageSize, categoryId, cityId, search },
    })
    .then((res) => res.data);
}

export function getNewsById(id) {
  return apiClient.get(`/news/${id}`).then((res) => res.data);
}

export function getNewsBySlug(slug) {
  return apiClient.get(`/news/by-slug/${slug}`).then((res) => res.data);
}

export function getRelatedNews(id, count = 5) {
  return apiClient
    .get(`/news/${id}/related`, { params: { count } })
    .then((res) => res.data);
}

export function getPopularNews(count = 5) {
  return apiClient
    .get("/news/popular", { params: { count } })
    .then((res) => res.data);
}

export function getFeaturedNews(count = 5) {
  return apiClient
    .get("/news/featured", { params: { count } })
    .then((res) => res.data);
}

export function incrementViewCount(id) {
  return apiClient.post(`/news/${id}/view`).then((res) => res.data);
}

export function setFeatured(id, isFeatured) {
  return apiClient
    .put(`/news/${id}/featured`, null, { params: { isFeatured } })
    .then((res) => res.data);
}

// dto: { title, content, categoryId, cityId, imageFiles, tagIds }
// imageFiles: آرایه‌ای از File (اختیاری، صفر تا چند تصویر)
// tagIds: آرایه‌ای از شناسه عددی برچسب‌ها (اختیاری)
function buildNewsFormData(dto) {
  const formData = new FormData();
  formData.append("title", dto.title);
  formData.append("content", dto.content);
  formData.append("categoryId", dto.categoryId);
  if (dto.cityId !== undefined && dto.cityId !== null) {
    formData.append("cityId", dto.cityId);
  }
  (dto.imageFiles || []).forEach((file) => {
    formData.append("imageFiles", file);
  });
  (dto.tagIds || []).forEach((tagId) => {
    formData.append("tagIds", tagId);
  });
  return formData;
}

export function createNews(dto) {
  return apiClient
    .post("/news", buildNewsFormData(dto), {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
}

export function updateNews(id, dto) {
  return apiClient
    .put(`/news/${id}`, buildNewsFormData(dto), {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
}

export function deleteNews(id) {
  return apiClient.delete(`/news/${id}`).then((res) => res.data);
}

// نگاشت نام‌های وضعیت به مقدار عددی enum واقعی بک‌اند (NewsStatus.cs)
// چون Program.cs کانورتر JsonStringEnumConverter را ثبت نکرده، بک‌اند
// enum ها را به‌صورت عدد انتظار دارد، نه رشته. (در بک‌اند جدید هم بررسی
// و تأیید شد که این هنوز صادق است.)
const NEWS_STATUS_VALUES = {
  Draft: 0,
  PendingReview: 1,
  Published: 2,
  Rejected: 3,
};

export function changeNewsStatus(id, status) {
  return apiClient
    .put(`/news/${id}/status`, { status: NEWS_STATUS_VALUES[status] })
    .then((res) => res.data);
}
