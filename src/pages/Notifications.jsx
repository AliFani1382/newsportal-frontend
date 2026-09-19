import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotifications, markAsRead, markAllAsRead } from "../api/notificationsApi";
import { extractErrorMessage } from "../api/client";
import { useSeo } from "../hooks/useSeo";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function Notifications() {
  useSeo({ title: "اعلان‌ها" });

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    getNotifications()
      .then((res) => {
        if (res.isSuccess) {
          setItems(res.data);
        } else {
          setError(res.message || "دریافت اعلان‌ها با خطا مواجه شد.");
        }
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch {
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
    }
  };

  return (
    <div className="home-page">
      <div className="admin-page-header">
        <h1>اعلان‌ها</h1>
        {items.some((n) => !n.isRead) && (
          <button type="button" className="admin-button" onClick={handleMarkAllAsRead}>
            علامت‌گذاری همه به‌عنوان خوانده‌شده
          </button>
        )}
      </div>

      {isLoading && <Loading label="در حال بارگذاری..." />}
      {!isLoading && error && <ErrorMessage message={error} onRetry={load} />}
      {!isLoading && !error && items.length === 0 && (
        <p className="state-message">اعلانی وجود ندارد.</p>
      )}

      {!isLoading &&
        !error &&
        items.map((n) => (
          <div
            key={n.id}
            className={
              n.isRead ? "notification-item" : "notification-item notification-item--unread"
            }
          >
            <div>
              <strong>{n.title}</strong>
              <p>{n.message}</p>
              <time>{new Date(n.createdAt).toLocaleDateString("fa-IR")}</time>
            </div>
            <div className="notification-item__actions">
              {n.linkUrl && <Link to={n.linkUrl}>مشاهده</Link>}
              {!n.isRead && (
                <button type="button" onClick={() => handleMarkAsRead(n.id)}>
                  خوانده شد
                </button>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
