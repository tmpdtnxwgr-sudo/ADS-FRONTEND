
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch users from the backend
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");
      const data = response.data?.data ?? response.data;

      // Support either an array response or an object containing users
      const userList = Array.isArray(data)
        ? data
        : data?.users;

      if (!Array.isArray(userList)) {
        throw new Error("The server returned an unexpected users response.");
      }

      setUsers(userList);
    } catch (err) {
      console.error("Failed to fetch users:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

 useEffect(() => {
  let ignore = false;

  const loadUsers = async () => {
    try {
      const response = await api.get("/admin/users");
      const data = response.data?.data ?? response.data;

      const userList = Array.isArray(data)
        ? data
        : data?.users;

      if (!Array.isArray(userList)) {
        throw new Error("The server returned an unexpected users response.");
      }

      if (!ignore) {
        setUsers(userList);
        setError("");
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);

      if (!ignore) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load users. Please try again."
        );
      }
    } finally {
      if (!ignore) {
        setLoading(false);
      }
    }
  };

  loadUsers();

  return () => {
    ignore = true;
  };
}, []);

  // Suspend, reactivate, or remove a user

const handleUserAction = async (user, action) => {
  const userId = user._id;

  if (!userId) {
    setError("This user does not have a valid ID.");
    return;
  }

  if (user.role === "admin") {
    setError("Admin accounts cannot be managed from this page.");
    return;
  }

  if (!["suspend", "reactivate", "remove"].includes(action)) {
    return;
  }

  const actionMessages = {
    suspend: "suspend",
    reactivate: "reactivate",
    remove: "permanently remove",
  };

  const actionLabel = actionMessages[action];

  const confirmed = window.confirm(
    `Are you sure you want to ${actionLabel} ${user.firstName || user.email}?${
      action === "remove" ? " This action cannot be undone." : ""
    }`
  );

  if (!confirmed) return;

  try {
    setProcessingId(userId);
    setError("");
    setSuccessMessage("");

    if (action === "suspend") {
      await api.patch(`/admin/users/${userId}/suspend`);
    } else if (action === "reactivate") {
      await api.patch(`/admin/users/${userId}/reactivate`);
    } else {
      await api.delete(`/admin/users/${userId}`);
    }

    const successMessages = {
      suspend: "User suspended successfully.",
      reactivate: "User reactivated successfully.",
      remove: "User removed successfully.",
    };

    setSuccessMessage(successMessages[action]);

    await fetchUsers();
  } catch (err) {
    console.error(`Failed to ${action} user:`, err);

    setError(
      err.response?.data?.message ||
        `Unable to ${action} this user. Please try again.`
    );
  } finally {
    setProcessingId(null);
  }
};



  // Search by name or email
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase().trim();

    const fullName = [
      user.firstName || "",
      user.lastName || "",
    ]
      .join(" ")
      .toLowerCase();

    const email = (user.email || "").toLowerCase();

    return fullName.includes(search) || email.includes(search);
  });

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFullName = (user) => {
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return name || "Unnamed user";
  };

  const activeCount = users.filter(
    (user) => user.isActive !== false
  ).length;

  const suspendedCount = users.filter(
    (user) => user.isActive === false
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/admin"
              className="mb-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Manage Users
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              View, search, suspend, reactivate, and remove user accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh Users"}
          </button>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Users
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {users.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Active Users
            </p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {activeCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Suspended Users
            </p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {suspendedCount}
            </p>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {successMessage}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={fetchUsers}
              className="font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* User table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Registered Accounts
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Showing {filteredUsers.length} of {users.length} users
                </p>
              </div>

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name or email..."
                aria-label="Search users by name or email"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-xs"
              />
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-sm text-slate-500">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-semibold text-slate-800">
                No users found
              </p>
              <p className="mt-2 text-sm text-slate-500">
                There are currently no registered accounts to display.
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-slate-500">
              No users match your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Role
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Registered
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredUsers.map((user) => {
                    const isSuspended = user.isActive === false;
                    const isProcessing = processingId === user._id;
                    const isAdmin = user.role === "admin";

                    return (
                      <tr
                        key={user._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="font-medium text-slate-900">
                            {getFullName(user)}
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            {user.email || "No email provided"}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isAdmin
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {user.role || "user"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isSuspended
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {isSuspended ? "Suspended" : "Active"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {formatDate(user.createdAt)}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {!isAdmin && (
                              <>
                                {isSuspended ? (
                                  <button
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={() =>
                                      handleUserAction(user, "reactivate")
                                    }
                                    className="rounded-md bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                                  >
                                    Reactivate
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={() =>
                                      handleUserAction(user, "suspend")
                                    }
                                    className="rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                                  >
                                    Suspend
                                  </button>
                                )}

                                <button
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() =>
                                    handleUserAction(user, "remove")
                                  }
                                  className="rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                                >
                                  Remove
                                </button>
                              </>
                            )}

                            {isAdmin && (
                              <span className="text-xs text-slate-400">
                                Protected account
                              </span>
                            )}

                            {isProcessing && (
                              <span className="text-xs text-slate-500">
                                Processing...
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

