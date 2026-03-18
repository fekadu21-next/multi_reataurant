import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { Plus, Minus, Trash } from "lucide-react";
import AskQuestionModal from "../components/AskQuestionModal";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const { cart, increaseQty, decreaseQty, removeFromCart } = useCart();
  const [showQuestion, setShowQuestion] = useState(false);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!cart.length) {
    return (
      <div className="p-16 text-center text-2xl font-bold text-black dark:text-white dark:bg-slate-950 min-h-screen">
        Your cart is empty 🛒
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-10 bg-white dark:bg-slate-950 text-black dark:text-white transition-colors duration-500">

      {cart.map((item) => (
        <div
          key={item.menuItemId}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white dark:bg-slate-900 p-8 rounded-xl shadow mb-10 border border-gray-100 dark:border-slate-800"
        >
          {/* IMAGE SECTION */}
          <div>
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-80 object-contain"
            />

            {/* THUMBNAILS */}
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {[item.image, item.image, item.image].map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="w-20 h-20 object-cover border border-gray-200 dark:border-slate-700 cursor-pointer"
                />
              ))}
            </div>
          </div>

          {/* DETAILS */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              {item.name}
            </h1>

            <p className="text-green-600 font-semibold">
              In stock
            </p>

            <p className="text-4xl font-bold text-gray-800 dark:text-gray-200">
              Br {item.price.toLocaleString()}
            </p>

            {/* QUANTITY CONTROL */}
            <div className="inline-flex items-center border border-gray-200 dark:border-slate-700 rounded-full overflow-hidden">
              <button
                onClick={() => decreaseQty(item.menuItemId)}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <Minus size={18} />
              </button>

              <input
                type="text"
                value={item.quantity}
                readOnly
                className="w-14 text-center border-x border-gray-200 dark:border-slate-700 outline-none font-semibold bg-transparent"
              />

              <button
                onClick={() => increaseQty(item.menuItemId)}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 items-center">

              <button
                onClick={() => navigate("/checkout")}
                className="bg-yellow-400 text-white px-10 py-3 rounded-full font-bold hover:bg-gray-800 transition"
              >
                Buy
              </button>

              <button
                onClick={() => setShowQuestion(true)}
                className="bg-yellow-300 px-6 py-3 text-white rounded-full font-semibold hover:bg-gray-800 transition"
              >
                Ask a Question
              </button>

              <button
                onClick={() => removeFromCart(item.menuItemId)}
                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition"
              >
                <Trash />
              </button>

            </div>
          </div>
        </div>
      ))}

      {/* TOTAL */}
      <div className="text-right text-2xl font-bold mt-6 text-black dark:text-white">
        Total: Br {total.toLocaleString()}
      </div>

      {showQuestion && (
        <AskQuestionModal onClose={() => setShowQuestion(false)} />
      )}
    </div>
  );
}