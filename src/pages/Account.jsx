import { useState } from "react";
import { updateMyProfile, changeMyPassword } from "../api/profileApi";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { useSeo } from "../hooks/useSeo";

export default function Account() {
  const { user, refreshProfile } = useAuth();
  useSeo({ title: "حساب کاربری" });

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!fullName.trim() || !email.trim()) {
      setProfileError("نام کامل و ایمیل الزامی هستند.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await updateMyProfile({
        fullName: fullName.trim(),
        email: email.trim(),
      });
      if (!response.isSuccess) {
        throw new Error(response.message || "به‌روزرسانی پروفایل ناموفق بود.");
      }
      setProfileSuccess("اطلاعات پروفایل با موفقیت ذخیره شد.");
      await refreshProfile();
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : extractErrorMessage(err),
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError("رمز عبور جدید باید حداقل ۶ کاراکتر باشد.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("تکرار رمز عبور جدید با رمز عبور یکسان نیست.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await changeMyPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (!response.isSuccess) {
        throw new Error(response.message || "تغییر رمز عبور ناموفق بود.");
      }
      setPasswordSuccess("رمز عبور با موفقیت تغییر کرد.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : extractErrorMessage(err),
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="account-page">
      <h1>حساب کاربری</h1>

      <section className="account-section">
        <h2>اطلاعات حساب</h2>
        <dl className="account-info">
          <dt>نام کاربری</dt>
          <dd>{user?.userName}</dd>
          <dt>نقش</dt>
          <dd>{user?.role === "Admin" ? "مدیر" : "کاربر عادی"}</dd>
          <dt>وضعیت</dt>
          <dd>{user?.isActive === false ? "غیرفعال" : "فعال"}</dd>
        </dl>
      </section>

      <section className="account-section">
        <h2>ویرایش پروفایل</h2>
        <form className="auth-form" onSubmit={handleProfileSubmit}>
          <label>
            نام کامل
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={100}
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

          {profileError && (
            <p className="state-message state-message--error">
              {profileError}
            </p>
          )}
          {profileSuccess && (
            <p className="state-message state-message--success">
              {profileSuccess}
            </p>
          )}

          <button type="submit" disabled={isSavingProfile}>
            {isSavingProfile ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </form>
      </section>

      <section className="account-section">
        <h2>تغییر رمز عبور</h2>
        <form className="auth-form" onSubmit={handlePasswordSubmit}>
          <label>
            رمز عبور فعلی
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>

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

          {passwordError && (
            <p className="state-message state-message--error">
              {passwordError}
            </p>
          )}
          {passwordSuccess && (
            <p className="state-message state-message--success">
              {passwordSuccess}
            </p>
          )}

          <button type="submit" disabled={isSavingPassword}>
            {isSavingPassword ? "در حال ذخیره..." : "تغییر رمز عبور"}
          </button>
        </form>
      </section>
    </div>
  );
}
