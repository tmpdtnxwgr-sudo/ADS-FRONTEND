import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function Home() {
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
let ignore = false;

async function fetchProducts() {
  try {
    const response = await api.get("/user/products");
    const result = response.data?.data ?? response.data;

    const productList = Array.isArray(result)
      ? result
      : result?.products ?? [];

    if (!ignore) {
      setProducts(productList.filter((product) => product.isActive !== false).slice(0, 4));
    }
  } catch (err) {
    console.error("Failed to load homepage products:", err);

    if (!ignore) {
      setError("We couldn't load our products right now.");
    }
  } finally {
    if (!ignore) {
      setLoading(false);
    }
  }
}

fetchProducts();

return () => {
  ignore = true;
};


}, []);

const formatPrice = (price) =>
new Intl.NumberFormat("en-NG", {
style: "currency",
currency: "NGN",
maximumFractionDigits: 2,
}).format(Number(price) || 0);

return ( <div className="space-y-20 pb-12 sm:space-y-28">
{/* Hero */} <section className="relative overflow-hidden rounded-3xl bg-[#f2eee7]"> <div className="grid min-h-[440px] items-center gap-8 px-6 py-12 sm:px-10 md:grid-cols-2 md:px-14 md:py-16"> <div className="relative z-10"> <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
Welcome to YourStore </p>


        <h1 className="mt-6 max-w-xl text-4xl font-medium leading-tight tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
          Good finds.
          <br />
          Great choices.
        </h1>

        <p className="mt-6 max-w-md text-base leading-7 text-stone-600 sm:text-lg">
          Discover products worth bringing home. Explore our collection
          and find something you'll love.
        </p>

        <Link
          to="/products"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-stone-900 px-7 py-4 text-sm font-medium text-white transition hover:bg-stone-700"
        >
          Explore the collection
          <span aria-hidden="true">→</span>
        </Link>

        <p className="mt-5 text-xs text-stone-500">
          Thoughtfully selected. Easy to explore.
        </p>
      </div>

      <div className="relative flex min-h-[260px] items-center justify-center md:min-h-[340px]">
        <div className="absolute h-56 w-56 rounded-full bg-[#e3d8c7] sm:h-72 sm:w-72" />

        <div className="relative flex h-64 w-full max-w-sm flex-col justify-between rounded-2xl border border-white/70 bg-white/60 p-6 shadow-sm backdrop-blur-sm sm:h-72 sm:p-8">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-stone-500">
            The collection
          </span>

          <div>
            <p className="text-3xl font-medium tracking-tight text-stone-900 sm:text-4xl">
              Find your
              <br />
              next favourite.
            </p>

            <div className="mt-5 h-px w-16 bg-stone-400" />

            <p className="mt-4 text-sm text-stone-600">
              Your next great find is waiting.
            </p>
          </div>

          <div className="flex justify-end">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-xl text-white">
              ↗
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* Featured products */}
  <section>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
          Handpicked for you
        </p>

        <h2 className="mt-3 text-3xl font-medium tracking-tight text-stone-900 sm:text-4xl">
          Featured products
        </h2>

        <p className="mt-3 text-sm leading-6 text-stone-600 sm:text-base">
          Explore some of the products available in our store.
        </p>
      </div>

      <Link
        to="/products"
        className="inline-flex w-fit items-center gap-2 border-b border-stone-400 pb-1 text-sm font-medium text-stone-800 transition hover:border-stone-900"
      >
        View all products <span aria-hidden="true">→</span>
      </Link>
    </div>

    {loading ? (
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="animate-pulse overflow-hidden rounded-2xl bg-stone-100"
          >
            <div className="aspect-[4/5] bg-stone-200" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-3/4 rounded bg-stone-200" />
              <div className="h-4 w-1/3 rounded bg-stone-200" />
            </div>
          </div>
        ))}
      </div>
    ) : error ? (
      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <p className="text-stone-600">{error}</p>
        <Link
          to="/products"
          className="mt-4 inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
        >
          Browse products
        </Link>
      </div>
    ) : products.length > 0 ? (
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product._id}
            to={`/products/${product._id}`}
            className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name || "Store product"}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[#f2eee7]">
                  <span className="text-sm uppercase tracking-[0.2em] text-stone-400">
                    YourStore
                  </span>
                </div>
              )}

              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-700">
                Discover
              </span>
            </div>

            <div className="p-4">
              <h3 className="truncate text-base font-medium text-stone-900">
                {product.name || "Untitled product"}
              </h3>

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-stone-900">
                  {formatPrice(product.price)}
                </p>

                <span className="text-sm text-stone-500 transition group-hover:translate-x-1 group-hover:text-stone-900">
                  View →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    ) : (
      <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-14 text-center">
        <p className="text-lg font-medium text-stone-800">
          Something good is coming.
        </p>

        <p className="mt-2 text-sm text-stone-500">
          Our featured products will appear here once they're available.
        </p>

        <Link
          to="/products"
          className="mt-5 inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
        >
          Browse the store
        </Link>
      </div>
    )}
  </section>

  {/* Shopping benefits */}
  <section className="grid gap-5 border-y border-stone-200 py-10 sm:grid-cols-3 sm:gap-8 sm:py-12">
    <div>
      <span className="text-2xl" aria-hidden="true">✳</span>
      <h3 className="mt-4 text-base font-medium text-stone-900">
        Products worth discovering
      </h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        Browse our collection and find products that suit your needs.
      </p>
    </div>

    <div>
      <span className="text-2xl" aria-hidden="true">◇</span>
      <h3 className="mt-4 text-base font-medium text-stone-900">
        Clear payment steps
      </h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        Review your purchase and follow the payment instructions provided
        during checkout.
      </p>
    </div>

    <div>
      <span className="text-2xl" aria-hidden="true">↗</span>
      <h3 className="mt-4 text-base font-medium text-stone-900">
        Your account, your orders
      </h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        Sign in to access your account and keep track of your payments.
      </p>
    </div>
  </section>

  {/* Closing call to action */}
  <section className="rounded-3xl bg-stone-900 px-6 py-12 text-center sm:px-12 sm:py-16">
    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">
      Your next find awaits
    </p>

    <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-medium tracking-tight text-white sm:text-4xl">
      A little browsing could lead to something great.
    </h2>

    <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-stone-300 sm:text-base">
      Take a look through our collection and discover what's available.
    </p>

    <Link
      to="/products"
      className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-stone-900 transition hover:bg-stone-200"
    >
      Shop all products <span aria-hidden="true">→</span>
    </Link>
  </section>
</div>


);
}
