import { useCallback, useEffect, useState } from "react";
import api from "../services/api.js";

const emptyForm = {
  name: "",
  price: "",
  image: "",
  description: "",
  rating: "0",
  isActive: true,
};

function getResponseData(response) {
  return response?.data?.data ?? response?.data;
}

function getProductList(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.products)) {
    return responseData.products;
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  return [];
}

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/products");
      const responseData = getResponseData(response);

      setProducts(getProductList(responseData));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load products. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

 useEffect(() => {
  const loadProducts = async () => {
    await fetchProducts();
  };

  loadProducts();
}, [fetchProducts]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const price = Number(formData.price);
    const rating = Number(formData.rating);

    if (!formData.name.trim()) {
      setError("Please enter a product name.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Please enter a valid, non-negative price.");
      return;
    }

    if (
      !Number.isFinite(rating) ||
      rating < 0 ||
      rating > 5
    ) {
      setError("The rating must be between 0 and 5.");
      return;
    }

    const productData = {
      name: formData.name.trim(),
      price,
      image: formData.image.trim(),
      description: formData.description.trim(),
      rating,
      isActive: formData.isActive,
    };

    setIsSaving(true);

    try {
      if (editingId) {
        await api.patch(
          `/admin/products/${editingId}`,
          productData
        );

        setSuccess("Product updated successfully.");
      } else {
        await api.post("/admin/products", productData);

        setSuccess("Product created successfully.");
      }

      resetForm();
      await fetchProducts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not save the product. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id || product.id);

    setFormData({
      name: product.name || "",
      price: String(product.price ?? ""),
      image: product.image || "",
      description: product.description || "",
      rating: String(product.rating ?? 0),
      isActive: product.isActive ?? true,
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (product) => {
    const productId = product._id || product.id;

    if (!productId) {
      setError("This product does not have a valid ID.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(`/admin/products/${productId}`);

      if (editingId === productId) {
        resetForm();
      }

      setSuccess("Product deleted successfully.");

      await fetchProducts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete the product. Please try again."
      );
    }
  };

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Manage Products
            </h1>

            <p className="mt-2 text-slate-600">
              Create, update, and manage your store products.
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
            <p className="text-sm text-blue-700">
              Total products
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-900">
              {products.length}
            </p>
          </div>
        </div>

        {/* Feedback messages */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        {/* Product form */}
        <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {editingId ? "Edit product" : "Add a new product"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Product information will be saved to your database.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700"
                >
                  Product name *
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="text-sm font-medium text-slate-700"
                >
                  Price *
                </label>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="image"
                  className="text-sm font-medium text-slate-700"
                >
                  Product image URL
                </label>

                <input
                  id="image"
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/product.jpg"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="rating"
                  className="text-sm font-medium text-slate-700"
                >
                  Rating (0–5)
                </label>

                <input
                  id="rating"
                  name="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium text-slate-700"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product..."
                className={inputClass}
              />
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />

              Make this product available in the store
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Add product"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear form
              </button>
            </div>
          </form>
        </section>

        {/* Product list */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Your products
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Products are retrieved from MongoDB through your backend.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchProducts}
              disabled={isLoading}
              className="self-start rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 sm:self-auto"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-500">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
                +
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No products yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Add your first product using the form above. It will appear
                here after it has been saved successfully.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr
                      key={product._id || product.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                              No image
                            </div>
                          )}

                          <div className="max-w-xs">
                            <p className="font-semibold text-slate-900">
                              {product.name}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {product.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                        {Number(product.price).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {Number(product.rating ?? 0).toFixed(1)} / 5
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            product.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(product)}
                            className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(product)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}