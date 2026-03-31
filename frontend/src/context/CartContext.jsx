import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // ✅ Load cart from localStorage initially and filter invalid items
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // Ensure we only load valid items
        return Array.isArray(parsed)
          ? parsed.filter(item => item.menuItemId && item.quantity > 0)
          : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // ✅ Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  /**
   * ✅ FIX: Add item to cart
   * This version WIPES the old items whenever a new one is added.
   * This prevents "Past" items from showing up in Checkout.
   */
  const addToCart = (item, restaurantId) => {
    setCart([
      {
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.categoryId?.name || "",
        quantity: 1, // Reset to 1 for the new selection
        restaurantId,
      },
    ]);
  };

  // ✅ Logic to specifically handle quantity for that ONE item
  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((i) =>
        i.menuItemId === id ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.menuItemId === id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== id));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);