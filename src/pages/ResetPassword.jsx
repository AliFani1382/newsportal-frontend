import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/passwordResetApi";
import { extractErrorMessage } from "../api/client";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("لینک بازیابی نامعتبر است.");
      return;
    }

    if (newPassword.length < 6) {
      setError("رمز عبور جدید باید حداقل ۶ کاراکتر باشد.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("تکرار رمز عبور با رمز عبور یکسان نیست.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword({ token, newPassword });
      if (!res.isSuccess) {
        throw new Error(res.message || "بازیابی رمز عبور ناموفق بود.");
      }
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>تنظیم رمز عبور جدید</h1>

      {!token && (
        <p className="state-message state-message--error">
          لینک بازیابی نامعتبر یا ناقص است.
        </p>
      )}

      {success ? (
        <p className="state-message state-message--success">
          رمز عبور با موفقیت تغییر کرد. در حال انتقال به صفحه ورود...
        </p>
      ) : (
        token && (
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              رمز عبور جدید
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>

            <label>
              تکرار رمز عبور جدید
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>

            {error && (
              <p className="state-message state-message--error">{error}</p>
            )}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "در حال ذخیره..." : "تغییر رمز عبور"}
            </button>
          </form>
        )
      )}

      <p>
        <Link to="/login">بازگشت به صفحه ورود</Link>
      </p>
    </div>
  );
}
