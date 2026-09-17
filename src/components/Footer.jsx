import { useState } from "react";
import { subscribeToNewsletter } from "../api/newsletterApi";
import { extractErrorMessage } from "../api/client";

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const res = await subscribeToNewsletter(email.trim());
      if (!res.isSuccess) {
        throw new Error(res.message || "عضویت ناموفق بود.");
      }
      setStatus("success");
      setMessage("عضویت شما در خبرنامه با موفقیت ثبت شد.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : extractErrorMessage(err));
    }
  };

  return (
    <footer className="site-footer">
      <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>
        پورتال خبری
      </p>
      <p>اخبار، تحلیل‌ها و گزارش‌های روز را دنبال کنید.</p>

      <form className="newsletter-form" onSubmit={handleSubmit}>
        <label htmlFor="newsletter-email">عضویت در خبرنامه</label>
        <div className="newsletter-form__row">
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ایمیل شما"
            required
          />
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "در حال ارسال..." : "عضویت"}
          </button>
        </div>
        {message && (
          <p
            className={
              status === "error"
                ? "state-message state-message--error"
                : "state-message state-message--success"
            }
          >
            {message}
          </p>
        )}
      </form>

      <p>© {year} پورتال خبری. تمامی حقوق محفوظ است.</p>
    </footer>
  );
}
