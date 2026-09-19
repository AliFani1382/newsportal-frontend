import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getReaction, setReaction } from "../api/reactionsApi";

export default function ReactionButtons({ newsId }) {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState({
    likeCount: 0,
    dislikeCount: 0,
    myReaction: null,
  });
  const [isLoading, setIsLoading] = useState(isAuthenticated);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    getReaction(newsId)
      .then((res) => {
        if (res.isSuccess) setData(res.data);
      })
      .catch(() => {
      })
      .finally(() => setIsLoading(false));
  }, [newsId, isAuthenticated]);

  const handleReact = async (type) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const res = await setReaction(newsId, type);
      if (res.isSuccess) setData(res.data);
    } catch {
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <p className="state-message">
        برای پسندیدن خبر ابتدا <Link to="/login">وارد شوید</Link>.
      </p>
    );
  }

  return (
    <div className="reaction-buttons">
      <button
        type="button"
        disabled={isLoading || isSaving}
        className={
          data.myReaction === "Like"
            ? "reaction-button reaction-button--active"
            : "reaction-button"
        }
        onClick={() => handleReact("Like")}
      >
        👍 {data.likeCount}
      </button>
      <button
        type="button"
        disabled={isLoading || isSaving}
        className={
          data.myReaction === "Dislike"
            ? "reaction-button reaction-button--active"
            : "reaction-button"
        }
        onClick={() => handleReact("Dislike")}
      >
        👎 {data.dislikeCount}
      </button>
    </div>
  );
}
