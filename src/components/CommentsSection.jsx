import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getComments, createComment, deleteComment } from "../api/commentsApi";
import { extractErrorMessage } from "../api/client";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";

export default function CommentsSection({ newsId }) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadComments = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);

    getComments(newsId)
      .then((res) => {
        if (res.isSuccess) {
          setComments(res.data);
        } else {
          setLoadError(res.message || "دریافت دیدگاه‌ها با خطا مواجه شد.");
        }
      })
      .catch((err) => setLoadError(extractErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [newsId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      setFormError("متن دیدگاه نمی‌تواند خالی باشد.");
      return;
    }

    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await createComment(newsId, content.trim());
      if (!res.isSuccess) {
        throw new Error(res.message || "ارسال دیدگاه ناموفق بود.");
      }
      setContent("");
      setFormSuccess("دیدگاه شما ثبت شد و پس از تأیید ادمین نمایش داده می‌شود.");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : extractErrorMessage(err),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (deletingId) return; // جلوگیری از درخواست تکراری

    setDeletingId(commentId);
    setLoadError(null);

    try {
      const res = await deleteComment(commentId);
      if (!res.isSuccess) {
        throw new Error(res.message || "حذف دیدگاه ناموفق بود.");
      }
      setComments((current) => current.filter((c) => c.id !== commentId));
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : extractErrorMessage(err),
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="comments-section">
      <h2>دیدگاه‌ها</h2>

      {isLoading && <Loading label="در حال بارگذاری دیدگاه‌ها..." />}

      {!isLoading && loadError && (
        <ErrorMessage message={loadError} onRetry={loadComments} />
      )}

      {!isLoading && !loadError && comments.length === 0 && (
        <p className="state-message">هنوز دیدگاهی برای این خبر ثبت نشده است.</p>
      )}

      {!isLoading &&
        !loadError &&
        comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-item__meta">
              <strong>{comment.userName}</strong>
              <time dateTime={comment.createdAt}>
                {new Date(comment.createdAt).toLocaleDateString("fa-IR")}
              </time>
            </div>
            <p>{comment.content}</p>
            {isAuthenticated && user?.id === comment.userId && (
              <button
                type="button"
                className="comment-item__delete"
                disabled={deletingId === comment.id}
                onClick={() => handleDelete(comment.id)}
              >
                {deletingId === comment.id ? "در حال حذف..." : "حذف دیدگاه"}
              </button>
            )}
          </div>
        ))}

      {isAuthenticated ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <label htmlFor="comment-content">ثبت دیدگاه</label>
          <textarea
            id="comment-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="دیدگاه خود را بنویسید..."
            maxLength={1000}
          />

          {formError && (
            <p className="state-message state-message--error">{formError}</p>
          )}
          {formSuccess && (
            <p className="state-message state-message--success">
              {formSuccess}
            </p>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "در حال ارسال..." : "ارسال دیدگاه"}
          </button>
        </form>
      ) : (
        <p className="state-message">
          برای ارسال دیدگاه ابتدا <Link to="/login">وارد شوید</Link>.
        </p>
      )}
    </section>
  );
}
