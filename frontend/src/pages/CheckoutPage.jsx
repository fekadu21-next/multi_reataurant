import React, { useState, useMemo, useEffect } from "react";
import { useCart } from "../context/CartContext";
import OtpModal from "../components/OtpModal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
const API_URL = "http://localhost:5000/api";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  /* ================= CART ================= */
  const { cart, clearCart } = useCart();

  /* ✅ RESTAURANT ID COMES FROM CART */
  const restaurantId = cart.length > 0 ? cart[0].restaurantId : null;

  /* ================= STATES ================= */
  const [paymentMethod, setPaymentMethod] = useState("BANK or TELEBIRR");
  const [shipping, setShipping] = useState(200);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");

  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");

  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const total = subtotal + shipping;

  /* ================= CART MESSAGE ================= */
  let cartMessage = "";
  if (cart.length === 1) {
    cartMessage = `"${cart[0].name}" has been added to your cart.`;
  } else if (cart.length > 1) {
    cartMessage = `${cart.length} items have been added to your cart.`;
  }
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!token) return;

      try {
        const res = await axios.get(
          `${API_URL}/user/settings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const user = res.data.user;

        // Split fullname
        const nameParts = user.fullname.split(" ");

        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");
        setEmail(user.email || "");
        setPhone(user.address?.phone || "");
        setStreet(user.address?.street || "");
        setCity(user.address?.city || "");

      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUserInfo();
  }, [token]);
  /* ================= PLACE ORDER ================= */
  const handlePlaceOrder = async () => {
    if (!firstName || !lastName || !phone || !email || !city) {
      setMessage(t("fillRequired"));;
      return;
    }

    if (!restaurantId) {
      setMessage(t("restaurantNotSelected"));
      return;
    }

    if (cart.length === 0) {
      setMessage(t("cartEmpty"));
      return;
    }

    setLoading(true);
    setMessage("");

    try {

      // ===================================================
      // 🔐 IF USER IS LOGGED IN → NO OTP
      // ===================================================
      if (isLoggedIn) {
        setShowOtp(false);

        // =========================================
        // 💳 CHAPA PAYMENT (LOGGED-IN USER)
        // Skip OTP but go to payment page first
        // =========================================
        if (paymentMethod === "CHAPA") {

          const tx_ref = `TX-${Date.now()}`;

          const paymentRes = await axios.post(
            `${API_URL}/payments/initialize`,
            {
              tx_ref,
              restaurantId,

              items: cart.map((item) => ({
                menuItemId: item.menuItemId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              })),

              totalPrice: total,

              deliveryAddress: {
                street,
                city,
              },

              customer: {
                email,
                firstName,
                lastName,
                phone,
              },
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const checkoutUrl = paymentRes.data.checkout_url;

          window.location.href = checkoutUrl;

          return;
        }

        // =========================================
        // 💵 COD / BANK → CREATE ORDER DIRECTLY
        // =========================================
        const orderRes = await axios.post(
          `${API_URL}/orders`,
          {
            restaurantId,
            email,
            customerName: { firstName, lastName },
            items: cart.map((item) => ({
              menuItemId: item.menuItemId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            totalPrice: total,
            paymentMethod,
            deliveryAddress: { street, city },
            instructions: "",
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const orderId = orderRes.data.orderId;

        clearCart();
        navigate(`/orders/${orderId}`);
        return;
      }

      // ===================================================
      // 👤 GUEST USER → SEND OTP FIRST
      // ===================================================
      await axios.post(`${API_URL}/orders/send-otp`, {
        email,
        phone,
      });

      setShowOtp(true);
      setMessage("OTP sent to your email. Please verify.");

    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to process order");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleVerifyOtp = async (otp) => {
    if (isLoggedIn) return;
    setLoading(true);
    setMessage("");

    const token = localStorage.getItem("token");

    try {
      // ====================================================
      // 1️⃣ VERIFY OTP (Guest only)
      // ====================================================
      await axios.post(`${API_URL}/orders/verify-otp`, {
        email,
        otp,
      });

      setShowOtp(false);

      // ====================================================
      // 2️⃣ CHAPA FLOW (Redirect Only)
      // ====================================================
      if (paymentMethod === "CHAPA") {

        const tx_ref = `TX-${Date.now()}`;

        const paymentRes = await axios.post(
          `${API_URL}/payments/initialize`,
          {
            tx_ref,
            restaurantId,

            items: cart.map((item) => ({
              menuItemId: item.menuItemId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),

            totalPrice: total,

            deliveryAddress: {
              street,
              city,
            },

            customer: {
              email,
              firstName,
              lastName,
              phone,
            },
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const checkoutUrl = paymentRes.data.checkout_url;

        window.location.href = checkoutUrl;

        return;
      }

      // ====================================================
      // 3️⃣ CREATE ORDER (COD / BANK)
      // ====================================================
      const orderRes = await axios.post(
        `${API_URL}/orders`,
        {
          restaurantId,
          email,
          customerName: { firstName, lastName },
          items: cart.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          totalPrice: total,
          paymentMethod,
          paymentReference: "",
          deliveryAddress: { street, city },
          instructions: "",
        },
        // ✅ If token exists (edge case), send it
        token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {}
      );

      const orderId = orderRes.data.orderId;

      clearCart();
      navigate(`/orders/${orderId}`);

    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= JSX ================= */
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans text-[#333]">
      <h1 className="text-[42px] font-normal text-center mb-10 text-[#444]">
        {t("checkout")}
      </h1>

      {message && (
        <div className="bg-yellow-100 border-l-4 border-[#ffde00] text-black py-3 px-4 mb-6 rounded shadow-sm">
          {message}
        </div>
      )}

      {/* {cart.length > 0 && (
        <div className="bg-[#1a8a4e] text-white py-4 px-6 rounded-sm mb-6 text-[15px]">
          {cartMessage}
        </div>
      )} */}

      {/* GREEN NOTICE BAR */}
      {cart.length > 0 && (
        <div className="bg-[#1a8a4e] text-white py-4 px-6 rounded-sm flex justify-between items-center mb-6 text-[15px]">
          <span>{cartMessage}</span>
          <button className="font-semibold flex items-center gap-2 hover:underline">
            Checkout <span className="text-xl">➡</span>
          </button>
        </div>
      )}

      {/* YELLOW COUPON BAR */}
      <div className="bg-[#ffde00] p-4 rounded-sm mb-12 text-[15px]">
        Have a coupon?{" "}
        <button className="font-bold hover:text-gray-700 transition-colors">
          Click here to enter your code
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* LEFT COLUMN – BILLING & SHIPPING */}
        <div className="lg:col-span-7 bg-white">
          <section className="mb-12">
            <h2 className="text-[28px] font-semibold mb-8 pb-1 relative">
              Billing details
              <div className="absolute bottom-0 left-0 w-32 h-[3px] bg-[#ffde00]"></div>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold">
                  {t("firstName")} <span className="text-red-500">*</span>
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border border-gray-200 rounded-full px-6 py-4 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                />
              </div>


              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold">
                  {t("lastName")} <span className="text-red-500">*</span>
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="border border-gray-200 rounded-full px-6 py-4 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                />
              </div>

              <div className="flex flex-col gap-2 col-span-full">
                <label className="text-[14px] font-bold">
                  {t("phone")}<span className="text-red-500">*</span>
                </label>
                <div className="flex border border-gray-200 rounded-full overflow-hidden">
                  <span className="px-6 py-4 border-r border-gray-200 bg-white text-gray-500">
                    +251
                  </span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 px-4 py-4 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 col-span-full">
                <label className="text-[14px] font-bold">
                  {t("emailAddress")} <span className="text-red-500">*</span>
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-gray-200 rounded-full px-6 py-4 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                />
              </div>

              <div className="flex flex-col gap-2 col-span-full">
                <label className="text-[14px] font-bold">
                  {t("streetAddressOptional")}
                </label>
                <input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street name"
                  className="border border-gray-200 rounded-full px-6 py-4 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold">
                  {t("cityTown")} <span className="text-red-500">*</span>
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City Name"
                  className="border border-gray-200 rounded-full px-6 py-4 focus:outline-none"
                />
              </div>

              {/* CREATE ACCOUNT */}
              <div className="col-span-full mt-4 flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={createAccount}
                    onChange={() => setCreateAccount(!createAccount)}
                  />
                  <span className="text-[15px] font-bold text-[#444] group-hover:text-black">
                    Create an account?
                  </span>
                </label>

                {createAccount && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[14px] font-bold block mb-2">
                      Account password (optional)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password (optional)"
                      className="border border-gray-200 rounded-full px-6 py-4 focus:outline-none w-full md:w-1/2"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN – ORDER SUMMARY */}
        <div className="lg:col-span-5 bg-gray-100 border border-gray-100 p-8 rounded-sm shadow-sm self-start">
          <h2 className="text-[26px] font-semibold mb-8 pb-1 relative">
            Your order
            <div className="absolute bottom-0 left-0 w-24 h-[3px] bg-[#ffde00]"></div>
          </h2>

          <div className="w-full text-[15px] mb-6">
            <div className="flex justify-between font-bold border-b border-gray-200 pb-4 mb-4">
              <span>Product</span>
              <span>{t("subtotal")}</span>
            </div>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
                >
                  <span className="text-gray-600 font-medium">
                    {item.name}{" "}
                    <span className="font-bold text-black ml-2">
                      × {item.quantity}
                    </span>
                  </span>
                  <span className="font-bold">
                    Br{" "}
                    {(item.price * item.quantity).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between py-6 border-t border-gray-200 mt-4">
              <span className="font-bold">Subtotal</span>
              <span className="font-bold">
                Br{" "}
                {subtotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* SHIPPING */}
            <div className="border-t border-gray-200 pt-6 pb-6">
              <p className="font-bold mb-4">Shipping</p>
              <div className="space-y-4">
                <label className="flex items-start justify-between gap-3 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={shipping === 200}
                      onChange={() => setShipping(200)}
                      className="mt-1"
                    />
                    <span className="text-gray-600">
                      Express Delivery (Addis Ababa):
                    </span>
                  </div>
                  <span className="font-bold shrink-0">Br 200.00</span>
                </label>

                <label className="flex items-start justify-between gap-3 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={shipping === 500}
                      onChange={() => setShipping(500)}
                      className="mt-1"
                    />
                    <span className="text-gray-600">Regional Delivery:</span>
                  </div>
                  <span className="font-bold shrink-0">Br 500.00</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    checked={shipping === 0}
                    onChange={() => setShipping(0)}
                  />
                  <span className="text-gray-600">Pickup From Store:</span>
                  <span className="font-bold ml-auto">Free</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between text-[18px] font-bold border-t border-gray-200 pt-6">
              <span>{t("total")}</span>
              <span>
                Br{" "}
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* PAYMENT METHODS */}
          <div className="mt-10 space-y-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              <span className="font-bold text-[#444]">Cash On Delivery</span>
            </label>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={paymentMethod === "BANK or TELEBIRR"}
                  onChange={() => setPaymentMethod("BANK or TELEBIRR")}
                />
                <span className="font-bold text-[#444]">
                  Bank Transfer Or TeleBirr
                </span>
              </label>
              {paymentMethod === "BANK or TELEBIRR" && (
                <div className="bg-[#f2f2f2] p-6 text-[14px] leading-relaxed text-[#555] rounded-sm">
                  Email ላይ በሚላክ የድርጅት አካውንት ቁጥር ወይም በቴሌብር ስልክ ቁጥር መክፈል ይችላሉ። OTP
                  will be sent to your phone to verify the transaction.
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={paymentMethod === "CHAPA"}
                  onChange={() => setPaymentMethod("CHAPA")}
                />
                <span className="font-bold text-[#444]">
                  Chapa Financial Technologies
                </span>
              </label>
              {paymentMethod === "CHAPA" && (
                <div className="bg-[#f2f2f2] p-6 text-[14px] leading-relaxed text-[#555] rounded-sm">
                  Pay using your Tele birr, CBE Birr, ATM, Bank account, Mobile
                  money through Chapa's secure gateway.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="mt-10 bg-[#ffde00] text-black w-full py-5 rounded-full text-[17px] font-bold hover:bg-black hover:text-white transition-all duration-300 shadow-sm"
          >
            {loading
              ? t("processing")
              : paymentMethod === "CHAPA"
                ? t("proceedToChapa")
                : t("placeOrder")}
          </button>

        </div>
      </div>

      {!isLoggedIn && showOtp && (
        <OtpModal
          email={email}
          onVerify={handleVerifyOtp}
          loading={loading}
          onCancel={() => setShowOtp(false)}
        />
      )}
    </div>
  );
}
