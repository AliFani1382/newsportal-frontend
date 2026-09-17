import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isBookmarked, addBookmark, removeBookmark } from "../api/bookmarksApi";

export default function BookmarkButton({ newsId }) {
  const { isAuthenticated } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(isAuthenticated);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    isBookmarked(newsId)
      .then((res) => {
        if (res.isSuccess) setBookmarked(res.data.isBookmarked);
      })
      .catch(() => {
        /* خطای دریافت وضعیت بوکمارک نباید کل صفحه را از کار بیندازد */
      })
      .finally(() => setIsLoading(false));
  }, [newsId, isAuthenticated]);

  const handleToggle = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (bookmarked) {
        const res = await removeBookmark(newsId);
        if (res.isSuccess) setBookmarked(false);
      } else {
        const res = await addBookmark(newsId);
        if (res.isSuccess) setBookmarked(true);
      }
    } catch {
      /* خطای موقت شبکه؛ کاربر می‌تواند دوباره کلیک کند */
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <p className="state-message">
        برای نشان‌کردن خبر ابتدا <Link to="/login">وارد شوید</Link>.
      </p>
    );
  }

  return (
    <button
      type="button"
      disabled={isLoading || isSaving}
      className={
        bookmarked
          ? "bookmark-button bookmark-button--active"
          : "bookmark-button"
      }
      onClick={handleToggle}
    >
      {bookmarked ? "★ نشان‌شده" : "☆ نشان‌کردن"}
    </button>
  );
}
