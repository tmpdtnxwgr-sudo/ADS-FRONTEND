import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get("/payment/my-payments");
        const responseData = response.data?.data ?? response.data;

        if (!Array.isArray(responseData)) {
          throw new Error("The server returned an unexpected payment list.");
        }

        if (isMounted) {
          setPayments(responseData);
        }
      } catch (err) {
        console.error("Failed to fetch payments:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load your payments. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPayments();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatPrice = (amount, currency = "NGN") =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount));

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-slate-200 text-slate-700",
    };

    return styles[status] || "bg-slate-100 text-slate-700";
  };

  if (isLoading) {
    return (
      <section className="p-6">
        <p className="text-slate-600">Loading your payments...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          My Payments
        </h1>

        <p className="mt-2 text-slate-600">
          View your purchases and track your payment status.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      {!error && payments.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            No payments yet
          </h2>

          <p className="mt-2 text-slate-600">
            When you purchase a product, your payment will appear here.
          </p>

          <Link
            to="/products"
            className="mt-5 inline-block rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700"
          >
            Browse Products
          </Link>
        </div>
      )}

      {payments.length > 0 && (
        <div className="space-y-4">
          {payments.map((payment) => (
            <article
              key={payment._id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {payment.description || "Product purchase"}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Reference
                  </p>

                  <p className="break-all font-medium text-slate-800">
                    {payment.paymentReference || "Not available"}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold capitalize ${getStatusStyle(
                    payment.status
                  )}`}
                >
                  {payment.status || "Unknown"}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-slate-500">Amount</p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatPrice(payment.amount, payment.currency)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Payment method</p>

                  <p className="mt-1 font-medium capitalize text-slate-900">
                    {(payment.paymentMethod || "Unknown").replace(
                      "_",
                      " "
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Created</p>

                  <p className="mt-1 font-medium text-slate-900">
                    {formatDate(payment.createdAt)}
                  </p>
                </div>
              </div>

              {payment.status === "failed" && payment.failureReason && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  Reason: {payment.failureReason}
                </p>
              )}

              <div className="mt-5">
                <Link
                  to={`/payments/${payment._id}`}
                  className="inline-block rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  View Payment
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <Link
        to="/products"
        className="inline-block font-medium text-slate-700 underline hover:text-slate-900"
      >
        Continue Shopping
      </Link>
    </section>
  );
}

