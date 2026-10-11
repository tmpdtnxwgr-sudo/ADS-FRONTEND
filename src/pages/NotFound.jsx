import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">
        Page not found
      </h1>

      <p className="mt-3 text-base text-slate-600">
        The page you're looking for doesn't exist.
      </p>

      <Link
        to="/"
        className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-base font-medium text-white hover:bg-blue-700"
      >
        Return Home
      </Link>
    </div>
  );
}