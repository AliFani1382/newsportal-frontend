import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllCategories } from "../api/categoryApi";
import { getAllCities } from "../api/cityApi";
import { getAllTags } from "../api/tagsApi";
import { extractErrorMessage } from "../api/client";
import { createNews } from "../api/newsApi";

// صفحهٔ ثبت خبر برای کاربر عادی (نه ادمین). برخلاف فرم ادمین:
// - فقط امکان «ایجاد» خبر دارد، نه ویرایش/تغییر وضعیت.
// - بعد از ثبت موفق، کاربر را به داشبورد ادمین هدایت نمی‌کند؛ به‌جای آن
//   پیام روشنی نمایش می‌دهد که خبر او PendingReview است و منتظر تأیید
//   ادمین می‌ماند — تا کاربر تصور نکند خبرش بلافاصله منتشر شده.
export default function NewsSubmit() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    content: "",
    categoryId: "",
    cityId: "",
  });
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [submittedNews, setSubmittedNews] = useState(null);

  useEffect(() => {
    let active = true;

    Promise.all([getAllCategories(), getAllCities(), getAllTags()])
      .then(([categoriesResponse, citiesResponse, tagsResponse]) => {
        if (!active) return;
        if (categoriesResponse.isSuccess) {
          setCategories(categoriesResponse.data || []);
        }
        if (citiesResponse.isSuccess) {
          setCities(citiesResponse.data || []);
        }
        if (tagsResponse.isSuccess) {
          setTags(tagsResponse.data || []);
        }
      })
      .catch((err) => {
        if (active) setLoadError(extractErrorMessage(err));
      })
      .finally(() => {
        if (active) setIsLoadingOptions(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (imageFiles.length === 0) {
      setPreviewUrls([]);
      return undefined;
    }

    const urls = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [imageFiles]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleTag = (tagId) => {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((existingId) => existingId !== tagId)
        : [...current, tagId],
    );
  };

  const validate = () => {
    if (!form.title.trim()) return "عنوان خبر الزامی است.";
    if (form.title.trim().length > 300)
      return "عنوان خبر نباید بیشتر از ۳۰۰ کاراکتر باشد.";
    if (!form.content.trim()) return "متن خبر الزامی است.";
    if (!form.categoryId) return "انتخاب دسته‌بندی الزامی است.";
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return; // جلوگیری از double submit

    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const dto = {
        title: form.title.trim(),
        content: form.content.trim(),
        categoryId: Number(form.categoryId),
        cityId: form.cityId ? Number(form.cityId) : null,
        imageFiles,
        tagIds: selectedTagIds,
      };

      const response = await createNews(dto);

      if (!response.isSuccess) {
        throw new Error(response.message || "ثبت خبر ناموفق بود.");
      }

      setSubmittedNews(response.data);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : extractErrorMessage(err),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedNews) {
    return (
      <section className="news-submit-page">
        <div className="admin-page-header">
          <h1>خبر شما ثبت شد</h1>
        </div>
        <p className="state-message state-message--success">
          خبر «{submittedNews.title}» با موفقیت ثبت شد و برای بررسی و تأیید
          به ادمین ارسال شده است. تا زمان تأیید ادمین، این خبر به‌صورت عمومی
          منتشر نخواهد شد.
        </p>
        <div className="admin-form__actions">
          <button
            type="button"
            className="admin-button"
            onClick={() => {
              setSubmittedNews(null);
              setForm({ title: "", content: "", categoryId: "", cityId: "" });
              setSelectedTagIds([]);
              setImageFiles([]);
            }}
          >
            ثبت خبر جدید
          </button>
          <Link to="/">بازگشت به صفحه اصلی</Link>
        </div>
      </section>
    );
  }

  if (isLoadingOptions) {
    return <p className="state-message">در حال بارگذاری فرم...</p>;
  }

  if (loadError) {
    return (
      <section className="news-submit-page">
        <p className="state-message state-message--error">{loadError}</p>
      </section>
    );
  }

  return (
    <section className="news-submit-page">
      <div className="admin-page-header">
        <div>
          <h1>ثبت خبر جدید</h1>
          <p>
            خبر شما پس از ثبت، «در انتظار بررسی» ادمین قرار می‌گیرد و پس از
            تأیید، به‌صورت عمومی منتشر می‌شود.
          </p>
        </div>
      </div>

      {formError && (
        <p className="state-message state-message--error">{formError}</p>
      )}

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          عنوان خبر
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={300}
            disabled={isSubmitting}
          />
        </label>

        <label>
          متن خبر
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            rows={12}
            disabled={isSubmitting}
          />
        </label>

        <div className="admin-form__grid">
          <label>
            دسته‌بندی
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              <option value="">انتخاب دسته‌بندی</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            شهر
            <select
              name="cityId"
              value={form.cityId}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="">بدون شهر</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {tags.length > 0 && (
          <div>
            <span>برچسب‌ها</span>
            <div className="admin-tag-checkboxes">
              {tags.map((tag) => (
                <label key={tag.id} className="admin-tag-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTagIds.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                    disabled={isSubmitting}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <label>
          تصاویر (می‌توانید چند تصویر انتخاب کنید)
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={(event) =>
              setImageFiles(Array.from(event.target.files || []))
            }
            disabled={isSubmitting}
          />
        </label>

        {previewUrls.length > 0 && (
          <div className="admin-image-preview admin-image-preview--multi">
            {previewUrls.map((url) => (
              <img key={url} src={url} alt="پیش‌نمایش" />
            ))}
          </div>
        )}

        <div className="admin-form__actions">
          <button type="submit" className="admin-button" disabled={isSubmitting}>
            {isSubmitting ? "در حال ارسال..." : "ارسال خبر برای بررسی"}
          </button>
          <Link to="/">انصراف</Link>
        </div>
      </form>
    </section>
  );
}
