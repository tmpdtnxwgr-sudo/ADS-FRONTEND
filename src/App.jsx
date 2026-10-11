import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import MainLayout from "./layouts/MainLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";

import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import NotFound from "./pages/NotFound.jsx";
import ManageProducts from "./admin/ManageProducts.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import MyPayments from "./user/MyPayments.jsx";
import PaymentDetails from "./user/PaymentDetails.jsx";
import ManagePayments from "./admin/ManagePayments.jsx";
import Dashboard from "./admin/Dashboard.jsx";
import ManageUsers from "./admin/ManageUsers.jsx";

function AppRoutes() {
  return (
    <Routes>
      {/* Public website pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products/:productId" element={<ProductDetails />}
/>

        {/* User-only pages */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/my-payments"
            element={<MyPayments />}
          />

          <Route
            path="/payments/:paymentId"
            element={<PaymentDetails />}
          />
        </Route>
      </Route>

      {/* Admin-only pages */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route
            path="/admin"
            element={<Dashboard />}
          />

          <Route
            path="/admin/products"
            element={<ManageProducts/>}
          />

          <Route
            path="/admin/payments"
            element={<ManagePayments />}
          />

          <Route
            path="/admin/users"
            element={<ManageUsers />}
          />
        </Route>
      </Route>

      {/* Redirect old or alternate paths here if needed */}
      <Route path="/home" element={<Navigate to="/" replace />} />

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}



export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}