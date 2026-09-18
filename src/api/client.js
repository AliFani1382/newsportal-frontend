import axios from "axios";

// تنها منبع Base URL در کل پروژه — هیچ جای دیگری نباید این مقدار را
// دوباره تعریف کند (سایر ماژول‌ها baseURL/origin را از همین‌جا می‌گیرند).
export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7285/api";

// کلیدهای localStorage به‌صورت مرکزی اینجا export می‌شوند تا بقیه‌ی
// ماژول‌ها (AuthContext و ...) رشته‌های جادویی را تکرار نکنند.
export const TOKEN_KEY = "np_token";
export const REFRESH_TOKEN_KEY = "np_refresh_token";

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// وقتی چند درخواست هم‌زمان با 401 مواجه شوند، فقط یک درخواست رفرش
// واقعی به سرور می‌زنیم؛ بقیه منتظر نتیجه‌ی همان یکی می‌مانند.
let isRefreshing = false;
let waiters = [];

function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("np_user");
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthRoute = originalRequest?.url?.includes("/auth/");

    // اگر خطا 401 نیست، یا خود درخواست auth بوده (لاگین/رفرش/ثبت‌نام)،
    // یا این درخواست قبلاً یک‌بار retry شده، مسیر قدیمی: سشن را پاک کن.
    if (status !== 401 || isAuthRoute || originalRequest?._retry) {
      if (status === 401) {
        clearAuthStorage();
        window.dispatchEvent(new Event("np-auth-expired"));
      }
      return Promise.reject(error);
    }

    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) {
      clearAuthStorage();
      window.dispatchEvent(new Event("np-auth-expired"));
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // یک رفرش دیگر در حال انجام است؛ منتظر نتیجه‌اش بمان
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waiters.push((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const res = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken: storedRefreshToken,
      });

      const { token, refreshToken } = res.data.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

      waiters.forEach((resolveWaiter) => resolveWaiter(token));
      waiters = [];

      originalRequest.headers.Authorization = `Bearer ${token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      waiters.forEach((resolveWaiter) => resolveWaiter(null));
      waiters = [];

      clearAuthStorage();
      window.dispatchEvent(new Event("np-auth-expired"));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
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
