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
  const [shipping, setShipping] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");

  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");

  const [shippingOptions, setShippingOptions] = useState([]);
  const [commissionPercent, setCommissionPercent] = useState(0);

  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  /* ================= FIXED CART AGGREGATION ================= */
  // This logic ensures that if the same item was added multiple times, 
  // we display it as a single row with a combined quantity.
  const aggregatedCart = useMemo(() => {
    const map = new Map();
    cart.forEach((item) => {
      if (map.has(item.menuItemId)) {
        const existing = map.get(item.menuItemId);
        map.set(item.menuItemId, {
          ...existing,
          quantity: Number(existing.quantity) + Number(item.quantity),
        });
      } else {
        map.set(item.menuItemId, { ...item });
      }
    });
    return Array.from(map.values());
  }, [cart]);

  // ================= CALCULATE TOTALS =================
  const subtotal = useMemo(() => {
    if (!aggregatedCart || aggregatedCart.length === 0) return 0;
    return aggregatedCart.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);
  }, [aggregatedCart]);

  const total = useMemo(() => {
    const shippingPrice = Number(shipping?.price) || 0;
    return subtotal + shippingPrice;
  }, [subtotal, shipping]);

  /* ================= CART MESSAGE ================= */
  let cartMessage = "";
  if (aggregatedCart.length === 1) {
    cartMessage = `"${aggregatedCart[0].name}" has been added to your cart.`;
  } else if (aggregatedCart.length > 1) {
    cartMessage = `${aggregatedCart.length} items have been added to your cart.`;
  }

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/user/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data.user;
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

  useEffect(() => {
    const fetchShippingOptions = async () => {
      try {
        const res = await axios.get(`${API_URL}/shipping`);
        const { shippingOptions, commissionPercent } = res.data;
        const options = shippingOptions || [];
        setShippingOptions(options);
        setCommissionPercent(commissionPercent || 0);
        if (options.length > 0) {
          setShipping(options[0]);
        }
      } catch (err) {
        console.error("Failed to fetch shipping options:", err);
      }
    };
    fetchShippingOptions();
  }, []);

  /* ================= PLACE ORDER ================= */
  const handlePlaceOrder = async () => {
    if (!firstName || !lastName || !phone || !email || !city) {
      setMessage(t("fillRequired"));
      return;
    }
    if (!restaurantId) {
      setMessage(t("restaurantNotSelected"));
      return;
    }
    if (createAccount && !password) {
      setMessage("Password is required to create account");
      setLoading(false);
      return;
    }
    if (aggregatedCart.length === 0) {
      setMessage(t("cartEmpty"));
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (isLoggedIn) {
        setShowOtp(false);
        if (paymentMethod === "CHAPA") {
          const tx_ref = `TX-${Date.now()}`;
          const paymentRes = await axios.post(
            `${API_URL}/payments/initialize`,
            {
              tx_ref,
              restaurantId,
              items: aggregatedCart.map((item) => ({
                menuItemId: item.menuItemId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              })),
              totalPrice: total,
              deliveryAddress: { street, city },
              customer: { email, firstName, lastName, phone },
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          window.location.href = paymentRes.data.checkout_url;
          return;
        }

        const orderRes = await axios.post(
          `${API_URL}/orders`,
          {
            restaurantId,
            email,
            customerName: { firstName, lastName },
            items: aggregatedCart.map((item) => ({
              menuItemId: item.menuItemId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            totalPrice: total,
            paymentMethod,
            deliveryAddress: { street, city },
            instructions: "",
            shippingType: shipping?.type,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        clearCart();
        navigate(`/orders/${orderRes.data.orderId}`);
        return;
      }

      await axios.post(`${API_URL}/orders/send-otp`, { email, phone });
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
    try {
      await axios.post(`${API_URL}/orders/verify-otp`, { email, otp });
      setShowOtp(false);
      if (paymentMethod === "CHAPA") {
        const tx_ref = `TX-${Date.now()}`;
        const paymentRes = await axios.post(
          `${API_URL}/payments/initialize`,
          {
            tx_ref,
            restaurantId,
            items: aggregatedCart.map((item) => ({
              menuItemId: item.menuItemId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            totalPrice: total,
            deliveryAddress: { street, city },
            customer: { email, firstName, lastName, phone },
            createAccount,
            password,
          },
          {}
        );
        window.location.href = paymentRes.data.checkout_url;
        return;
      }

      const orderRes = await axios.post(`${API_URL}/orders`, {
        restaurantId,
        email,
        customerName: { firstName, lastName },
        items: aggregatedCart.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalPrice: total,
        paymentMethod,
        deliveryAddress: { street, city },
        instructions: "",
        shippingType: shipping?.type,
        createAccount,
        password,
        phone,
      });
      clearCart();
      navigate(`/orders/${orderRes.data.orderId}`);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans text-[#333] dark:text-gray-200">
        <h1 className="text-[42px] font-normal text-center mb-10 text-[#444] dark:text-gray-100">
          {t("checkout")}
        </h1>

        {message && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-[#ffde00] text-black dark:text-yellow-200 py-3 px-4 mb-6 rounded shadow-sm">
            {message}
          </div>
        )}

        {aggregatedCart.length > 0 && (
          <div className="bg-[#1a8a4e] text-white py-4 px-6 rounded-sm flex justify-between items-center mb-6 text-[15px]">
            <span>{cartMessage}</span>
            <button className="font-semibold flex items-center gap-2 hover:underline">
              Checkout <span className="text-xl">➡</span>
            </button>
          </div>
        )}

        <div className="bg-[#ffde00] dark:bg-[#eab308] p-4 rounded-sm mb-12 text-[15px] text-black font-medium">
          Have a coupon?{" "}
          <button className="font-bold hover:text-gray-700 dark:hover:text-gray-900 transition-colors">
            Click here to enter your code
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-[#1e1e1e] p-1 md:p-0">
            <section className="mb-12">
              <h2 className="text-[28px] font-semibold mb-8 pb-1 relative dark:text-white">
                Billing details
                <div className="absolute bottom-0 left-0 w-32 h-[3px] bg-[#ffde00]"></div>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold dark:text-gray-300">
                    {t("firstName")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] rounded-full px-6 py-4 focus:outline-none focus:ring-1 focus:ring-[#ffde00] transition-all dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold dark:text-gray-300">
                    {t("lastName")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] rounded-full px-6 py-4 focus:outline-none focus:ring-1 focus:ring-[#ffde00] transition-all dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-2 col-span-full">
                  <label className="text-[14px] font-bold dark:text-gray-300">
                    {t("phone")}<span className="text-red-500">*</span>
                  </label>
                  <div className="flex border border-gray-200 dark:border-gray-700 rounded-full overflow-hidden">
                    <span className="px-6 py-4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400">
                      +251
                    </span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 px-4 py-4 bg-white dark:bg-[#2a2a2a] focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 col-span-full">
                  <label className="text-[14px] font-bold dark:text-gray-300">
                    {t("emailAddress")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] rounded-full px-6 py-4 focus:outline-none focus:ring-1 focus:ring-[#ffde00] transition-all dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-2 col-span-full">
                  <label className="text-[14px] font-bold dark:text-gray-300">
                    {t("streetAddressOptional")}
                  </label>
                  <input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Street name"
                    className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] rounded-full px-6 py-4 focus:outline-none dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold dark:text-gray-300">
                    {t("cityTown")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City Name"
                    className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] rounded-full px-6 py-4 focus:outline-none dark:text-white"
                  />
                </div>

                <div className="col-span-full mt-4 flex flex-col gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#ffde00]"
                      checked={createAccount}
                      onChange={() => setCreateAccount(!createAccount)}
                    />
                    <span className="text-[15px] font-bold text-[#444] dark:text-gray-300 group-hover:text-black dark:group-hover:text-white">
                      Create an account?
                    </span>
                  </label>
                  {createAccount && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-[14px] font-bold block mb-2 dark:text-gray-300">
                        Account password (optional)
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password (optional)"
                        className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] rounded-full px-6 py-4 focus:outline-none w-full md:w-1/2 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 bg-gray-100 dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-800 p-8 rounded-sm shadow-sm self-start">
            <h2 className="text-[26px] font-semibold mb-8 pb-1 relative dark:text-white">
              Your order
              <div className="absolute bottom-0 left-0 w-24 h-[3px] bg-[#ffde00]"></div>
            </h2>

            <div className="w-full text-[15px] mb-6">
              <div className="flex justify-between font-bold border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 dark:text-white">
                <span>Product</span>
                <span>{t("subtotal")}</span>
              </div>

              <div className="space-y-4">
                {aggregatedCart.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800 last:border-0"
                  >
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {item.name}{" "}
                      <span className="font-bold text-black dark:text-white ml-2">
                        × {item.quantity}
                      </span>
                    </span>
                    <span className="font-bold dark:text-white">
                      Br{" "}
                      {(item.price * item.quantity).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between py-6 border-t border-gray-200 dark:border-gray-700 mt-4">
                <span className="font-bold dark:text-white">Subtotal</span>
                <span className="font-bold dark:text-white">
                  Br {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 pb-6">
                <p className="font-bold mb-4 dark:text-white">Shipping</p>
                <div className="space-y-4">
                  {shippingOptions?.map((opt) => (
                    <label key={opt.type} className="flex items-start justify-between gap-3 cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={shipping?.type === opt.type}
                          onChange={() => setShipping(opt)}
                          className="mt-1 accent-[#ffde00]"
                        />
                        <span className="text-gray-600 dark:text-gray-400">{opt.name}:</span>
                      </div>
                      <span className="font-bold shrink-0 dark:text-white">
                        {opt.price > 0 ? `Br ${opt.price.toLocaleString()}` : "Free"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between text-[18px] font-bold border-t border-gray-200 dark:border-gray-700 pt-6">
                <span className="dark:text-white">{t("total")}</span>
                <span className="dark:text-white">
                  Br {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="mt-10 space-y-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="accent-[#ffde00]"
                />
                <span className="font-bold text-[#444] dark:text-gray-300">Cash On Delivery</span>
              </label>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={paymentMethod === "BANK or TELEBIRR"}
                    onChange={() => setPaymentMethod("BANK or TELEBIRR")}
                    className="accent-[#ffde00]"
                  />
                  <span className="font-bold text-[#444] dark:text-gray-300">Bank Transfer Or TeleBirr</span>
                </label>
                {paymentMethod === "BANK or TELEBIRR" && (
                  <div className="bg-[#f2f2f2] dark:bg-[#2a2a2a] p-6 text-[14px] leading-relaxed text-[#555] dark:text-gray-400 rounded-sm">
                    Email ላይ በሚላክ የድርጅት አካውንት ቁጥር ወይም በቴሌብር ስልክ ቁጥር መክፈል ይችላሉ። OTP will be sent.
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={paymentMethod === "CHAPA"}
                    onChange={() => setPaymentMethod("CHAPA")}
                    className="accent-[#ffde00]"
                  />
                  <span className="font-bold text-[#444] dark:text-gray-300">Chapa Financial</span>
                </label>
                {paymentMethod === "CHAPA" && (
                  <div className="bg-[#f2f2f2] dark:bg-[#2a2a2a] p-6 text-[14px] leading-relaxed text-[#555] dark:text-gray-400 rounded-sm">
                    Pay using Tele birr, CBE Birr, or Bank through Chapa's secure gateway.
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="mt-10 bg-[#ffde00] text-black w-full py-5 rounded-full text-[17px] font-bold hover:bg-black hover:text-white dark:hover:bg-yellow-500 dark:hover:text-black transition-all duration-300 shadow-sm"
            >
              {loading ? t("processing") : paymentMethod === "CHAPA" ? t("proceedToChapa") : t("placeOrder")}
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
    </div>
  );
}