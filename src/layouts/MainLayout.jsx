import { Link, NavLink, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

export default function MainLayout() {
const { user, isAuthenticated, logout } = useAuth();

const isLoggedIn = isAuthenticated;
const isAdmin = isAuthenticated && user?.role === "admin";

const linkClass = ({ isActive }) =>
`text-sm font-medium transition ${
      isActive
        ? "text-amber-500"
        : "text-gray-300 hover:text-amber-400"
    }`;

const handleLogout = async () => {
if (typeof logout === "function") {
await logout();
}
};

return ( <div className="flex min-h-screen flex-col bg-neutral-950 text-white"> <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/95 backdrop-blur"> <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"> <Link
         to="/"
         className="text-2xl font-bold tracking-tight text-amber-400"
       >
YourStore<span className="text-white">.</span> </Link>


      <nav
        aria-label="Main navigation"
        className="flex flex-wrap items-center gap-4 sm:gap-6"
      >
        <NavLink to="/" end className={linkClass}>
          Home
        </NavLink>

        <NavLink to="/products" className={linkClass}>
          Shop
        </NavLink>

        {isLoggedIn && (
          <NavLink to="/my-payments" className={linkClass}>
            My Payments
          </NavLink>
        )}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `rounded-lg border border-amber-400/40 px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-amber-400 text-neutral-950"
                  : "text-amber-400 hover:bg-amber-400 hover:text-neutral-950"
              }`
            }
          >
            Admin Dashboard
          </NavLink>
        )}

        {!isLoggedIn ? (
          <>
            <NavLink to="/login" className={linkClass}>
              Login
            </NavLink>

            <Link
              to="/signup"
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-medium text-gray-300 transition hover:text-amber-400"
          >
            Logout
          </button>
        )}
      </nav>
    </div>
  </header>

  <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
    <Outlet />
  </main>

  <footer className="border-t border-white/10 bg-neutral-950">
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <span>
        © {new Date().getFullYear()} YourStore. All rights reserved.
      </span>

      <Link
        to="/products"
        className="transition hover:text-amber-400"
      >
        Explore the collection →
      </Link>
    </div>
  </footer>
</div>


);
}
