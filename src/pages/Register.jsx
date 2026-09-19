import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../api/client";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register(fullName, username, email, password);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response ? extractErrorMessage(err) : err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>ثبت‌نام</h1>

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          نام و نام خانوادگی
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={100}
            required
          />
        </label>

        <label>
          نام کاربری
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            maxLength={50}
            required
          />
        </label>

        <label>
          ایمیل
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          رمز عبور
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            maxLength={100}
            required
          />
        </label>

        {error && <p className="state-message state-message--error">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "در حال ثبت‌نام..." : "ثبت‌نام"}
        </button>
      </form>

      <p>
        قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login">وارد شوید</Link>
      </p>
    </div>
  );
}
