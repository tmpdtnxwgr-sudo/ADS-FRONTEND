import { useCallback, useEffect, useState } from "react";
import api from "../services/api.js";

export default function ManagePayments() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [rejectingPaymentId, setRejectingPaymentId] = useState(null);
const [rejectionReason, setRejectionReason] = useState("");

 const fetchPayments = useCallback(async () => {
  try {
    const response = await api.get("/admin/payments/pending");

      const responseData = response.data?.data ?? response.data;

      if (!Array.isArray(responseData)) {
        throw new Error("The server returned an unexpected payment list.");
      }

      setPayments(responseData);
    } catch (err) {
      console.error("Failed to fetch payments:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load payments. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

 useEffect(() => {
  let cancelled = false;

  const loadPayments = async () => {
    try {
      const response = await api.get("/admin/payments/pending");
      const responseData = response.data?.data ?? response.data;

      if (!Array.isArray(responseData)) {
        throw new Error("The server returned an unexpected payment list.");
      }

      if (!cancelled) {
        setPayments(responseData);
        setError("");
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);

      if (!cancelled) {
        setError(
          err.response?.data?.message ||
            "Unable to load payments. Please try again."
        );
      }
    } finally {
      if (!cancelled) {
        setIsLoading(false);
      }
    }
  };

  loadPayments();

  return () => {
    cancelled = true;
  };
}, []);

  const formatPrice = (amount, currency = "NGN") =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount));

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  
const handlePaymentAction = async (paymentId, action) => {
  if (action === "reject") {
    setRejectingPaymentId(paymentId);
    setRejectionReason("");
    setError("");
    setSuccessMessage("");
    return;
  }

  const confirmed = window.confirm(
    "Have you independently verified that this transfer was received? Confirming will mark the payment as paid."
  );

  if (!confirmed) return;

  try {
    setProcessingId(paymentId);
    setError("");
    setSuccessMessage("");

    const response = await api.patch(
      `/admin/payments/${paymentId}/confirm`
    );

    setSuccessMessage(
      response.data?.message || "Payment confirmed successfully."
    );

    await fetchPayments();
  } catch (err) {
    console.error("Failed to confirm payment:", err);

    setError(
      err.response?.data?.message ||
        "Unable to confirm this payment. Please try again."
    );
  } finally {
    setProcessingId(null);
  }
};



const submitRejection = async (event) => {
  event.preventDefault();

  const failureReason = rejectionReason.trim();

  if (!failureReason) {
    setError("Please provide a reason for rejecting the payment.");
    return;
  }

  try {
    setProcessingId(rejectingPaymentId);
    setError("");
    setSuccessMessage("");

    const response = await api.patch(
      `/admin/payments/${rejectingPaymentId}/reject`,
      { failureReason }
    );

    setSuccessMessage(
      response.data?.message || "Payment rejected successfully."
    );

    setRejectingPaymentId(null);
    setRejectionReason("");

    await fetchPayments();
  } catch (err) {
    console.error("Failed to reject payment:", err);

    setError(
      err.response?.data?.message ||
        "Unable to reject this payment. Please try again."
    );
  } finally {
    setProcessingId(null);
  }
};




  const filteredPayments =
    filter === "all"
      ? payments
      : payments.filter((payment) => payment.status === filter);

  if (isLoading) {
    return (
      <section className="p-6">
        <p className="text-slate-600">Loading payments...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Manage Payments
          </h1>

          <p className="mt-2 text-slate-600">
            Review customer payment notifications and record your decisions.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPayments}
          disabled={isLoading}
          className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      
{rejectingPaymentId && (
  <form
    onSubmit={submitRejection}
    className="mb-6 rounded-lg border border-red-200 bg-white p-4"
  >
    <h3 className="mb-2 text-lg font-semibold text-red-700">
      Reject Payment
    </h3>

    <p className="mb-3 text-sm text-gray-600">
      Enter the reason this payment cannot be approved.
    </p>

    <textarea
      value={rejectionReason}
      onChange={(event) => setRejectionReason(event.target.value)}
      placeholder="Enter rejection reason..."
      rows={3}
      required
      className="mb-3 w-full rounded-md border border-gray-300 p-3"
    />

    <div className="flex gap-3">
      <button
        type="submit"
        disabled={processingId === rejectingPaymentId}
        className="rounded-md bg-red-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {processingId === rejectingPaymentId
          ? "Rejecting..."
          : "Confirm Rejection"}
      </button>

      <button
        type="button"
        onClick={() => {
          setRejectingPaymentId(null);
          setRejectionReason("");
          setError("");
        }}
        className="rounded-md border border-gray-300 px-4 py-2"
      >
        Cancel
      </button>
    </div>
  </form>
)}



      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
        >
          {successMessage}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          { label: "All", value: "all" },
          { label: "Awaiting review", value: "processing" },
          { label: "Pending", value: "pending" },
          { label: "Confirmed", value: "confirmed" },
          { label: "Failed", value: "failed" },
          { label: "Cancelled", value: "cancelled" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              filter === option.value
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filteredPayments.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            No payments found
          </h2>

          <p className="mt-2 text-slate-600">
            No payments match this filter in the currently loaded list.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredPayments.map((payment) => (
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
                    Payment reference
                  </p>

                  <p className="break-all font-medium text-slate-800">
                    {payment.paymentReference || "Not available"}
                  </p>
                </div>

                <span className="inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold capitalize text-blue-800">
                  {(payment.status || "unknown").replace("_", " ")}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-slate-500">Amount</p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatPrice(payment.amount, payment.currency)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Payment method</p>

                  <p className="mt-1 font-medium capitalize text-slate-900">
                    {(payment.paymentMethod || "Unknown").replace("_", " ")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Created</p>

                  <p className="mt-1 font-medium text-slate-900">
                    {formatDate(payment.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Customer ID</p>

                  <p className="mt-1 break-all font-medium text-slate-900">
                    {typeof payment.user === "object"
                      ? payment.user?.email || payment.user?._id || "Not available"
                      : payment.user || "Not available"}
                  </p>
                </div>
              </div>

              {payment.accountDetails && (
                <div className="mt-5 rounded-lg bg-slate-50 p-4">
                  <h3 className="font-semibold text-slate-900">
                    Transfer Details
                  </h3>

                  <p className="mt-2 text-sm text-slate-600">
                    Bank: {payment.accountDetails.bankName || "Not provided"}
                  </p>

                  <p className="text-sm text-slate-600">
                    Account name: {payment.accountDetails.accountName || "Not provided"}
                  </p>

                  <p className="text-sm text-slate-600">
                    Account number: {payment.accountDetails.accountNumber || "Not provided"}
                  </p>
                </div>
              )}

              {payment.failureReason && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  Rejection reason: {payment.failureReason}
                </p>
              )}

              {["pending", "processing"].includes(payment.status) && (
                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-900">
                    The customer has notified you of a payment. Verify that
                    the money was actually received before making a decision.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handlePaymentAction(payment._id, "confirm")
                      }
                      disabled={processingId === payment._id}
                      className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {processingId === payment._id
                        ? "Processing..."
                        : "Confirm Payment"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handlePaymentAction(payment._id, "reject")
                      }
                      disabled={processingId === payment._id}
                      className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject Payment
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

