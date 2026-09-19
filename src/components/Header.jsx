import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getUnreadCount } from "../api/notificationsApi";
import { getAllCategories } from "../api/categoryApi";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    getUnreadCount()
      .then((res) => {
        if (res.isSuccess) setUnreadCount(res.data.count);
      })
      .catch(() => {
      });
  }, [isAuthenticated]);

  useEffect(() => {
    getAllCategories()
      .then((res) => {
        if (res.isSuccess) setCategories(res.data);
      })
      .catch(() => {
      });
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchInput.trim();
    navigate(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/");
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__logo">
          <span className="site-header__logo-mark" aria-hidden="true">
            NP
          </span>
          پورتال خبری
        </Link>

        <form
          className="site-header__search"
          role="search"
          onSubmit={handleSearchSubmit}
        >
          <label htmlFor="site-search" className="visually-hidden">
            جستجو در اخبار
          </label>
          <input
            id="site-search"
            type="search"
            placeholder="جستجو در اخبار..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" aria-label="جستجو">
            جستجو
          </button>
        </form>

        <button
          type="button"
          className="site-header__menu-toggle"
          aria-expanded={isMenuOpen}
          aria-controls="site-header-nav"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{isMenuOpen ? "✕" : "☰"}</span>
          <span className="visually-hidden">باز کردن منو</span>
        </button>

        <nav
          id="site-header-nav"
          className={
            isMenuOpen ? "site-header__nav is-open" : "site-header__nav"
          }
        >
          <Link to="/">صفحه اصلی</Link>
          {isAuthenticated && <Link to="/news/new">ثبت خبر</Link>}
          {isAuthenticated && <Link to="/bookmarks">نشان‌شده‌ها</Link>}
          {isAuthenticated && (
            <Link to="/notifications">
              اعلان‌ها
              {unreadCount > 0 && (
                <span className="site-header__badge">{unreadCount}</span>
              )}
            </Link>
          )}
          {isAuthenticated && user?.role === "Admin" && (
            <Link to="/admin">پنل مدیریت</Link>
          )}
        </nav>

        <div className="site-header__auth">
          {isAuthenticated ? (
            <>
              <Link to="/account" className="site-header__username">
                {user?.fullName || user?.userName}
              </Link>
              <button type="button" onClick={handleLogout}>
                خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login">ورود</Link>
              <Link to="/register">ثبت‌نام</Link>
            </>
          )}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="site-header__categories">
          <div className="site-header__categories-inner">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/?categoryId=${category.id}`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
