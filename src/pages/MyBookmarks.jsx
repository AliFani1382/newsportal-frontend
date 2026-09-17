import { useEffect, useState } from "react";
import NewsCard from "../components/NewsCard";
import { getMyBookmarks } from "../api/bookmarksApi";
import { extractErrorMessage } from "../api/client";
import { useSeo } from "../hooks/useSeo";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function MyBookmarks() {
  useSeo({ title: "نشان‌شده‌های من" });

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyBookmarks()
      .then((res) => {
        if (res.isSuccess) {
          setItems(res.data);
        } else {
          setError(res.message || "دریافت نشان‌شده‌ها با خطا مواجه شد.");
        }
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="home-page">
      <h1>نشان‌شده‌های من</h1>

      {isLoading && <Loading label="در حال بارگذاری..." />}
      {!isLoading && error && <ErrorMessage message={error} />}
      {!isLoading && !error && items.length === 0 && (
        <p className="state-message">هنوز هیچ خبری را نشان نکرده‌اید.</p>
      )}
      {!isLoading && !error && items.length > 0 && (
        <div className="news-grid">
          {items.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      )}
    </div>
  );
}
