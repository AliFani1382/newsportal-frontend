import { useState } from "react";

export default function ShareButton({ title, url }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        // کاربر اشتراک‌گذاری را لغو کرده یا خطایی رخ داده — نیازی به نمایش خطا نیست
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // اگر کلیپ‌بورد هم در دسترس نبود، کاری از دست فرانت برنمی‌آید
    }
  };

  return (
    <button type="button" className="share-button" onClick={handleShare}>
      {copied ? "لینک کپی شد ✓" : "اشتراک‌گذاری"}
    </button>
  );
}
