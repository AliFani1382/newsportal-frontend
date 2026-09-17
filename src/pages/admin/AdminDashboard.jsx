import { Link } from "react-router-dom";

const cards = [
  {
    title: "مدیریت اخبار",
    description: "مشاهده، ایجاد، ویرایش و حذف اخبار.",
    to: "/admin/news",
  },
  {
    title: "دسته‌بندی‌ها",
    description: "مدیریت دسته‌بندی‌های خبری.",
    to: "/admin/categories",
  },
  {
    title: "شهرها",
    description: "مدیریت شهرهای قابل انتخاب برای اخبار.",
    to: "/admin/cities",
  },
  {
    title: "برچسب‌ها",
    description: "مدیریت برچسب‌های خبری.",
    to: "/admin/tags",
  },
  {
    title: "دیدگاه‌ها",
    description: "بررسی و تأیید دیدگاه‌های در انتظار.",
    to: "/admin/comments",
  },
  {
    title: "کاربران",
    description: "مشاهده کاربران و تغییر نقش آن‌ها.",
    to: "/admin/users",
  },
];

export default function AdminDashboard() {
  return (
    <section>
      <div className="admin-page-header">
        <div>
          <h1>داشبورد مدیریت</h1>
          <p>از این بخش محتوای پورتال را مدیریت کنید.</p>
        </div>
      </div>

      <div className="admin-card-grid">
        {cards.map((card) => (
          <Link key={card.to} to={card.to} className="admin-card">
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <span>ورود ←</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
