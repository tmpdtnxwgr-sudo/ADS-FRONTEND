import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api.js";

export default function PaymentDetails() {
  const { paymentId } = useParams();

  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchPayment = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get(`/payment/${paymentId}`);
        const responseData = response.data?.data ?? response.data;

        if (!responseData || !responseData._id) {
          throw new Error("Payment details could not be found.");
        }

        if (isMounted) {
          setPayment(responseData);
        }
      } catch (err) {
        console.error("Failed to fetch payment:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load this payment. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPayment();

    return () => {
      isMounted = false;
    };
  }, [paymentId]);

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

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    confirmed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-slate-200 text-slate-700",
  };

  if (isLoading) {
    return (
      <section className="p-6">
        <p className="text-slate-600">Loading payment details...</p>
      </section>
    );
  }

  if (error || !payment) {
    return (
      <section className="rounded-xl border border-red-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Payment unavailable
        </h1>

        <p className="mt-3 text-red-600">
          {error || "This payment could not be found."}
        </p>

        <Link
          to="/my-payments"
          className="mt-5 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          Back to My Payments
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/my-payments"
        className="inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to My Payments
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Payment Details
            </h1>

            <p className="mt-2 text-slate-600">
              {payment.description || "Product purchase"}
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold capitalize ${
              statusStyles[payment.status] ||
              "bg-slate-100 text-slate-700"
            }`}
          >
            {payment.status || "Unknown"}
          </span>
        </div>

        <div className="mt-6 rounded-lg bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Total amount</p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            {formatPrice(payment.amount, payment.currency)}
          </p>

          <p className="mt-5 text-sm text-slate-500">
            Payment reference
          </p>

          <p className="mt-1 break-all font-semibold text-slate-900">
            {payment.paymentReference || "Not available"}
          </p>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Payment Information
          </h2>

          <dl className="mt-4 divide-y divide-slate-100">
            <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
              <dt className="text-slate-500">Payment method</dt>
              <dd className="font-medium capitalize text-slate-900">
                {(payment.paymentMethod || "Unknown").replace("_", " ")}
              </dd>
            </div>

            <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
              <dt className="text-slate-500">Created</dt>
              <dd className="font-medium text-slate-900">
                {formatDate(payment.createdAt)}
              </dd>
            </div>

            <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
              <dt className="text-slate-500">Last updated</dt>
              <dd className="font-medium text-slate-900">
                {formatDate(payment.updatedAt)}
              </dd>
            </div>

            <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
              <dt className="text-slate-500">Confirmed on</dt>
              <dd className="font-medium text-slate-900">
                {formatDate(payment.confirmedAt)}
              </dd>
            </div>
          </dl>
        </div>

        {payment.paymentMethod === "bank_transfer" &&
          payment.status !== "confirmed" && (
            <div className="mt-6 rounded-lg border border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Bank Transfer Details
              </h2>

              <p className="mt-3 text-sm text-slate-500">Bank</p>
              <p className="font-medium text-slate-900">
                {payment.accountDetails?.bankName || "Not provided"}
              </p>

              <p className="mt-3 text-sm text-slate-500">Account name</p>
              <p className="font-medium text-slate-900">
                {payment.accountDetails?.accountName || "Not provided"}
              </p>

              <p className="mt-3 text-sm text-slate-500">Account number</p>
              <p className="font-medium text-slate-900">
                {payment.accountDetails?.accountNumber || "Not provided"}
              </p>
            </div>
          )}

        {payment.status === "pending" && (
          <div className="mt-6 rounded-lg bg-yellow-50 p-4 text-yellow-800">
            Awaiting payment. Follow the bank-transfer instructions and
            notify the admin after making your transfer.
          </div>
        )}

        {payment.status === "processing" && (
          <div className="mt-6 rounded-lg bg-blue-50 p-4 text-blue-800">
            Your payment notification has been submitted. The admin still
            needs to review and confirm the payment.
          </div>
        )}

        {payment.status === "confirmed" && (
          <div className="mt-6 rounded-lg bg-green-50 p-4 text-green-800">
            Your payment has been confirmed.
          </div>
        )}

        {payment.status === "failed" && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-800">
            <p>Your payment was not approved.</p>

            {payment.failureReason && (
              <p className="mt-2">
                Reason: {payment.failureReason}
              </p>
            )}
          </div>
        )}

        {payment.status === "cancelled" && (
          <div className="mt-6 rounded-lg bg-slate-100 p-4 text-slate-700">
            This payment has been cancelled.
          </div>
        )}
      </div>
    </section>
  );
}

