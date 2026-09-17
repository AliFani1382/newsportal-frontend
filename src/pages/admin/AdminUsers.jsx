import { useEffect, useState } from "react";
import { extractErrorMessage } from "../../api/client";
import { changeUserRole, getAllUsers } from "../../api/usersApi";
import { useAuth } from "../../hooks/useAuth";

const ROLES = ["User", "Admin"];

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState(null);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllUsers();
      if (!response.isSuccess) {
        throw new Error(response.message || "دریافت کاربران ناموفق بود.");
      }

      const data = response.data || [];
      setUsers(data);
      setRoles(
        Object.fromEntries(
          data.map((item) => [item.id, item.role || "User"]),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const saveRole = async (id) => {
    const role = roles[id];
    if (!role) return;

    setSavingId(id);
    setError(null);

    try {
      const response = await changeUserRole(id, role);
      if (!response.isSuccess) {
        throw new Error(response.message || "تغییر نقش ناموفق بود.");
      }
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : extractErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  if (isLoading) return <p className="state-message">در حال بارگذاری کاربران...</p>;

  return (
    <section>
      <div className="admin-page-header">
        <div>
          <h1>مدیریت کاربران</h1>
          <p>نقش کاربران را مشاهده و مدیریت کنید.</p>
        </div>
      </div>

      {error && <p className="state-message state-message--error">{error}</p>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>نام کاربری</th>
              <th>نام کامل</th>
              <th>ایمیل</th>
              <th>نقش</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => {
              const isCurrentUser = item.id === currentUser?.id;
              return (
                <tr key={item.id}>
                  <td>{item.username}</td>
                  <td>{item.fullName || "—"}</td>
                  <td>{item.email}</td>
                  <td>
                    <select
                      value={roles[item.id] || item.role || "User"}
                      onChange={(event) =>
                        setRoles((current) => ({
                          ...current,
                          [item.id]: event.target.value,
                        }))
                      }
                      disabled={isCurrentUser}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{item.isActive ? "فعال" : "غیرفعال"}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-button"
                      disabled={isCurrentUser || savingId === item.id}
                      onClick={() => saveRole(item.id)}
                    >
                      {savingId === item.id ? "در حال ذخیره..." : "ذخیره نقش"}
                    </button>
                    {isCurrentUser && (
                      <small className="admin-muted"> نقش حساب فعلی</small>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
