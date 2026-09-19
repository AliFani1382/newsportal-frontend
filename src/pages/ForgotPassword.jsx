import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/passwordResetApi";
import { extractErrorMessage } from "../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>فراموشی رمز عبور</h1>

      {success ? (
        <p className="state-message state-message--success">
          اگر این ایمیل در سامانه ثبت شده باشد، لینک بازیابی رمز عبور برایش
          ارسال شد.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            ایمیل
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          {error && (
            <p className="state-message state-message--error">{error}</p>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "در حال ارسال..." : "ارسال لینک بازیابی"}
          </button>
        </form>
      )}

      <p>
        <Link to="/login">بازگشت به صفحه ورود</Link>
      </p>
    </div>
  );
}
