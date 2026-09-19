import { BASE_URL } from "./client";

export const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

export function resolveImageUrl(imagePath) {
  if (!imagePath || typeof imagePath !== "string") return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return `${API_ORIGIN}/${imagePath.replace(/^\/+/, "")}`;
}

function getOrderedImages(news) {
  if (!news) return [];

  if (Array.isArray(news.images) && news.images.length > 0) {
    return [...news.images].sort((a, b) => {
      const orderDiff = (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return (a.id ?? 0) - (b.id ?? 0);
    });
  }

  if (news.imagePath) {
    return [{ id: "legacy", imagePath: news.imagePath, displayOrder: 0 }];
  }

  return [];
}

export function getNewsCoverImage(news) {
  const [cover] = getOrderedImages(news);
  return cover ? resolveImageUrl(cover.imagePath) : null;
}

export function getNewsGalleryImages(news) {
  const ordered = getOrderedImages(news);
  return ordered.slice(1).map((image) => ({
    id: image.id,
    url: resolveImageUrl(image.imagePath),
  }));
}
