import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

export default function Signup() {
const { signup } = useAuth();
const navigate = useNavigate();

const [formData, setFormData] = useState({
firstName: "",
lastName: "",
email: "",
password: "",
confirmPassword: "",
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


if (formData.password !== formData.confirmPassword) {
  setError("Your passwords do not match.");
  return;
}

if (formData.password.length < 8) {
  setError("Your password must contain at least 8 characters.");
  return;
}

setIsSubmitting(true);

try {
  const signupData = {
  firstName: formData.firstName,
  lastName: formData.lastName,
  email: formData.email,
  password: formData.password,
};

  await signup(signupData);

  navigate("/", { replace: true });
} catch (err) {
  setError(
    err.response?.data?.message ||
      err.message ||
      "We could not create your account. Please try again."
  );
} finally {
  setIsSubmitting(false);
}


};

const inputClass =
"mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

return ( <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-2"> <div className="hidden flex-col justify-between bg-blue-600 p-10 text-white md:flex"> <div> <p className="text-xl font-semibold">YourStore</p>

      <h1 className="mt-12 text-3xl font-semibold leading-tight">
        Discover products you'll love.
      </h1>

      <p className="mt-4 text-base leading-7 text-blue-100">
        Create an account to explore our products and keep track of your
        purchases.
      </p>
    </div>

    <p className="text-sm text-blue-100">
      A simple and convenient shopping experience.
    </p>
  </div>

  <div className="p-6 sm:p-10">
    <div className="mb-8">
      <p className="text-sm font-medium text-blue-700">
        Get started today
      </p>

      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
        Create your account
      </h2>

      <p className="mt-2 text-base text-slate-600">
        Enter your details below to sign up.
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="text-sm font-medium text-slate-700"
          >
            First name
          </label>

          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="text-sm font-medium text-slate-700"
          >
            Last name
          </label>

          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
      </div>

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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={formData.password}
          onChange={handleChange}
          className={inputClass}
          minLength={8}
          required
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-slate-700"
        >
          Confirm password
        </label>

        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Enter your password again"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={inputClass}
          minLength={8}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-5 py-3 text-base font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>

    <p className="mt-6 text-center text-base text-slate-600">
      Already have an account?{" "}
      <Link
        to="/login"
        className="font-medium text-blue-700 hover:text-blue-800"
      >
        Log in
      </Link>
    </p>
  </div>
</div>


);
}
