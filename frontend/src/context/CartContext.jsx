import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // ✅ Add item to cart (WITH IMAGE & CATEGORY)
  const addToCart = (item, restaurantId) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item._id);

      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }

      return [
        ...prev,
        {
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          image: item.image, // ✅ IMAGE STORED
          category: item.categoryId?.name || "",
          quantity: 1,
          restaurantId,
        },
      ];
    });
  };

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((i) =>
        i.menuItemId === id ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.menuItemId === id ? { ...i, quantity: i.quantity - 1 } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((i) => i.menuItemId !== id));

  const clearCart = () => setCart([]);

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
