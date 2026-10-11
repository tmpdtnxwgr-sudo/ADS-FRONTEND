import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";
import useAuth from "../hooks/useAuth.js";

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [payment, setPayment] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
 
  const [isNotifying, setIsNotifying] = useState(false);

  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);

const [deliveryDetails, setDeliveryDetails] = useState({
  recipientName: "",
  phone: "",
  email: "",
  country: "",
  state: "",
  city: "",
  address: "",
  landmark: "",
  postalCode: "",
  instructions: "",
});

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get(`/user/products/${productId}`);
        const responseData = response.data?.data ?? response.data;

        if (!responseData || !responseData._id) {
          throw new Error("Product details could not be found.");
        }

        if (isMounted) {
          setProduct(responseData);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load this product. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(Number(price));

const handleBuyNow = () => {
  if (!isAuthenticated) {
    navigate("/login");
    return;
  }

  setError("");
  setPaymentError("");
  setSuccessMessage("");
  setShowDeliveryForm(true);
};

const handleDeliveryChange = (event) => {
  const { name, value } = event.target;

  setDeliveryDetails((previous) => ({
    ...previous,
    [name]: value,
  }));
};

const handleDeliverySubmit = async (event) => {
  event.preventDefault();

  setIsSubmittingDelivery(true);
  setPaymentError("");
  setError("");
  setSuccessMessage("");

  try {
    const response = await api.post(
      `/payment/products/${productId}/buy`,
      { deliveryDetails }
    );

    setPayment(response.data.data);
    setShowDeliveryForm(false);

    setSuccessMessage(
      "Your order has been created. Please follow the bank transfer instructions below."
    );
  } catch (error) {
    setPaymentError(
      error.response?.data?.message ||
        "Unable to create your order. Please check your details and try again."
    );
  } finally {
    setIsSubmittingDelivery(false);
  }
};

  const handleNotifyPayment = async () => {
    if (!payment?._id) {
      setPaymentError("No payment record was found.");
      return;
    }

    try {
      setIsNotifying(true);
      setPaymentError("");
      setSuccessMessage("");

      const response = await api.patch(
        `/payment/${payment._id}/notify`
      );

      const updatedPayment = response.data?.data ?? response.data;

      if (updatedPayment?._id) {
        setPayment(updatedPayment);
      } else {
        setPayment((previous) => ({
          ...previous,
          status: "processing",
        }));
      }

      setSuccessMessage(
        response.data?.message ||
          "Your payment notification has been sent to the admin."
      );
    } catch (err) {
      console.error("Failed to notify payment:", err);

      setPaymentError(
        err.response?.data?.message ||
          "Unable to notify the admin. Please try again."
      );
    } finally {
      setIsNotifying(false);
    }
  };

  if (isLoading) {
    return (
      <section className="p-6">
        <p className="text-slate-600">Loading product details...</p>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="rounded-xl border border-red-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Product unavailable
        </h1>

        <p className="mt-3 text-red-600">
          {error || "This product could not be found."}
        </p>

        <Link
          to="/products"
          className="mt-5 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          Back to Products
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Link
        to="/products"
        className="inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to Products
      </Link>

      <div className="grid grid-cols-1 gap-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
        <div className="flex min-h-72 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="max-h-[450px] w-full object-contain"
            />
          ) : (
            <p className="text-slate-500">No image available</p>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-slate-900">
            {product.name}
          </h1>

          {product.rating != null && (
            <p className="mt-3 text-amber-600">
              ★ {product.rating} / 5
            </p>
          )}

          <p className="mt-5 text-3xl font-bold text-slate-900">
            {formatPrice(product.price)}
          </p>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Product Description
            </h2>

            <p className="mt-2 whitespace-pre-line leading-7 text-slate-600">
              {product.description || "No description available."}
            </p>
          </div>

          {!payment && (
            <button
              type="button"
              onClick={handleBuyNow}
              
              className="mt-8 w-full rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            >
              Buy Now
            </button>
          )}
        </div>
      </div>

            {/* DELIVERY FORM */}
      {showDeliveryForm && !payment && (
        <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Delivery Information
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Where should we deliver your order?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Enter the recipient and delivery address details below.
            </p>

            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="font-semibold text-green-800">
                Free Delivery Promotion
              </p>
              <p className="mt-1 text-sm text-green-700">
                Delivery fee: FREE
              </p>
            </div>
          </div>

          <form onSubmit={handleDeliverySubmit} className="space-y-5">
            {/* Recipient details */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Recipient Details
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="recipientName"
                    className="mb-1 block text-black text-sm font-medium text-slate-700"
                  >
                    Full Name *
                  </label>

                  <input
                    id="recipientName"
                    name="recipientName"
                    type="text"
                    autoComplete="name"
                    value={deliveryDetails.recipientName}
                    onChange={handleDeliveryChange}
                    required
                    maxLength={100}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-black"
                    placeholder="Recipient's full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1 block text-sm font-medium text-slate-700 text-black"
                  >
                    Phone Number *
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={deliveryDetails.phone}
                    onChange={handleDeliveryChange}
                    required
                    maxLength={30}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none text-black focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    placeholder="Your contact number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-slate-700 text-black"
                  >
                    Email Address *
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={deliveryDetails.email}
                    onChange={handleDeliveryChange}
                    required
                    maxLength={254}
                    className="w-full text-black rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="border-t border-slate-200 pt-5">
              <h3 className="mb-4 text-lg font-semibold text-slate-900 text-black">
                Delivery Address
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="country"
                    className="mb-1 block text-sm font-medium text-slate-700 text-black"
                  >
                    Country *
                  </label>

                  <input
                    id="country"
                    name="country"
                    type="text"
                    autoComplete="country-name"
                    value={deliveryDetails.country}
                    onChange={handleDeliveryChange}
                    required
                    maxLength={100}
                    className="w-full text-black rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    placeholder="Country"
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="mb-1 block text-sm font-medium text-slate-700 text-black"
                  >
                    State / Province *
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    autoComplete="address-level1"
                    value={deliveryDetails.state}
                    onChange={handleDeliveryChange}
                    required
                    maxLength={100}
                    className="w-full text-black rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    placeholder="State or province"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="mb-1 block text-sm font-medium text-slate-700 text-black"
                  >
                    City *
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    value={deliveryDetails.city}
                    onChange={handleDeliveryChange}
                    required
                    maxLength={100}
                    className="w-full text-black rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    placeholder="City or town"
                  />
                </div>

                <div>
                  <label
                    htmlFor="postalCode"
                    className="mb-1 block text-sm font-medium text-slate-700 text-black"
                  >
                    Postal / ZIP Code
                  </label>

                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    autoComplete="postal-code"
                    value={deliveryDetails.postalCode}
                    onChange={handleDeliveryChange}
                    maxLength={20}
                    className="w-full text-black rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    placeholder="Optional"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="mb-1 block text-sm font-medium text-slate-700 text-black"
                  >
                    Street Address *
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    autoComplete="street-address"
                    value={deliveryDetails.address}
                    onChange={handleDeliveryChange}
                    required
                    rows={3}
                    maxLength={300}
                    className="w-full text-black rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    placeholder="House number, street name, and area"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="landmark"
                    className="mb-1 block text-sm font-medium text-slate-700 text-black"
                  >
                    Landmark / Apartment
                  </label>

                  <input
                    id="landmark"
                    name="landmark"
                    type="text"
                    value={deliveryDetails.landmark}
                    onChange={handleDeliveryChange}
                    maxLength={150}
                    className="w-full text-black rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    placeholder="Nearby landmark, building, or apartment (optional)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="instructions"
                    className="mb-1 block text-sm font-medium text-slate-700 text-black"
                  >
                    Delivery Instructions
                  </label>

                  <textarea
                    id="instructions"
                    name="instructions"
                    value={deliveryDetails.instructions}
                    onChange={handleDeliveryChange}
                    rows={3}
                    maxLength={500}
                    className="w-full text-black rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    placeholder="Any extra directions for the delivery team (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="rounded-lg bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-900 text-black">
                Order Summary
              </h3>

              <div className="mt-3 flex justify-between gap-4 text-sm">
                <span className="text-slate-600">{product.name}</span>
                <span className="font-medium text-slate-900">
                  {formatPrice(product.price)}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4 text-sm">
                <span className="text-slate-600">Delivery Fee</span>
                <span className="font-semibold text-green-700">FREE</span>
              </div>

              <div className="mt-4 flex justify-between gap-4 border-t border-slate-200 pt-4">
                <span className="font-semibold text-slate-900">
                  Total Payable
                </span>
                <span className="text-lg font-bold text-slate-900">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>

            {paymentError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
              >
                {paymentError}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmittingDelivery}
                className="flex-1 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingDelivery
                  ? "Creating Your Order..."
                  : "Continue to Payment"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowDeliveryForm(false);
                  setPaymentError("");
                }}
                disabled={isSubmittingDelivery}
                className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {paymentError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {paymentError}
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

      {payment && (
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Bank Transfer Instructions
            </h2>

            <p className="mt-2 text-slate-600">
              Transfer the exact amount below, then notify the admin
              that you have made the payment.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Amount to pay</p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {formatPrice(payment.amount)}
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Payment reference
            </p>

            <p className="mt-1 break-all font-semibold text-slate-900">
              {payment.paymentReference || "Not provided"}
            </p>

            <p className="mt-4 text-sm text-slate-500">Bank</p>

            <p className="mt-1 font-medium text-slate-900">
              {payment.accountDetails?.bankName || "Bank details unavailable"}
            </p>

            <p className="mt-4 text-sm text-slate-500">Account name</p>

            <p className="mt-1 font-medium text-slate-900">
              {payment.accountDetails?.accountName || "Not provided"}
            </p>

            <p className="mt-4 text-sm text-slate-500">Account number</p>

            <p className="mt-1 font-semibold text-slate-900">
              {payment.accountDetails?.accountNumber || "Not provided"}
            </p>
          </div>

                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="font-semibold text-green-800">
              Free Delivery Applied
            </p>

            <p className="mt-1 text-sm text-green-700">
              Delivery fee: FREE
            </p>

            {payment.delivery?.address && (
              <div className="mt-3 border-t border-green-200 pt-3 text-sm text-green-800">
                <p className="font-semibold">Delivering to:</p>
                <p>{payment.delivery.recipientName}</p>
                <p>{payment.delivery.address}</p>
                <p>
                  {payment.delivery.city}, {payment.delivery.state},{" "}
                  {payment.delivery.country}
                </p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-slate-500">Payment status</p>

            <p className="mt-1 font-semibold capitalize text-slate-900">
              {payment.status}
            </p>
          </div>

          {payment.status === "pending" && (
            <button
              type="button"
              onClick={handleNotifyPayment}
              disabled={isNotifying}
              className="w-full rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            >
              {isNotifying
                ? "Sending Notification..."
                : "I've Made Payment"}
            </button>
          )}

          {payment.status === "processing" && (
            <p className="rounded-lg bg-amber-50 p-4 text-amber-800">
              Your payment notification has been submitted. Please wait
              for the admin to review and confirm your payment.
            </p>
          )}

          {payment.status === "confirmed" && (
            <p className="rounded-lg bg-green-50 p-4 text-green-800">
              Your payment has been confirmed.
            </p>
          )}

          {payment.status === "failed" && (
            <p className="rounded-lg bg-red-50 p-4 text-red-800">
              This payment was not approved.
              {payment.failureReason
                ? ` Reason: ${payment.failureReason}`
                : ""}
            </p>
          )}

          {payment.status === "cancelled" && (
            <p className="rounded-lg bg-slate-100 p-4 text-slate-700">
              This payment has been cancelled.
            </p>
          )}

          <Link
            to="/my-payments"
            className="inline-block font-medium text-slate-700 underline hover:text-slate-900"
          >
            View My Payments
          </Link>
        </div>
      )}
    </section>
  );
}



