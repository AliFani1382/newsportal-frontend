import { apiClient } from "./client";

export function subscribeToNewsletter(email) {
  return apiClient
    .post("/newsletter/subscribe", { email })
    .then((res) => res.data);
}

export function unsubscribeFromNewsletter(email) {
  return apiClient
    .post("/newsletter/unsubscribe", { email })
    .then((res) => res.data);
}
