import { useEffect, useState } from "react";
import axios from "axios";
import {
  ShoppingBag,
  Clock,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  RefreshCcw,
  Receipt
} from "lucide-react";
import { useLocation } from "react-router-dom";
import ReviewModal from "../../components/ReviewModal";
const OrdersPageAccount = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const [reviewModal, setReviewModal] = useState(null);
  const [reviewedOrders, setReviewedOrders] = useState({});

  const token = localStorage.getItem("token");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedOrderId = queryParams.get("orderId");

  useEffect(() => {
    fetchOrders();
  }, []);

  // scroll to highlighted order
  useEffect(() => {
    if (selectedOrderId) {
      setTimeout(() => {
        const element = document.getElementById(selectedOrderId);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [orders]);

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/user/myorders", {
        headers: { Authorization: `Bearer ${token} ` },
      });
      setOrders(res.data.orders);
      res.data.orders.forEach(order => {
        checkReviewStatus(order._id);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (orderId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/user/orders/reorder/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification("Order placed successfully!", "success");
    } catch (err) {
      console.error(err);
      showNotification("Something went wrong. Try again.", "error");
    }
  };

  const handleWriteReview = (orderId) => {
    console.log("Write review for order:", orderId);
  };
  const checkReviewStatus = async (orderId) => {
    try {

      const res = await axios.get(
        `http://localhost:5000/api/reviews/check/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setReviewedOrders(prev => ({
        ...prev,
        [orderId]: res.data.reviewed
      }));

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans text-slate-900">

      {/* Toast */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${toast.show
        ? "translate-y-0 opacity-100"
        : "-translate-y-12 opacity-0 pointer-events-none"
        }`}>
        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border ${toast.type === "success"
          ? "bg-white border-green-100 text-green-700"
          : "bg-white border-red-100 text-red-700"
          }`}>
          {toast.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">
              My Orders
            </h2>
            <p className="text-slate-500 mt-1 font-medium">
              Manage and track your recent deliveries
            </p>
          </div>

          <div className="hidden md:block p-3 bg-white rounded-2xl text-indigo-600 shadow-sm border border-slate-100">
            <Receipt size={28} />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium italic">
              Loading your history...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="text-slate-300" size={30} />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No orders found</h3>
            <p className="text-slate-500">
              Hungry? Start exploring nearby restaurants.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {

              const isHighlighted = order._id === selectedOrderId && !reviewedOrders[order._id];

              return (
                <div
                  id={order._id}
                  key={order._id}
                  className={`group p-5 rounded-[24px] transition-all duration-300 relative overflow-hidden
                  ${isHighlighted
                      ? "bg-orange-50 border border-orange-300 shadow-lg ring-2 ring-orange-200"
                      : "bg-white border border-slate-100 hover:shadow-md"
                    }`}
                >

                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-start justify-between">
                    <div className="space-y-1">

                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-lg text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                          {order.restaurantId?.name || "Restaurant"}
                        </h3>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest ${order.orderStatus?.toLowerCase() === "delivered" ||
                            order.orderStatus?.toLowerCase() === "completed"
                            ? "bg-green-50 text-green-600 border border-green-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                            }`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock size={14} />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>

                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>

                        <span className="font-medium text-slate-500">
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      size={20}
                      className="text-slate-300 group-hover:translate-x-1 group-hover:text-indigo-400 transition-all"
                    />
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    <div className="text-sm text-slate-600 max-w-[300px]">
                      <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block mb-0.5">
                        Order Summary
                      </span>

                      <p className="truncate italic text-slate-500">
                        {order.items.map(i => i.menuItemId?.name).join(", ")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">

                      <button
                        onClick={() => handleReorder(order._id)}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-100"
                      >
                        <RefreshCcw
                          size={16}
                          className="transition-transform duration-500 group-hover:rotate-90"
                        />
                        Reorder
                      </button>

                      {isHighlighted && !reviewedOrders[order._id] && (
                        <button
                          onClick={() =>
                            setReviewModal({
                              orderId: order._id,
                              restaurantName: order.restaurantId?.name
                            })
                          }
                          className="group flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-orange-100"
                        >
                          <svg
                            className="w-4 h-4 transition-transform duration-500 group-hover:rotate-90"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
                          </svg>
                          Write Review
                        </button>
                      )}
                      {reviewedOrders[order._id] && (
                        <span className="px-4 py-2 rounded-xl bg-green-50 text-green-600 text-sm font-semibold">
                          Reviewed ✓
                        </span>
                      )}

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {reviewModal && (
        <ReviewModal
          orderId={reviewModal.orderId}
          restaurantName={reviewModal.restaurantName}
          onClose={() => setReviewModal(null)}
          onSuccess={() => {
            setReviewedOrders(prev => ({
              ...prev,
              [reviewModal.orderId]: true
            }));
          }}
        />
      )}
    </div>
  );
};

export default OrdersPageAccount;

