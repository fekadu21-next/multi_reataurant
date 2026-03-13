import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Index from "./components/Index";
import RestaurantMenu from "./components/RestaurantMenu";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import AdminDashboard from "./pages/admin/AdminDashboard";
import RestaurantDashboard from "./pages/restorant/Dashboard";

import OrdersPageAccount from "./pages/account/OrdersPage";
import FavoritesPage from "./pages/account/FavoritesPage";
import AccountSettingsPage from "./pages/account/AccountSettingsPage";

import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import CheckoutPage from "./pages/CheckoutPage";
// import PaymentPage from "./pages/PaymentPage";
// import PaymentPage from "./pages/PaymentPage";
import PaymentPage from "./pages/PaymentRedirect";
import PaymentSuccess from "./pages/PaymentSuccess";

import "./App.css";
import { CartProvider } from "./context/CartContext";
import { SocketProvider } from "./context/SocketContext";

function LayoutWrapper({ children }) {
  const location = useLocation();

  const dashboardRoutes = [
    "/admin-dashboard",
    "/restaurant-dashboard",
    "/customer-dashboard",
  ];

  const hideLayout = dashboardRoutes.includes(location.pathname);

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      {!hideLayout && <Navbar />}
      <div className="flex-1 w-full">{children}</div>
      {!hideLayout && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <SocketProvider>
        <Router>
          <LayoutWrapper>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/restaurant/:id" element={<RestaurantMenu />} />


              <Route path="/account/myorders" element={<OrdersPageAccount />} />
              <Route path="/account/favorites" element={<FavoritesPage />} />
              <Route path="/account" element={<AccountSettingsPage />} />


              {/* Cart + Checkout */}
              <Route path="/cart" element={<CartPage />} />
              <Route path="/orders/:id" element={<OrdersPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              {/* AUTH */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* DASHBOARDS */}
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route
                path="/restaurant-dashboard"
                element={<RestaurantDashboard />}
              />
            </Routes>
          </LayoutWrapper>
        </Router>
      </SocketProvider>
    </CartProvider>
  );
}
