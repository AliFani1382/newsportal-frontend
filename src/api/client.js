import axios from "axios";

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7285/api";

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
