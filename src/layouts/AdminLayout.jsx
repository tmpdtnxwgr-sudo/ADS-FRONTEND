import { Link, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/admin"
            className="text-xl font-semibold text-blue-700"
          >
            Admin Panel
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              View Store
            </Link>

            <button
              onClick={logout}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 md:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <aside className="rounded-xl border border-slate-200 bg-white p-4">
          <nav className="flex flex-col gap-2">
            <Link
              to="/admin"
              className="rounded-lg px-3 py-2 text-base text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
            >
              Dashboard
            </Link>

            <Link
              to="/admin/products"
              className="rounded-lg px-3 py-2 text-base text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
            >
              Manage Products
            </Link>

            <Link
              to="/admin/payments"
              className="rounded-lg px-3 py-2 text-base text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
            >
              Manage Payments
            </Link>

            <Link
              to="/admin/users"
              className="rounded-lg px-3 py-2 text-base text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
            >
              Manage Users
            </Link>
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}