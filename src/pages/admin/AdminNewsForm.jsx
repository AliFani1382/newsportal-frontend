import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAllCategories } from "../../api/categoryApi";
import { getAllCities } from "../../api/cityApi";
import { getAllTags } from "../../api/tagsApi";
import { extractErrorMessage } from "../../api/client";
import { createNews, getNewsById, updateNews } from "../../api/newsApi";
import { getNewsCoverImage, getNewsGalleryImages } from "../../api/imageUrl";

export default function AdminNewsForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
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
  const [currentImage, setCurrentImage] = useState("");
  const [currentGallery, setCurrentGallery] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
        if (active) setError(extractErrorMessage(err));
      });

    if (isEdit) {
      getNewsById(id)
        .then((response) => {
          if (!active) return;
          if (!response.isSuccess) {
            throw new Error(response.message || "خبر یافت نشد.");
          }
          const news = response.data;
          setForm({
            title: news.title || "",
            content: news.content || "",
            categoryId: news.categoryId ?? "",
            cityId: news.cityId ?? "",
          });
          setCurrentImage(getNewsCoverImage(news));
          setCurrentGallery(getNewsGalleryImages(news));
          setSelectedTagIds((news.tags || []).map((t) => t.id));
        })
        .catch((err) => {
          if (active) {
            setError(
              err instanceof Error ? err.message : extractErrorMessage(err),
            );
          }
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [id, isEdit]);

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
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.content.trim() || !form.categoryId) {
      setError("عنوان، متن و دسته‌بندی خبر الزامی هستند.");
      return;
    }

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

      const response = isEdit
        ? await updateNews(id, dto)
        : await createNews(dto);

      if (!response.isSuccess) {
        throw new Error(response.message || "ذخیره خبر ناموفق بود.");
      }

      navigate("/admin/news", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="state-message">در حال بارگذاری خبر...</p>;
  }

  return (
    <section className="admin-form-page">
      <div className="admin-page-header">
        <div>
          <h1>{isEdit ? "ویرایش خبر" : "ثبت خبر جدید"}</h1>
          <p>اطلاعات خبر را وارد کنید.</p>
        </div>
        <Link to="/admin/news">بازگشت به اخبار</Link>
      </div>

      {error && <p className="state-message state-message--error">{error}</p>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          عنوان خبر
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={300}
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
            <select name="cityId" value={form.cityId} onChange={handleChange}>
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
          />
        </label>

        {previewUrls.length > 0 && (
          <div className="admin-image-preview admin-image-preview--multi">
            {previewUrls.map((url) => (
              <img key={url} src={url} alt="پیش‌نمایش" />
            ))}
          </div>
        )}

        {previewUrls.length === 0 && (currentImage || currentGallery.length > 0) && (
          <div className="admin-image-preview admin-image-preview--multi">
            {currentImage && <img src={currentImage} alt="تصویر فعلی" />}
            {currentGallery.map((img) => (
              <img key={img.id} src={img.url} alt="تصویر فعلی" />
            ))}
          </div>
        )}

        <div className="admin-form__actions">
          <button type="submit" className="admin-button" disabled={isSubmitting}>
            {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
          </button>
          <Link to="/admin/news">انصراف</Link>
        </div>
      </form>
    </section>
  );
}
