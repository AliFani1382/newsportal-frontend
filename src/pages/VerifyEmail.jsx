import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail, resendVerificationEmail } from "../api/emailVerificationApi";
import { extractErrorMessage } from "../api/client";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState(null);

  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("لینک تأیید ایمیل نامعتبر است.");
      return;
    }

    verifyEmail(token)
      .then((res) => {
        // بک‌اند اکنون ApiResponse<VerifyEmailResponseDto> برمی‌گرداند
        // (res.data.isVerified === true در صورت موفقیت). موفقیت همچنان
        // از روی isSuccess تشخیص داده می‌شود؛ res.data?.isVerified هم
        // در صورت نیاز به بررسی دقیق‌تر در دسترس است.
        if (res.isSuccess) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(res.message || "تأیید ایمیل ناموفق بود.");
        }
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(extractErrorMessage(err));
      });
  }, [token]);

  const handleResend = async (event) => {
    event.preventDefault();
    if (!resendEmail.trim() || isResending) return;

    setIsResending(true);
    setResendMessage(null);

    try {
      const res = await resendVerificationEmail(resendEmail.trim());
      setResendMessage(
        res.message || "در صورت ثبت‌بودن ایمیل، لینک تأیید ارسال خواهد شد.",
      );
    } catch (err) {
      setResendMessage(extractErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>تأیید ایمیل</h1>

      {status === "loading" && (
        <p className="state-message">در حال بررسی لینک تأیید...</p>
      )}

      {status === "success" && (
        <p className="state-message state-message--success">
          ایمیل شما با موفقیت تأیید شد.
        </p>
      )}

      {status === "error" && (
        <>
          <p className="state-message state-message--error">{errorMessage}</p>

          <form className="auth-form" onSubmit={handleResend}>
            <label htmlFor="resend-email">
              ارسال مجدد لینک تأیید ایمیل
            </label>
            <input
              id="resend-email"
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="ایمیل خود را وارد کنید"
              required
            />
            <button type="submit" disabled={isResending}>
              {isResending ? "در حال ارسال..." : "ارسال مجدد لینک"}
            </button>
            {resendMessage && (
              <p className="state-message">{resendMessage}</p>
            )}
          </form>
        </>
      )}

      <p>
        <Link to="/login">بازگشت به صفحه ورود</Link>
      </p>
    </div>
  );
}
