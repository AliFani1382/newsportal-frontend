import { Link } from "react-router-dom";
import { getNewsCoverImage } from "../api/imageUrl";

// یک خلاصه‌ی کوتاه از متن کامل خبر می‌سازد؛ چون DTO بک‌اند فیلد جداگانه‌ای
// برای "خلاصه" ندارد (فقط content کامل را برمی‌گرداند)، این یک برش
// سمت فرانت از همان محتواست، نه یک فیلد summary واقعی از بک‌اند.
function buildExcerpt(content, max = 110) {
  if (!content) return "";
  const flat = content.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}

export default function NewsCard({ news, variant = "default", badge }) {
  const imageUrl = getNewsCoverImage(news);
  const cardClassName =
    variant === "default" ? "news-card" : `news-card news-card--${variant}`;
  const showExcerpt = variant === "hero" || variant === "default";

  return (
    <article className={cardClassName}>
      <Link to={`/news/${news.slug}`} className="news-card__link">
        <div className="news-card__image-wrap">
          {imageUrl ? (
            <img
              className="news-card__image"
              src={imageUrl}
              alt={news.title}
              loading="lazy"
            />
          ) : (
            variant === "hero" && (
              <div className="news-card__image" aria-hidden="true" />
            )
          )}
          {badge && <span className="news-card__badge">{badge}</span>}
        </div>
        <div className="news-card__body">
          {news.categoryName && (
            <span className="news-card__category">{news.categoryName}</span>
          )}
          <h3 className="news-card__title">{news.title}</h3>
          {showExcerpt && (
            <p className="news-card__excerpt">{buildExcerpt(news.content)}</p>
          )}
          <div className="news-card__meta">
            {news.cityName && <span>{news.cityName}</span>}
            <time dateTime={news.publicationDate}>
              {new Date(news.publicationDate).toLocaleDateString("fa-IR")}
            </time>
          </div>
        </div>
      </Link>
    </article>
  );
}
