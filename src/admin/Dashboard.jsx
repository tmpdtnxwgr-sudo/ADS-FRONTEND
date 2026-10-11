
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const statistics = [
  {
    key: "totalUsers",
    title: "Total Users",
    description: "Registered customer accounts",
    color: "bg-blue-50 text-blue-700",
  },
  {
    key: "totalProducts",
    title: "Active Products",
    description: "Products available in your store",
    color: "bg-indigo-50 text-indigo-700",
  },
  {
    key: "pendingPayments",
    title: "Payments Awaiting Review",
    description: "Pending and processing payments",
    color: "bg-amber-50 text-amber-700",
  },
  {
    key: "confirmedPayments",
    title: "Confirmed Payments",
    description: "Successfully confirmed payments",
    color: "bg-green-50 text-green-700",
  },
  {
    key: "suspendedUsers",
    title: "Suspended Users",
    description: "Inactive user accounts",
    color: "bg-red-50 text-red-700",
  },
];

const adminLinks = [
  {
    title: "Manage Products",
    description: "Add, edit, view, and remove products.",
    path: "/admin/products",
    button: "Manage Products",
  },
  {
    title: "Manage Users",
    description: "View customer accounts and manage their status.",
    path: "/admin/users",
    button: "Manage Users",
  },
  {
    title: "Manage Payments",
    description: "Review payment notifications and confirm transfers.",
    path: "/admin/payments",
    button: "Manage Payments",
  },
];

const emptyStatistics = {
  totalUsers: 0,
  totalProducts: 0,
  pendingPayments: 0,
  confirmedPayments: 0,
  suspendedUsers: 0,
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(emptyStatistics);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await api.get("/admin/dashboard");
      const data = response.data?.data ?? response.data;

      setDashboardData({
        totalUsers: data.totalUsers ?? 0,
        totalProducts: data.totalProducts ?? 0,
        pendingPayments: data.pendingPayments ?? 0,
        confirmedPayments: data.confirmedPayments ?? 0,
        suspendedUsers: data.suspendedUsers ?? 0,
      });

      setError("");
    } catch (err) {
      console.error("Failed to load admin dashboard:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard statistics. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const response = await api.get("/admin/dashboard");
        const data = response.data?.data ?? response.data;

        if (!cancelled) {
          setDashboardData({
            totalUsers: data.totalUsers ?? 0,
            totalProducts: data.totalProducts ?? 0,
            pendingPayments: data.pendingPayments ?? 0,
            confirmedPayments: data.confirmedPayments ?? 0,
            suspendedUsers: data.suspendedUsers ?? 0,
          });

          setError("");
        }
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load dashboard statistics. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setError("");
    fetchDashboard();
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Administration
            </p>

            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-slate-600">
              Monitor your store and manage its operations from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRetry}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Loading..." : "Refresh Statistics"}
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={handleRetry}
              className="shrink-0 rounded-md border border-red-300 px-4 py-2 font-medium hover:bg-red-100"
            >
              Try Again
            </button>
          </div>
        )}

        <section aria-label="Store statistics">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Store Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A summary of your current store activity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {statistics.map((stat) => (
              <article
                key={stat.key}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {stat.title}
                    </p>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {isLoading ? "—" : dashboardData[stat.key].toLocaleString()}
                    </p>
                  </div>

                  <span
                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${stat.color}`}
                  >
                    Overview
                  </span>
                </div>

                <p className="mt-4 text-sm text-slate-500">
                  {stat.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Administration
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose an area to manage.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {adminLinks.map((item) => (
              <article
                key={item.path}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>

                <Link
                  to={item.path}
                  className="mt-5 inline-flex w-fit items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {item.button}
                  <span aria-hidden="true" className="ml-2">
                    →
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-5 text-sm text-slate-500">
          Dashboard statistics are provided by your store's backend.
        </footer>
      </div>
    </div>
  );
}

