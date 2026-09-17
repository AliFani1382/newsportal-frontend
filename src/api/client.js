import axios from "axios";

// تنها منبع Base URL در کل پروژه — هیچ جای دیگری نباید این مقدار را
// دوباره تعریف کند (سایر ماژول‌ها baseURL/origin را از همین‌جا می‌گیرند).
export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7285/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("np_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("np_token");
      localStorage.removeItem("np_user");
      window.dispatchEvent(new Event("np-auth-expired"));
    }
    return Promise.reject(error);
  },
);

// پیام‌های پیش‌فرض بر اساس کد وضعیت HTTP، برای زمانی که پاسخ خطا
// ساختار ApiResponse استاندارد (message/errors) را ندارد — مثلاً پاسخ
// خالی از میان‌افزار Authorization یا از RateLimiter.
const STATUS_FALLBACK_MESSAGES = {
  400: "درخواست نامعتبر است.",
  401: "برای انجام این عملیات باید وارد حساب کاربری خود شوید.",
  403: "شما اجازه دسترسی به این بخش را ندارید.",
  404: "مورد درخواستی پیدا نشد.",
  409: "این عملیات با وضعیت فعلی داده‌ها در تعارض است.",
  429: "تعداد درخواست‌ها بیش از حد مجاز است؛ لطفاً کمی بعد دوباره تلاش کنید.",
  500: "خطای داخلی سرور رخ داد. لطفاً بعداً دوباره تلاش کنید.",
};

export function extractErrorMessage(error) {
  const apiResponse = error?.response?.data;

  if (apiResponse?.errors?.length) {
    return apiResponse.errors.join(" ");
  }
  if (apiResponse?.message) {
    return apiResponse.message;
  }

  const status = error?.response?.status;
  if (status && STATUS_FALLBACK_MESSAGES[status]) {
    return STATUS_FALLBACK_MESSAGES[status];
  }

  return "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.";
}
