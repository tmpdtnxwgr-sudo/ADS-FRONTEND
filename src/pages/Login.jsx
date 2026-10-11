import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

export default function Login() {
const { login } = useAuth();
const navigate = useNavigate();
const location = useLocation();

const [formData, setFormData] = useState({
email: "",
password: "",
});

const [error, setError] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);

const handleChange = (event) => {
const { name, value } = event.target;


setFormData((previousData) => ({
  ...previousData,
  [name]: value,
}));


};

const handleSubmit = async (event) => {
event.preventDefault();
setError("");
setIsSubmitting(true);


try {
  const response = await login(formData);

  const user = response?.user;

  const destination =
    user?.role === "admin"
      ? "/admin"
      : location.state?.from?.pathname || "/";

  navigate(destination, { replace: true });
} catch (err) {
  setError(
    err.response?.data?.message ||
      err.message ||
      "Login failed. Please check your details and try again."
  );
} finally {
  setIsSubmitting(false);
}


};

const inputClass =
"mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

return ( <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-2"> <div className="hidden flex-col justify-between bg-blue-600 p-10 text-white md:flex"> <div> <p className="text-xl font-semibold">YourStore</p>


      <h1 className="mt-12 text-3xl font-semibold leading-tight">
        Welcome back.
      </h1>

      <p className="mt-4 text-base leading-7 text-blue-100">
        Sign in to browse products, review your purchases, and manage your
        account.
      </p>
    </div>

    <p className="text-sm text-blue-100">
      Your shopping experience starts here.
    </p>
  </div>

  <div className="p-6 sm:p-10">
    <div className="mb-8">
      <p className="text-sm font-medium text-blue-700">
        Welcome back
      </p>

      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
        Log in to your account
      </h2>

      <p className="mt-2 text-base text-slate-600">
        Enter your email and password to continue.
      </p>
    </div>

    {error && (
      <div
        role="alert"
        className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {error}
      </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="text-sm font-medium text-slate-700"
        >
          Email address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-sm font-medium text-slate-700"
        >
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          className={inputClass}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-5 py-3 text-base font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Logging in..." : "Log in"}
      </button>
    </form>

    <p className="mt-6 text-center text-base text-slate-600">
      Don't have an account?{" "}
      <Link
        to="/signup"
        className="font-medium text-blue-700 hover:text-blue-800"
      >
        Sign up
      </Link>
    </p>
  </div>
</div>


);
}
