
export const NEWS_STATUS = {
  Draft: "Draft",
  PendingReview: "PendingReview",
  Published: "Published",
  Rejected: "Rejected",
};

const STATUS_LABELS = {
  [NEWS_STATUS.Draft]: "پیش‌نویس",
  [NEWS_STATUS.PendingReview]: "در انتظار بررسی",
  [NEWS_STATUS.Published]: "منتشرشده",
  [NEWS_STATUS.Rejected]: "رد شده",
};

const STATUS_CLASSES = {
  [NEWS_STATUS.Draft]: "status-badge status-badge--draft",
  [NEWS_STATUS.PendingReview]: "status-badge status-badge--pending",
  [NEWS_STATUS.Published]: "status-badge status-badge--published",
  [NEWS_STATUS.Rejected]: "status-badge status-badge--rejected",
};

export const NEWS_STATUS_OPTIONS = [
  { value: NEWS_STATUS.Draft, label: STATUS_LABELS[NEWS_STATUS.Draft] },
  {
    value: NEWS_STATUS.PendingReview,
    label: STATUS_LABELS[NEWS_STATUS.PendingReview],
  },
  {
    value: NEWS_STATUS.Published,
    label: STATUS_LABELS[NEWS_STATUS.Published],
  },
  { value: NEWS_STATUS.Rejected, label: STATUS_LABELS[NEWS_STATUS.Rejected] },
];

export function getNewsStatusLabel(status) {
  return STATUS_LABELS[status] || status;
}

export function getNewsStatusClass(status) {
  return STATUS_CLASSES[status] || "status-badge";
}

export function getNewsStatusNotice(status) {
  switch (status) {
    case NEWS_STATUS.PendingReview:
      return {
        tone: "info",
        message:
          "این خبر هنوز منتشر نشده و در انتظار بررسی ادمین است. فقط شما و ادمین می‌توانید آن را ببینید.",
      };
    case NEWS_STATUS.Rejected:
      return {
        tone: "error",
        message: "این خبر توسط ادمین رد شده و به‌صورت عمومی نمایش داده نمی‌شود.",
      };
    case NEWS_STATUS.Draft:
      return {
        tone: "info",
        message: "این خبر هنوز پیش‌نویس است و منتشر نشده است.",
      };
    default:
      return null;
  }
}
