// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
// import { io } from "socket.io-client";

// const API_URL = "http://localhost:5000/api/orders";
// const SOCKET_URL = "http://localhost:5000";

// export default function OrdersPage() {
//   const [orders, setOrders] = useState([]);
//   const [restaurants, setRestaurants] = useState([]);
//   const [selectedRestaurant, setSelectedRestaurant] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [unseenCount, setUnseenCount] = useState(0);

//   // ---------------- Socket.IO ----------------
//   useEffect(() => {
//     const socket = io(SOCKET_URL, { withCredentials: true });

//     // Register admin on socket
//     const adminId = localStorage.getItem("adminId"); // set on login
//     if (adminId) socket.emit("registerAdmin", adminId);

//     // Listen for new order notifications
//     socket.on("adminNewOrder", () => {
//       setUnseenCount((prev) => prev + 1);
//       fetchOrders(); // Refresh orders list
//     });

//     return () => socket.disconnect();
//   }, []);

//   // ---------------- Fetch Orders ----------------
//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(API_URL, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       });

//       const validOrders = res.data.filter(
//         (order) =>
//           order.paymentStatus === "PAID" && order.orderStatus === "CONFIRMED",
//       );

//       setOrders(validOrders);
//       setLoading(false);

//       // Update unseen count from backend
//       const countRes = await axios.get(`${API_URL}/admin/unseen-count`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       });
//       setUnseenCount(countRes.data.unseenCount);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch orders");
//       setLoading(false);
//     }
//   };

//   // ---------------- Mark Admin Notifications as Seen ----------------
//   const markNotificationsSeen = async () => {
//     try {
//       await axios.post(
//         `${API_URL}/admin/mark-seen`,
//         {},
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         },
//       );
//       setUnseenCount(0);
//     } catch (err) {
//       console.error("Error marking notifications seen:", err);
//     }
//   };

