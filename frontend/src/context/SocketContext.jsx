import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Initialize Socket
    useEffect(() => {
        console.log("DEBUG: Initializing socket connection...");
        const newSocket = io("http://localhost:5000", {
            transports: ["websocket"],
            autoConnect: true,
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("DEBUG: Socket connected:", newSocket.id);
        });

        newSocket.on("disconnect", () => {
            console.log("DEBUG: Socket disconnected");
        });

        newSocket.on("connect_error", (err) => {
            console.error("DEBUG: Socket connection error:", err);
        });

        // Listen for global notification events
        newSocket.on("notification", (data) => {
            console.log("DEBUG: Global Notification received:", data);

            if (data.unreadCount !== undefined) {
                setUnreadCount(data.unreadCount);
            }

            if (data.notification) {
                setNotifications((prev) => {
                    // Prevent duplicates
                    if (prev.find(n => n._id === data.notification._id)) return prev;
                    return [data.notification, ...prev];
                });
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Handle Room Joining
    useEffect(() => {
        if (!socket) return;
        if (!socket.connected) {
            // Wait for connection
            const onConnect = () => joinRooms(socket);
            socket.on("connect", onConnect);
            return () => socket.off("connect", onConnect);
        } else {
            joinRooms(socket);
        }
    }, [socket]);

    const joinRooms = (s) => {
        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                console.log("DEBUG: No user in localStorage, skipping room join");
                return;
            }

            const user = JSON.parse(userStr);
            console.log("DEBUG: Joining rooms for user:", user.email, "Role:", user.role);

            if (user.role === "restaurant_owner") {
                const rId = user.restaurantId || user.restaurant?.restaurantId;
                if (rId) {
                    console.log("DEBUG: Emitting joinRestaurant:", rId);
                    s.emit("joinRestaurant", rId);
                } else {
                    console.warn("DEBUG: Restaurant Owner but no restaurant ID found!");
                }
            } else if (user.role === "admin") {
                console.log("DEBUG: Emitting joinRoom: admin_notifications");
                s.emit("joinRoom", "admin_notifications");
            }
        } catch (e) {
            console.error("DEBUG: Error parsing user or joining room:", e);
        }
    };

    const joinRestaurantRoom = (restaurantId) => {
        if (socket && restaurantId) {
            console.log("DEBUG: Manual joinRestaurantRoom:", restaurantId);
            socket.emit("joinRestaurant", restaurantId);
        }
    };

    const updateUnreadCount = (count) => {
        setUnreadCount(count);
    };

    return (
        <SocketContext.Provider
            value={{
                socket,
                notifications,
                unreadCount,
                joinRestaurantRoom,
                setNotifications,
                updateUnreadCount,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};
