import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="state-message">
      <h1>۴۰۴</h1>
      <p>صفحه مورد نظر یافت نشد.</p>
      <Link to="/">بازگشت به صفحه اصلی</Link>
    </div>
  );
}
