import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(usernameOrEmail, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response ? extractErrorMessage(err) : err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>ورود</h1>

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          نام کاربری یا ایمیل
          <input
            type="text"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
          />
        </label>

        <label>
          رمز عبور
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="state-message state-message--error">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "در حال ورود..." : "ورود"}
        </button>
      </form>

      <p>
        حساب کاربری ندارید؟ <Link to="/register">ثبت‌نام کنید</Link>
      </p>
      <p>
        <Link to="/forgot-password">رمز عبور خود را فراموش کرده‌اید؟</Link>
      </p>
    </div>
  );
}
