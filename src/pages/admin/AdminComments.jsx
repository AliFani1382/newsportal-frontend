import { useEffect, useState } from "react";
import {
  approveComment,
  deleteComment,
  getPendingComments,
  rejectComment,
} from "../../api/commentsApi";
import { extractErrorMessage } from "../../api/client";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";

export default function AdminComments() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    getPendingComments()
      .then((res) => {
        if (res.isSuccess) {
          setItems(res.data);
        } else {
          setError(res.message || "دریافت دیدگاه‌های در انتظار ناموفق بود.");
        }
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const handleAction = async (action, id) => {
    setProcessingId(id);
    setError(null);
    try {
      const response = await action(id);
      if (!response.isSuccess) {
        throw new Error(response.message || "عملیات ناموفق بود.");
      }
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : extractErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این دیدگاه مطمئن هستید؟")) return;
    await handleAction(deleteComment, id);
  };

  return (
    <section>
      <div className="admin-page-header">
        <div>
          <h1>بررسی دیدگاه‌ها</h1>
          <p>دیدگاه‌های در انتظار تأیید را بررسی کنید.</p>
        </div>
      </div>

      {isLoading && <Loading label="در حال بارگذاری دیدگاه‌ها..." />}
      {!isLoading && error && <ErrorMessage message={error} onRetry={load} />}

      {!isLoading && !error && items.length === 0 && (
        <p className="state-message">دیدگاه در انتظاری وجود ندارد.</p>
      )}

      {!isLoading &&
        !error &&
        items.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-item__meta">
              <strong>{comment.userName}</strong>
              <time dateTime={comment.createdAt}>
                {new Date(comment.createdAt).toLocaleDateString("fa-IR")}
              </time>
            </div>
            <p>{comment.content}</p>
            <div className="admin-actions">
              <button
                type="button"
                className="admin-button"
                disabled={processingId === comment.id}
                onClick={() => handleAction(approveComment, comment.id)}
              >
                تأیید
              </button>
              <button
                type="button"
                disabled={processingId === comment.id}
                onClick={() => handleAction(rejectComment, comment.id)}
              >
                رد
              </button>
              <button
                type="button"
                className="admin-button admin-button--danger"
                disabled={processingId === comment.id}
                onClick={() => handleDelete(comment.id)}
              >
                حذف
              </button>
            </div>
          </div>
        ))}
    </section>
  );
}
