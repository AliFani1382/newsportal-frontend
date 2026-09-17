import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <section className="state-message">
      <h1>دسترسی غیرمجاز</h1>
      <p>شما اجازه دسترسی به این بخش را ندارید.</p>
      <Link to="/">بازگشت به صفحه اصلی</Link>
    </section>
  );
}
