import { BASE_URL } from "./client";

// ریشهٔ سایت API (بدون پیشوند /api) — چون فایل‌های استاتیک (تصاویر) از wwwroot سرو می‌شوند
export const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

/**
 * تبدیل یک ImagePath نسبی (مثلاً "uploads/news/abc.jpg") که از بک‌اند می‌آید
 * به آدرس کامل قابل استفاده در تگ <img>.
 * اگر ورودی از قبل یک URL کامل باشد (http/https)، همان بازگردانده می‌شود.
 */
export function resolveImageUrl(imagePath) {
  if (!imagePath || typeof imagePath !== "string") return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return `${API_ORIGIN}/${imagePath.replace(/^\/+/, "")}`;
}

/**
 * خبرها می‌توانند چند تصویر داشته باشند (news.images) که هرکدام
 * displayOrder دارند. فیلد قدیمی news.imagePath همیشه توسط بک‌اند فعلی
 * پر نمی‌شود، پس نباید تنها منبع تصویر در نظر گرفته شود.
 * این تابع لیست تصاویر را بر اساس displayOrder مرتب‌شده برمی‌گرداند و
 * در نبود news.images، به imagePath قدیمی (در صورت وجود) fallback می‌کند.
 */
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

/**
 * آدرس کامل تصویر شاخص (کاور) یک خبر را برمی‌گرداند، یا null اگر
 * خبر هیچ تصویری نداشته باشد.
 */
export function getNewsCoverImage(news) {
  const [cover] = getOrderedImages(news);
  return cover ? resolveImageUrl(cover.imagePath) : null;
}

/**
 * سایر تصاویر خبر (به‌جز کاور) را به‌صورت آرایه‌ای از
 * { id, url } برمی‌گرداند؛ برای نمایش گالری استفاده می‌شود.
 */
export function getNewsGalleryImages(news) {
  const ordered = getOrderedImages(news);
  return ordered.slice(1).map((image) => ({
    id: image.id,
    url: resolveImageUrl(image.imagePath),
  }));
}
