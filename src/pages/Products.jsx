import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get("/user/products");

        const responseData = response.data?.data ?? response.data;

        const productList = Array.isArray(responseData)
          ? responseData
          : responseData?.products;

        if (!Array.isArray(productList)) {
          throw new Error("The server returned an unexpected product list.");
        }

        if (isMounted) {
          setProducts(
            productList.filter((product) => product.isActive !== false)
          );
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load products. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <section className="p-6">
        <p className="text-slate-600">Loading products...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl border border-red-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Products
        </h1>

        <p className="mt-3 text-red-600">{error}</p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          Try Again
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Our Products
        </h1>

        <p className="mt-2 text-slate-600">
          Browse our available products and find something you like.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            No products available
          </h2>

          <p className="mt-2 text-slate-600">
            Please check back later for new products.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-x-4 gap-y-8">
          {products.map((product) => (
            <article
              key={product._id || product.id}
              className="w-[calc(50%-8px)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md lg:w-[calc(25%-12px)]"
            >
              <div className="flex h-40 items-center justify-center bg-slate-100">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-sm text-slate-500">
                    No image available
                  </span>
                )}
              </div>

              <div className="space-y-2 p-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  {product.name}
                </h2>

                <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                  {product.description || "No description available."}
                </p>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xl font-bold text-slate-900">
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      maximumFractionDigits: 2,
                    }).format(Number(product.price))}
                  </p>

                  {product.rating != null && (
                    <span className="text-sm text-amber-600">
                      ★ {product.rating}
                    </span>
                  )}
                </div>

                <Link
                  to={`/products/${product._id || product.id}`}
                  className="block rounded-lg bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  View Product
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

