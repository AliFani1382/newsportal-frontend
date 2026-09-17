import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getNewsBySlug, incrementViewCount } from "../api/newsApi";
import { getNewsCoverImage, getNewsGalleryImages } from "../api/imageUrl";
import { extractErrorMessage } from "../api/client";
import { useSeo } from "../hooks/useSeo";
import ShareButton from "../components/ShareButton";
import CommentsSection from "../components/CommentsSection";
import ReactionButtons from "../components/ReactionButtons";
import BookmarkButton from "../components/BookmarkButton";
import RelatedNews from "../components/RelatedNews";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { getNewsStatusNotice } from "../constants/newsStatus";

export default function NewsDetail() {
  const { slug } = useParams();
  const [news, setNews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  useSeo({
    title: news?.title,
    description: news?.content?.slice(0, 150),
    image: getNewsCoverImage(news),
  });

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setNews(null);

    getNewsBySlug(slug)
      .then((res) => {
        if (res.isSuccess) {
          setNews(res.data);
          // شمارش بازدید — اختیاری است، خطای آن نباید نمایش خبر را مختل کند
          incrementViewCount(res.data.id).catch(() => {});
        } else {
          setError(res.message || "خبر یافت نشد.");
        }
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [slug]);

  // بستن Lightbox با کلید Esc
  useEffect(() => {
    if (!lightboxImage) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setLightboxImage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage]);

  if (isLoading) {
    return <Loading label="در حال بارگذاری خبر..." />;
  }

  if (error) {
    return (
      <div className="news-detail">
        <ErrorMessage message={error} />
        <Link to="/">بازگشت به صفحه اصلی</Link>
      </div>
    );
  }

  if (!news) return null;

  const imageUrl = getNewsCoverImage(news);
  const galleryImages = getNewsGalleryImages(news);
  const statusNotice = getNewsStatusNotice(news.status);

  return (
    <article className="news-detail">
      <Link to="/" className="news-detail__back">
        ← بازگشت به صفحه اصلی
      </Link>

      {statusNotice && (
        <p className={`state-message state-message--${statusNotice.tone}`}>
          {statusNotice.message}
        </p>
      )}

      {news.categoryName && (
        <span className="news-detail__category">{news.categoryName}</span>
      )}

      <h1 className="news-detail__title">{news.title}</h1>

      <div className="news-detail__meta">
        {news.writerName && <span>نویسنده: {news.writerName}</span>}
        {news.cityName && <span>{news.cityName}</span>}
        <time dateTime={news.publicationDate}>
          {new Date(news.publicationDate).toLocaleDateString("fa-IR")}
        </time>
        {news.updatedAt && (
          <span>
            به‌روزرسانی: {new Date(news.updatedAt).toLocaleDateString("fa-IR")}
          </span>
        )}
      </div>

      {news.tags?.length > 0 && (
        <div className="news-detail__tags">
          {news.tags.map((tag) => (
            <span key={tag.id} className="tag-chip">
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="news-detail__actions">
        <ShareButton title={news.title} />
        <BookmarkButton newsId={news.id} />
      </div>

      {imageUrl && (
        <img className="news-detail__image" src={imageUrl} alt={news.title} />
      )}

      {galleryImages.length > 0 && (
        <div className="news-detail__gallery">
          {galleryImages.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setLightboxImage(img.url)}
              aria-label="بزرگ‌نمایی تصویر"
            >
              <img src={img.url} alt={news.title} loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <div className="news-detail__content">
        {news.content.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <ReactionButtons newsId={news.id} />

      <RelatedNews newsId={news.id} />

      <CommentsSection newsId={news.id} />

      {lightboxImage && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            className="gallery-lightbox__close"
            onClick={() => setLightboxImage(null)}
            aria-label="بستن"
          >
            ✕
          </button>
          <img src={lightboxImage} alt={news.title} />
        </div>
      )}
    </article>
  );
}
