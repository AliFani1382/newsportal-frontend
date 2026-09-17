import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import NewsDetail from "./pages/NewsDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import NewsSubmit from "./pages/NewsSubmit";
import MyBookmarks from "./pages/MyBookmarks";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminNewsList from "./pages/admin/AdminNewsList";
import AdminNewsForm from "./pages/admin/AdminNewsForm";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCities from "./pages/admin/AdminCities";
import AdminTags from "./pages/admin/AdminTags";
import AdminComments from "./pages/admin/AdminComments";
import AdminUsers from "./pages/admin/AdminUsers";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forbidden" element={<Forbidden />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/news/new" element={<NewsSubmit />} />
          <Route path="/account" element={<Account />} />
          <Route path="/bookmarks" element={<MyBookmarks />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/news" element={<AdminNewsList />} />
          <Route path="/admin/news/new" element={<AdminNewsForm />} />
          <Route path="/admin/news/edit/:id" element={<AdminNewsForm />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/cities" element={<AdminCities />} />
          <Route path="/admin/tags" element={<AdminTags />} />
          <Route path="/admin/comments" element={<AdminComments />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
