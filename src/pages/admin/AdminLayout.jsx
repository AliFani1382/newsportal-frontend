import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <Link to="/admin">پنل مدیریت</Link>
          <span>{user?.fullName || user?.userName}</span>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end>
            داشبورد
          </NavLink>
          <NavLink to="/admin/news">مدیریت اخبار</NavLink>
          <NavLink to="/admin/categories">دسته‌بندی‌ها</NavLink>
          <NavLink to="/admin/cities">شهرها</NavLink>
          <NavLink to="/admin/tags">برچسب‌ها</NavLink>
          <NavLink to="/admin/comments">دیدگاه‌ها</NavLink>
          <NavLink to="/admin/users">کاربران</NavLink>
        </nav>

        <div className="admin-sidebar__footer">
          <Link to="/">مشاهده سایت</Link>
          <button type="button" onClick={handleLogout}>
            خروج
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <strong>مدیریت پورتال خبری</strong>
          <span>نقش: مدیر</span>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
