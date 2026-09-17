import { apiClient } from "./client";

export function requestPasswordReset(email) {
  return apiClient
    .post("/auth/forgot-password", { email })
    .then((res) => res.data);
}

// نکته مهم: بک‌اند واقعی (ResetPasswordDto) فقط token و newPassword می‌خواهد؛
// email و confirmPassword را نمی‌پذیرد (confirmPassword فقط برای اعتبارسنجی
// سمت کلاینت نگه داشته می‌شود، به سرور ارسال نمی‌شود).
export function resetPassword({ token, newPassword }) {
  return apiClient
    .post("/auth/reset-password", { token, newPassword })
    .then((res) => res.data);
}
