import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteNews, getPagedNews, changeNewsStatus } from "../../api/newsApi";
import { extractErrorMessage } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import { NEWS_STATUS_OPTIONS } from "../../constants/newsStatus";

export default function AdminNewsList() {
  const [result, setResult] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const pageSize = 12;

  const loadNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPagedNews({ pageNumber, pageSize });
      if (!response.isSuccess) {
        throw new Error(response.message || "دریافت اخبار ناموفق بود.");
      }
      setResult(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const visibleItems = useMemo(() => {
    if (!result?.items) return [];
    if (!statusFilter) return result.items;
    return result.items.filter((news) => news.status === statusFilter);
  }, [result, statusFilter]);

  const handleStatusChange = async (news, newStatus) => {
    setSavingId(news.id);
    setError(null);
    try {
      const response = await changeNewsStatus(news.id, newStatus);
      if (!response.isSuccess) {
        throw new Error(response.message || "تغییر وضعیت ناموفق بود.");
      }
      await loadNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : extractErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این خبر مطمئن هستید؟")) return;

    try {
      const response = await deleteNews(id);
      if (!response.isSuccess) {
        throw new Error(response.message || "حذف خبر ناموفق بود.");
      }
      await loadNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : extractErrorMessage(err));
    }
  };

  if (isLoading) {
    return <Loading label="در حال بارگذاری اخبار..." />;
  }

  return (
    <section>
      <div className="admin-page-header">
        <div>
          <h1>مدیریت اخبار</h1>
          <p>اخبار ثبت‌شده را مدیریت کنید.</p>
        </div>
        <Link className="admin-button" to="/admin/news/new">
          + خبر جدید
        </Link>
      </div>

      <div className="admin-filters">
        <label>
          فیلتر وضعیت (در همین صفحه)
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">همه وضعیت‌ها</option>
            {NEWS_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ErrorMessage message={error} onRetry={loadNews} />

      {!error && visibleItems.length === 0 && (
        <p className="state-message">خبری یافت نشد.</p>
      )}

      {!error && visibleItems.length > 0 && (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>دسته‌بندی</th>
                  <th>شهر</th>
                  <th>نویسنده</th>
                  <th>تاریخ</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((news) => (
                  <tr key={news.id}>
                    <td>{news.title}</td>
                    <td>{news.categoryName || "—"}</td>
                    <td>{news.cityName || "—"}</td>
                    <td>{news.writerName || "—"}</td>
                    <td>
                      {news.publicationDate
                        ? new Date(news.publicationDate).toLocaleDateString(
                            "fa-IR",
                          )
                        : "—"}
                    </td>
                    <td>
                      <div className="admin-status-cell">
                        <StatusBadge status={news.status} />
                        <select
                          value={news.status}
                          disabled={savingId === news.id}
                          onChange={(e) =>
                            handleStatusChange(news, e.target.value)
                          }
                        >
                          {NEWS_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="admin-actions">
                      <Link to={`/admin/news/edit/${news.id}`}>ویرایش</Link>
                      <button
                        type="button"
                        className="admin-button admin-button--danger"
                        onClick={() => handleDelete(news.id)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              type="button"
              disabled={!result.hasPreviousPage}
              onClick={() => setPageNumber((page) => page - 1)}
            >
              قبلی
            </button>
            <span>
              صفحه {result.pageNumber} از {result.totalPages}
            </span>
            <button
              type="button"
              disabled={!result.hasNextPage}
              onClick={() => setPageNumber((page) => page + 1)}
            >
              بعدی
            </button>
          </div>
        </>
      )}
    </section>
  );
}
