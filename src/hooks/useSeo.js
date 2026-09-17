import { useEffect } from "react";

const DEFAULT_TITLE = "پورتال خبری";
const DEFAULT_DESCRIPTION = "آخرین اخبار از دسته‌بندی‌ها و شهرهای مختلف";

function setMetaTag(name, content, attr = "name") {
  if (!content) return;
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

/**
 * تنظیم عنوان صفحه و متادیتای سئو برای هر صفحه.
 * @param {{ title?: string, description?: string, image?: string }} options
 */
export function useSeo({ title, description, image } = {}) {
  useEffect(() => {
    document.title = title ? `${title} | پورتال خبری` : DEFAULT_TITLE;

    setMetaTag("description", description || DEFAULT_DESCRIPTION);
    setMetaTag("og:title", title || DEFAULT_TITLE, "property");
    setMetaTag(
      "og:description",
      description || DEFAULT_DESCRIPTION,
      "property",
    );
    if (image) {
      setMetaTag("og:image", image, "property");
    }

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description, image]);
}