//   // ---------------- Restaurants List ----------------
//   const fetchRestaurants = () => {
//     const uniqueRestaurants = [
//       ...new Map(
//         orders.map((o) => [o.restaurantId?._id, o.restaurantId]),
//       ).values(),
//     ];
//     setRestaurants(uniqueRestaurants);
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   useEffect(() => {
//     if (orders.length > 0) fetchRestaurants();
//   }, [orders]);

//   // ---------------- Filter by Restaurant ----------------
//   const filteredOrders = useMemo(() => {
//     if (!selectedRestaurant) return orders;
//     return orders.filter((o) => o.restaurantId?._id === selectedRestaurant);
//   }, [orders, selectedRestaurant]);

//   // ---------------- Weekly Total & Commission ----------------
//   const { weeklyTotal, totalCommission } = useMemo(() => {
//     const start = startOfWeek(new Date(), { weekStartsOn: 1 });
//     const end = endOfWeek(new Date(), { weekStartsOn: 1 });

//     let weekly = 0;
//     let commission = 0;

//     filteredOrders.forEach((order) => {
//       const createdAt = new Date(order.createdAt);
//       if (isWithinInterval(createdAt, { start, end })) {
//         weekly += order.totalPrice || 0;
//         commission += order.adminCommission || 0;
//       }
//     });

//     return { weeklyTotal: weekly, totalCommission: commission };
//   }, [filteredOrders]);

//   const formatDate = (dateStr) =>
//     new Date(dateStr).toLocaleDateString(undefined, {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-3xl font-bold">Orders (PAID & CONFIRMED)</h1>

//         {unseenCount > 0 && (
//           <button
//             onClick={markNotificationsSeen}
//             className="px-4 py-2 bg-red-500 text-white rounded"
//           >
//             {unseenCount} New Orders
//           </button>
//         )}
//       </div>

//       {error && <p className="text-red-500">{error}</p>}

//       {/* Restaurant Filter */}
//       <div className="mb-4">
//         <label className="mr-2 font-semibold">Filter by Restaurant:</label>
//         <select
//           className="border p-2 rounded"
//           value={selectedRestaurant}
//           onChange={(e) => setSelectedRestaurant(e.target.value)}
//         >
//           <option value="">All Restaurants</option>
//           {restaurants.map((r) => (
//             <option key={r._id} value={r._id}>
//               {r.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Summary */}
//       <div className="mb-4 p-4 border rounded bg-gray-50">
//         <p>
//           <strong>Weekly Revenue:</strong> ${weeklyTotal.toFixed(2)}
//         </p>
//         <p>
//           <strong>Total Admin Commission:</strong> ${totalCommission.toFixed(2)}
//         </p>
//         <p>
//           <strong>Total Orders:</strong> {filteredOrders.length}
//         </p>
//       </div>

//       {/* Orders Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border border-gray-300">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="border p-2">Customer</th>
//               <th className="border p-2">Phone</th>
//               <th className="border p-2">Email</th>
//               <th className="border p-2">Restaurant</th>
//               <th className="border p-2">Address</th>
//               <th className="border p-2">Items</th>
//               <th className="border p-2">Total Price</th>
//               <th className="border p-2">Admin Commission</th>
//               <th className="border p-2">Created At</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="9" className="text-center p-4">
//                   Loading...
//                 </td>
//               </tr>
//             ) : filteredOrders.length === 0 ? (
//               <tr>
//                 <td colSpan="9" className="text-center p-4">
//                   No PAID & CONFIRMED orders found
//                 </td>
//               </tr>
//             ) : (
//               filteredOrders.map((order) => {
//                 const customerName =
//                   order.customerName?.firstName && order.customerName?.lastName
//                     ? `${order.customerName.firstName} ${order.customerName.lastName}`
//                     : "Guest Customer";

//                 const address = order.deliveryAddress
//                   ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`
//                   : "-";

//                 const itemsList = order.items
//                   .map((item) => `${item.name} x ${item.quantity}`)
//                   .join(", ");

//                 return (
//                   <tr key={order._id} className="hover:bg-gray-50">
//                     <td className="border p-2">{customerName}</td>
//                     <td className="border p-2">{order.customerPhone || "-"}</td>
//                     <td className="border p-2">{order.customerEmail || "-"}</td>
//                     <td className="border p-2">
//                       {order.restaurantId?.name || "-"}
//                     </td>
//                     <td className="border p-2">{address}</td>
//                     <td className="border p-2">{itemsList || "-"}</td>
//                     <td className="border p-2">
//                       ${order.totalPrice.toFixed(2)}
//                     </td>
//                     <td className="border p-2">
//                       ${order.adminCommission.toFixed(2)}
//                     </td>
//                     <td className="border p-2">
//                       {formatDate(order.createdAt)}
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";

const API_URL = "http://localhost:5000/api/orders";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------- FETCH ORDERS ----------------
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const filtered = res.data.filter(
        (o) =>
          o.paymentStatus === "PAID" &&
          o.orderStatus === "CONFIRMED"
      );

      setOrders(filtered);
      setLoading(false);
      
    } catch (err) {
      setError("Failed to fetch orders");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // ---------------- EXTRACT RESTAURANTS ----------------
  useEffect(() => {
    const unique = [
      ...new Map(
        orders.map((o) => [o.restaurantId?._id, o.restaurantId])
      ).values(),
    ];
    setRestaurants(unique);
  }, [orders]);

  // ---------------- FILTER ----------------
  const filteredOrders = useMemo(() => {
    if (!selectedRestaurant) return orders;
    return orders.filter(
      (o) => o.restaurantId?._id === selectedRestaurant
    );
  }, [orders, selectedRestaurant]);

  // ---------------- STATS ----------------
  const { weeklyRevenue, totalCommission } = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });

    let revenue = 0;
    let commission = 0;

    filteredOrders.forEach((order) => {
      const created = new Date(order.createdAt);

      if (isWithinInterval(created, { start, end })) {
        revenue += order.totalPrice || 0;
        commission += order.adminCommission || 0;
      }
    });

    return {
      weeklyRevenue: revenue,
      totalCommission: commission,
    };
  }, [filteredOrders]);

  const formatDate = (date) =>
    new Date(date).toLocaleString();

  // ---------------- UI ----------------
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Orders (PAID & CONFIRMED)
      </h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* Filter */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">
          Filter by Restaurant:
        </label>
        <select
          className="border p-2 rounded"
          value={selectedRestaurant}
          onChange={(e) =>
            setSelectedRestaurant(e.target.value)
          }
        >
          <option value="">All Restaurants</option>
          {restaurants.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="mb-4 p-4 bg-gray-50 border rounded">
        <p>
          <strong>Weekly Revenue:</strong> $
          {weeklyRevenue.toFixed(2)}
        </p>
        <p>
          <strong>Total Admin Commission:</strong> $
          {totalCommission.toFixed(2)}
        </p>
        <p>
          <strong>Total Orders:</strong>{" "}
          {filteredOrders.length}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Customer</th>
              <th className="border p-2">Restaurant</th>
              <th className="border p-2">Items</th>
              <th className="border p-2">Total</th>
              <th className="border p-2">Commission</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="border p-2">
                    {order.customerName?.firstName}{" "}
                    {order.customerName?.lastName}
                  </td>
                  <td className="border p-2">
                    {order.restaurantId?.name}
                  </td>
                  <td className="border p-2">
                    {order.items
                      .map(
                        (item) =>
                          `${item.name} x ${item.quantity}`
                      )
                      .join(", ")}
                  </td>
                  <td className="border p-2">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="border p-2">
                    ${order.adminCommission.toFixed(2)}
                  </td>
                  <td className="border p-2">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}