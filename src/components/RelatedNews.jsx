import { useEffect, useState } from "react";
import NewsCard from "./NewsCard";
import { getRelatedNews } from "../api/newsApi";

export default function RelatedNews({ newsId }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getRelatedNews(newsId, 4)
      .then((res) => {
        if (res.isSuccess) setItems(res.data);
      })
      .catch(() => {
      })
      .finally(() => setIsLoading(false));
  }, [newsId]);

  if (isLoading || items.length === 0) return null;

  return (
    <section className="related-news">
      <h2>اخبار مرتبط</h2>
      <div className="news-grid">
        {items.map((news) => (
          <NewsCard key={news.id} news={news} />
        ))}
      </div>
    </section>
  );
}
