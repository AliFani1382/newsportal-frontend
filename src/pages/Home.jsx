import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import NewsCard from "../components/NewsCard";
import { getPagedNews, getPopularNews, getFeaturedNews } from "../api/newsApi";
import { getAllCategories } from "../api/categoryApi";
import { getAllCities } from "../api/cityApi";
import { getNewsCoverImage } from "../api/imageUrl";
import { extractErrorMessage } from "../api/client";
import { useSeo } from "../hooks/useSeo";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

const PAGE_SIZE = 12;

export default function Home() {
  useSeo({});

  const [searchParams] = useSearchParams();

  const [newsResult, setNewsResult] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [popularNews, setPopularNews] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // اگر از هدر (جستجو یا دسته‌بندی) با query string وارد این صفحه شویم
  // (یا حتی وقتی همین صفحه باز است و هدر لینک جدیدی می‌زند)، فیلترها را
  // با پارامترهای URL هماهنگ می‌کنیم؛ منطق واکشی داده تغییری نکرده است.
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const catId = searchParams.get("categoryId") || "";
    setSearch(q);
    setSearchInput(q);
    setCategoryId(catId);
    setPageNumber(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // دسته‌ها، شهرها، ویژه‌ها و پربازدیدترین‌ها فقط یک‌بار در بارگذاری اولیه واکشی می‌شوند
  useEffect(() => {
    getAllCategories()
      .then((res) => {
        if (res.isSuccess) setCategories(res.data);
      })
      .catch(() => {
        /* عدم موفقیت در بارگذاری فیلتر دسته‌ها نباید کل صفحه را از کار بیندازد */
      });

    getAllCities()
      .then((res) => {
        if (res.isSuccess) setCities(res.data);
      })
      .catch(() => {
        /* عدم موفقیت در بارگذاری فیلتر شهرها نباید کل صفحه را از کار بیندازد */
      });

    getFeaturedNews(4)
      .then((res) => {
        if (res.isSuccess) setFeaturedNews(res.data);
      })
      .catch(() => {
        /* بخش اختیاری؛ خطا نباید کل صفحه را مختل کند */
      });

    getPopularNews(5)
      .then((res) => {
        if (res.isSuccess) setPopularNews(res.data);
      })
      .catch(() => {
        /* بخش اختیاری؛ خطا نباید کل صفحه را مختل کند */
      });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    getPagedNews({
      pageNumber,
      pageSize: PAGE_SIZE,
      categoryId: categoryId || undefined,
      cityId: cityId || undefined,
      search: search || undefined,
    })
      .then((res) => {
        if (res.isSuccess) {
          setNewsResult(res.data);
        } else {
          setError(res.message || "دریافت اخبار با خطا مواجه شد.");
        }
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [pageNumber, categoryId, cityId, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNumber(1);
    setSearch(searchInput.trim());
  };

  // آیتم‌های تازه‌ترین اخبار (صفحه‌ی اول، بدون فیلتر) برای هدر بزرگ و نوار
  // تیتر؛ در نبود دسته‌بندی/جستجوی فعال، همان newsResult فعلی استفاده می‌شود.
  const isDefaultView =
    !categoryId && !cityId && !search && pageNumber === 1;
  const heroItems =
    isDefaultView && newsResult?.items?.length ? newsResult.items : [];
  const heroMain = heroItems[0];
  const heroSide = heroItems.slice(1, 5);
  const tickerItems = heroItems.slice(0, 6);
  const listItems = isDefaultView ? heroItems.slice(5) : newsResult?.items;

  return (
    <div className="home-page">
      {tickerItems.length > 0 && (
        <div className="ticker">
          <span className="ticker__label">تازه‌ترین</span>
          <div className="ticker__track">
            {tickerItems.map((news) => (
              <Link key={news.id} to={`/news/${news.slug}`}>
                {news.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {heroMain && (
        <div className="home-hero">
          <NewsCard news={heroMain} variant="hero" />
          {heroSide.length > 0 && (
            <div className="hero-side">
              {heroSide.map((news) => {
                const image = getNewsCoverImage(news);
                return (
                  <Link
                    key={news.id}
                    to={`/news/${news.slug}`}
                    className="hero-side__item"
                  >
                    {image && <img src={image} alt={news.title} loading="lazy" />}
                    <div>
                      <h4>{news.title}</h4>
                      <time dateTime={news.publicationDate}>
                        {new Date(news.publicationDate).toLocaleDateString(
                          "fa-IR",
                        )}
                      </time>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {featuredNews.length > 0 && (
        <section className="section featured-news">
          <div className="section__header">
            <h2 className="section__title">اخبار ویژه</h2>
          </div>
          <div className="news-grid">
            {featuredNews.map((news) => (
              <NewsCard key={news.id} news={news} badge="ویژه" />
            ))}
          </div>
        </section>
      )}

      <div className="home-layout">
        <div className="home-main">
          <div className="section__header">
            <h2 className="section__title">آخرین اخبار</h2>
          </div>

          <form className="home-filters" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              placeholder="جستجو در اخبار..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />

            <select
              value={categoryId}
              onChange={(e) => {
                setPageNumber(1);
                setCategoryId(e.target.value);
              }}
            >
              <option value="">همه دسته‌ها</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={cityId}
              onChange={(e) => {
                setPageNumber(1);
                setCityId(e.target.value);
              }}
            >
              <option value="">همه شهرها</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button type="submit">جستجو</button>
          </form>

          {isLoading && <Loading label="در حال بارگذاری اخبار..." />}

          {!isLoading && error && <ErrorMessage message={error} />}

          {!isLoading &&
            !error &&
            newsResult &&
            newsResult.items.length === 0 && (
              <p className="state-message">خبری یافت نشد.</p>
            )}

          {!isLoading && !error && newsResult && listItems?.length > 0 && (
            <div className="news-grid">
              {listItems.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
          )}

          {!isLoading && !error && newsResult && (
            <div className="pagination">
              <button
                type="button"
                disabled={!newsResult.hasPreviousPage}
                onClick={() => setPageNumber((p) => p - 1)}
              >
                قبلی
              </button>
              <span>
                صفحه {newsResult.pageNumber} از {newsResult.totalPages}
              </span>
              <button
                type="button"
                disabled={!newsResult.hasNextPage}
                onClick={() => setPageNumber((p) => p + 1)}
              >
                بعدی
              </button>
            </div>
          )}
        </div>

        <aside className="home-aside">
          {popularNews.length > 0 && (
            <div className="aside-widget popular-news">
              <h3 className="aside-widget__title">پربازدیدترین‌ها</h3>
              <ol className="popular-news__list">
                {popularNews.map((news) => (
                  <li key={news.id}>
                    <Link to={`/news/${news.slug}`}>{news.title}</Link>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {categories.length > 0 && (
            <div className="aside-widget">
              <h3 className="aside-widget__title">دسته‌بندی‌ها</h3>
              <div className="category-chips">
                <button
                  type="button"
                  className={
                    categoryId === "" ? "category-chip active" : "category-chip"
                  }
                  onClick={() => {
                    setPageNumber(1);
                    setCategoryId("");
                  }}
                >
                  همه
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={
                      String(categoryId) === String(c.id)
                        ? "category-chip active"
                        : "category-chip"
                    }
                    onClick={() => {
                      setPageNumber(1);
                      setCategoryId(c.id);
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
