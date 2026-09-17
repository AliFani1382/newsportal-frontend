import { useEffect, useState } from "react";
import { createTag, deleteTag, getAllTags, updateTag } from "../../api/tagsApi";
import { extractErrorMessage } from "../../api/client";

export default function AdminTags() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllTags();
      if (!response.isSuccess) throw new Error(response.message || "خطا");
      setItems(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm({ name: "", slug: "" });
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = editingId
        ? await updateTag(editingId, form)
        : await createTag(form);
      if (!response.isSuccess) {
        throw new Error(response.message || "ذخیره برچسب ناموفق بود.");
      }
      reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("آیا از حذف این برچسب مطمئن هستید؟")) return;
    try {
      const response = await deleteTag(id);
      if (!response.isSuccess) {
        throw new Error(response.message || "حذف برچسب ناموفق بود.");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : extractErrorMessage(err));
    }
  };

  if (isLoading) return <p className="state-message">در حال بارگذاری...</p>;

  return (
    <section>
      <div className="admin-page-header">
        <div>
          <h1>مدیریت برچسب‌ها</h1>
          <p>افزودن، ویرایش و حذف برچسب‌های خبری.</p>
        </div>
      </div>

      {error && <p className="state-message state-message--error">{error}</p>}

      <form className="admin-inline-form" onSubmit={submit}>
        <input
          placeholder="نام برچسب"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
        />
        <button type="submit" className="admin-button" disabled={isSubmitting}>
          {editingId ? "ذخیره تغییرات" : "افزودن"}
        </button>
        {editingId && (
          <button type="button" onClick={reset}>
            انصراف
          </button>
        )}
      </form>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>نام</th>
              <th>Slug</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.slug}</td>
                <td className="admin-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setForm({ name: item.name || "", slug: item.slug || "" });
                    }}
                  >
                    ویرایش
                  </button>
                  <button
                    type="button"
                    className="admin-button admin-button--danger"
                    onClick={() => remove(item.id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
