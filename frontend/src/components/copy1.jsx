import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Star,
  Clock,
  Info,
  Plus,
  ChevronRight,
  Heart,
  Flame,
  Leaf,
  Coffee,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * RESTAURANT MENU COMPONENT
 * Focused on Addis Ababa Food Scene
 * 6 Categories | 12 Items Each | High-End UI Effects
 */

export default function RestaurantMenu() {
  const { id } = useParams();

  // States
  const [activeCategory, setActiveCategory] = useState("Traditional");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null); // For "Show Details" Modal
  const [cartCount, setCartCount] = useState(0);

  /* =============================================================
     1. EXTENSIVE DUMMY DATA (72 ITEMS)
     ============================================================= */
  const restaurant = {
    name: "Lucy Restaurant & Hotel",
    rating: 4.8,
    reviews: "1.2k",
    deliveryTime: "25-35 min",
    minOrder: "150 ETB",
    description:
      "The pride of Addis. We serve authentic Ethiopian delicacies with a modern touch. Located at the heart of Bole.",
    image:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200",
  };

  const categories = [
    {
      id: "Traditional",
      icon: <Flame size={18} />,
      label: "Traditional (የባህል)",
    },
    { id: "Breakfast", icon: <Coffee size={18} />, label: "Breakfast (ቁርስ)" },
    { id: "Fasting", icon: <Leaf size={18} />, label: "Fasting (የጾም)" },
    { id: "Meat", icon: <Plus size={18} />, label: "Meat Dishes (የፍስክ)" },
    { id: "FastFood", icon: <Plus size={18} />, label: "Fast Food (ፈጣን)" },
    { id: "Juice", icon: <Plus size={18} />, label: "Juice & Cafe" },
  ];

  const menuItems = [
    // --- CATEGORY: TRADITIONAL (12 Items) ---
    {
      id: 101,
      name: "Special Doro Wat",
      price: 850,
      category: "Traditional",
      rating: 4.9,
      calories: "850 kcal",
      image:
        "https://images.unsplash.com/photo-1606756790138-261d2b21cd75?q=80&w=600",
      desc: "The king of Ethiopian stews. Slow-cooked chicken with 12 onions and berbere.",
    },
    {
      id: 102,
      name: "Assorted Beyaynetu",
      price: 320,
      category: "Traditional",
      rating: 4.7,
      calories: "600 kcal",
      image:
        "https://images.unsplash.com/photo-1541518763669-27f70411ff9a?q=80&w=600",
      desc: "A colorful platter of 10+ vegetable stews served on fresh Injera.",
    },
    {
      id: 103,
      name: "Special Kitfo",
      price: 780,
      category: "Traditional",
      rating: 4.8,
      calories: "950 kcal",
      image:
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600",
      desc: "Fine minced beef with Mitmita and Niter Kibbeh. Served Leb-leb.",
    },
    {
      id: 104,
      name: "Gomen Besiga",
      price: 450,
      category: "Traditional",
      rating: 4.5,
      calories: "720 kcal",
      image:
        "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=600",
      desc: "Fresh collard greens sautéed with tender beef chunks and garlic.",
    },
    {
      id: 105,
      name: "Siga Wot",
      price: 520,
      category: "Traditional",
      rating: 4.6,
      calories: "800 kcal",
      image:
        "https://images.pexels.com/photos/674574/pexels-photo-674574.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Beef stew simmered in spicy berbere sauce for 4 hours.",
    },
    {
      id: 106,
      name: "Minchet Abish",
      price: 380,
      category: "Traditional",
      rating: 4.4,
      calories: "650 kcal",
      image:
        "https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Finely chopped beef in a mild turmeric sauce.",
    },
    {
      id: 107,
      name: "Doro Tibs",
      price: 550,
      category: "Traditional",
      rating: 4.7,
      calories: "700 kcal",
      image:
        "https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Chicken breast cubes sautéed with onions and green peppers.",
    },
    {
      id: 108,
      name: "Key Wat",
      price: 490,
      category: "Traditional",
      rating: 4.5,
      calories: "780 kcal",
      image:
        "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Spicy beef stew made with rich berbere.",
    },
    {
      id: 109,
      name: "Boseena Shiro",
      price: 290,
      category: "Traditional",
      rating: 4.9,
      calories: "500 kcal",
      image:
        "https://images.pexels.com/photos/718742/pexels-photo-718742.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Special Shiro mixed with beef jerky (Quanta).",
    },
    {
      id: 110,
      name: "Miser Wot",
      price: 210,
      category: "Traditional",
      rating: 4.6,
      calories: "450 kcal",
      image:
        "https://images.pexels.com/photos/1273765/pexels-photo-1273765.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Split red lentils in spicy gravy.",
    },
    {
      id: 111,
      name: "Kik Alicha",
      price: 190,
      category: "Traditional",
      rating: 4.3,
      calories: "400 kcal",
      image:
        "https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Yellow split peas in a mild turmeric sauce.",
    },
    {
      id: 112,
      name: "Meten Shiro",
      price: 180,
      category: "Traditional",
      rating: 4.8,
      calories: "380 kcal",
      image:
        "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Standard spiced Shiro powder stew.",
    },

    // --- CATEGORY: BREAKFAST (12 Items) ---
    {
      id: 201,
      name: "Special Chechebsa",
      price: 240,
      category: "Breakfast",
      rating: 4.9,
      calories: "700 kcal",
      image:
        "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=600",
      desc: "Hand-torn flatbread with Niter Kibbeh and honey. Best in Addis.",
    },
    {
      id: 202,
      name: "Bullet Genfo",
      price: 350,
      category: "Breakfast",
      rating: 4.7,
      calories: "1100 kcal",
      image:
        "https://images.unsplash.com/photo-1593584785033-9c7604d0ed71?q=80&w=600",
      desc: "Barley porridge with a lake of spiced butter and berbere.",
    },
    {
      id: 203,
      name: "Full Fatira",
      price: 210,
      category: "Breakfast",
      rating: 4.5,
      calories: "600 kcal",
      image:
        "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600",
      desc: "Large pancake with eggs and honey.",
    },
    {
      id: 204,
      name: "Injera Firfir",
      price: 190,
      category: "Breakfast",
      rating: 4.4,
      calories: "550 kcal",
      image:
        "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Shredded Injera soaked in spicy sauce.",
    },
    {
      id: 205,
      name: "Special Ful",
      price: 180,
      category: "Breakfast",
      rating: 4.8,
      calories: "450 kcal",
      image:
        "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Fava beans mashed with oil, onions, and green peppers.",
    },
    {
      id: 206,
      name: "Scrambled Eggs (Enqulal)",
      price: 150,
      category: "Breakfast",
      rating: 4.2,
      calories: "350 kcal",
      image:
        "https://images.pexels.com/photos/6294396/pexels-photo-6294396.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Eggs fried with tomatoes and peppers.",
    },
    {
      id: 207,
      name: "Quanta Firfir",
      price: 310,
      category: "Breakfast",
      rating: 4.9,
      calories: "800 kcal",
      image:
        "https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Injera firfir with beef jerky chunks.",
    },
    {
      id: 208,
      name: "Fetira with Honey",
      price: 170,
      category: "Breakfast",
      rating: 4.6,
      calories: "500 kcal",
      image:
        "https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Simple pancake with raw honey.",
    },
    {
      id: 209,
      name: "Kinche",
      price: 120,
      category: "Breakfast",
      rating: 4.3,
      calories: "400 kcal",
      image:
        "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Cracked wheat boiled and seasoned with butter.",
    },
    {
      id: 210,
      name: "Bula Genfo",
      price: 400,
      category: "Breakfast",
      rating: 4.9,
      calories: "1000 kcal",
      image:
        "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "False banana root porridge with butter.",
    },
    {
      id: 211,
      name: "Omelette Special",
      price: 160,
      category: "Breakfast",
      rating: 4.1,
      calories: "420 kcal",
      image:
        "https://images.pexels.com/photos/6294396/pexels-photo-6294396.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Fluffy omelette with local spices.",
    },
    {
      id: 212,
      name: "Honey & Bread",
      price: 100,
      category: "Breakfast",
      rating: 4.5,
      calories: "300 kcal",
      image:
        "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Fresh local bread with honey.",
    },

    // --- CATEGORY: FASTING (12 Items) ---
    {
      id: 301,
      name: "Fasting Firfir",
      price: 160,
      category: "Fasting",
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600",
      desc: "Spicy tomato-based firfir.",
    },
    {
      id: 302,
      name: "Special Shiro Tagamino",
      price: 250,
      category: "Fasting",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=600",
      desc: "Thick Shiro served in a sizzling clay pot.",
    },
    {
      id: 303,
      name: "Miser Wot Special",
      price: 180,
      category: "Fasting",
      rating: 4.4,
      image:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600",
      desc: "Extra spicy red lentils.",
    },
    {
      id: 304,
      name: "Gomen Wot",
      price: 140,
      category: "Fasting",
      rating: 4.2,
      image:
        "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=600",
      desc: "Steamed kale with oil and spices.",
    },
    {
      id: 305,
      name: "Kik Alicha Special",
      price: 155,
      category: "Fasting",
      rating: 4.3,
      image:
        "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Yellow pea stew.",
    },
    {
      id: 306,
      name: "Fasting Pizza",
      price: 290,
      category: "Fasting",
      rating: 4.6,
      image:
        "https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "No cheese, veggie-loaded pizza.",
    },
    {
      id: 307,
      name: "Fasting Burger",
      price: 240,
      category: "Fasting",
      rating: 4.1,
      image:
        "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Veggie patty with avocado.",
    },
    {
      id: 308,
      name: "Suf Feses",
      price: 180,
      category: "Fasting",
      rating: 4.7,
      image:
        "https://images.pexels.com/photos/718742/pexels-photo-718742.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Sunflower seed based sauce with Injera.",
    },
    {
      id: 309,
      name: "Telba",
      price: 150,
      category: "Fasting",
      rating: 4.4,
      image:
        "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Flaxseed drink/dip.",
    },
    {
      id: 310,
      name: "Salad Platter",
      price: 120,
      category: "Fasting",
      rating: 4.0,
      image:
        "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Fresh Addis garden salad.",
    },
    {
      id: 311,
      name: "Vegetable Pasta",
      price: 190,
      category: "Fasting",
      rating: 4.2,
      image:
        "https://images.pexels.com/photos/1273765/pexels-photo-1273765.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Pasta with mild veggie sauce.",
    },
    {
      id: 312,
      name: "Rice with Veggies",
      price: 170,
      category: "Fasting",
      rating: 4.3,
      image:
        "https://images.pexels.com/photos/674574/pexels-photo-674574.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "White rice with sautéed vegetables.",
    },

    // --- CATEGORY: MEAT DISHES (12 Items) ---
    {
      id: 401,
      name: "Chikina Tibs",
      price: 650,
      category: "Meat",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=600",
      desc: "Tenderloin beef sautéed perfectly.",
    },
    {
      id: 402,
      name: "Derek Tibs",
      price: 580,
      category: "Meat",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1532592323ea5-32597ff03541?q=80&w=600",
      desc: "Charcoal grilled crispy beef.",
    },
    {
      id: 403,
      name: "Zilzil Tibs",
      price: 620,
      category: "Meat",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600",
      desc: "Long strips of sautéed beef.",
    },
    {
      id: 404,
      name: "Shesher Tibs",
      price: 710,
      category: "Meat",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1603362145664-d6219808a385?q=80&w=600",
      desc: "Mix of different meat textures.",
    },
    {
      id: 405,
      name: "Awaze Tibs",
      price: 590,
      category: "Meat",
      rating: 4.6,
      image:
        "https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Beef cooked in spicy Awaze sauce.",
    },
    {
      id: 406,
      name: "Beef Ribs",
      price: 850,
      category: "Meat",
      rating: 4.8,
      image:
        "https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Honey-glazed grilled ribs.",
    },
    {
      id: 407,
      name: "Goden Tibs",
      price: 600,
      category: "Meat",
      rating: 4.5,
      image:
        "https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Beef ribs sautéed with onions.",
    },
    {
      id: 408,
      name: "Beef Cutlet",
      price: 420,
      category: "Meat",
      rating: 4.4,
      image:
        "https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Breaded beef fillet.",
    },
    {
      id: 409,
      name: "Gored Gored",
      price: 740,
      category: "Meat",
      rating: 4.9,
      image:
        "https://images.pexels.com/photos/674574/pexels-photo-674574.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Cubic raw beef with spiced butter.",
    },
    {
      id: 410,
      name: "Dulet",
      price: 350,
      category: "Meat",
      rating: 4.7,
      image:
        "https://images.pexels.com/photos/718742/pexels-photo-718742.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Tripe, liver, and beef minced and sautéed.",
    },
    {
      id: 411,
      name: "Grilled Steak",
      price: 900,
      category: "Meat",
      rating: 4.6,
      image:
        "https://images.pexels.com/photos/3535383/pexels-photo-3535383.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Premium 300g beef steak.",
    },
    {
      id: 412,
      name: "Beef Stew (Mild)",
      price: 400,
      category: "Meat",
      rating: 4.2,
      image:
        "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Slow cooked mild beef.",
    },

    // --- CATEGORY: FAST FOOD (12 Items) ---
    {
      id: 501,
      name: "Addis Special Burger",
      price: 350,
      category: "FastFood",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600",
      desc: "Double patty with egg and avocado.",
    },
    {
      id: 502,
      name: "Margherita Pizza",
      price: 420,
      category: "FastFood",
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=600",
      desc: "Classic fresh mozzarella and basil.",
    },
    {
      id: 503,
      name: "Club Sandwich",
      price: 280,
      category: "FastFood",
      rating: 4.4,
      image:
        "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600",
      desc: "Triple layer with chicken and bacon.",
    },
    {
      id: 504,
      name: "Beef Shawarma",
      price: 240,
      category: "FastFood",
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1529006557870-17483c6ad3e0?q=80&w=600",
      desc: "Wrapped with special garlic sauce.",
    },
    {
      id: 505,
      name: "Pepperoni Pizza",
      price: 550,
      category: "FastFood",
      rating: 4.8,
      image:
        "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Spicy pepperoni and cheese.",
    },
    {
      id: 506,
      name: "Chicken Wings",
      price: 380,
      category: "FastFood",
      rating: 4.7,
      image:
        "https://images.pexels.com/photos/1108117/pexels-photo-1108117.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "8 pieces of spicy buffalo wings.",
    },
    {
      id: 507,
      name: "Cheeseburger",
      price: 300,
      category: "FastFood",
      rating: 4.3,
      image:
        "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Simple but perfect cheeseburger.",
    },
    {
      id: 508,
      name: "French Fries",
      price: 150,
      category: "FastFood",
      rating: 4.0,
      image:
        "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Crispy salted fries.",
    },
    {
      id: 509,
      name: "Hot Dog Special",
      price: 180,
      category: "FastFood",
      rating: 4.1,
      image:
        "https://images.pexels.com/photos/1633522/pexels-photo-1633522.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Loaded with onions and mustard.",
    },
    {
      id: 510,
      name: "Pasta Carbonara",
      price: 320,
      category: "FastFood",
      rating: 4.5,
      image:
        "https://images.pexels.com/photos/1273765/pexels-photo-1273765.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Creamy pasta with beef bits.",
    },
    {
      id: 511,
      name: "Veggie Pizza",
      price: 380,
      category: "FastFood",
      rating: 4.4,
      image:
        "https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Fresh peppers, olives, and corn.",
    },
    {
      id: 512,
      name: "Chicken Nugget",
      price: 260,
      category: "FastFood",
      rating: 4.2,
      image:
        "https://images.pexels.com/photos/2232433/pexels-photo-2232433.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "10 pieces of crispy nuggets.",
    },

    // --- CATEGORY: JUICE & CAFE (12 Items) ---
    {
      id: 601,
      name: "Special Spris Juice",
      price: 120,
      category: "Juice",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1623065422902-30a2ad44924b?q=80&w=600",
      desc: "Layered Avocado, Mango, and Papaya.",
    },
    {
      id: 602,
      name: "Ethiopian Coffee",
      price: 60,
      category: "Juice",
      rating: 5.0,
      image:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600",
      desc: "Traditional clay-pot jebena buna.",
    },
    {
      id: 603,
      name: "Avocado Smoothie",
      price: 110,
      category: "Juice",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1525385133512-2f49e377f382?q=80&w=600",
      desc: "Fresh Addis avocados with lime.",
    },
    {
      id: 604,
      name: "Tea with Ginger",
      price: 30,
      category: "Juice",
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1544787210-2213d2426511?q=80&w=600",
      desc: "Warming tea with fresh ginger.",
    },
    {
      id: 605,
      name: "Macchiato",
      price: 55,
      category: "Juice",
      rating: 4.8,
      image:
        "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Addis style strong macchiato.",
    },
    {
      id: 606,
      name: "Coke (Can)",
      price: 45,
      category: "Juice",
      rating: 4.0,
      image:
        "https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Chilled 330ml can.",
    },
    {
      id: 607,
      name: "Mango Juice",
      price: 100,
      category: "Juice",
      rating: 4.6,
      image:
        "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Pure fresh mango pulp.",
    },
    {
      id: 608,
      name: "Strawberry Shake",
      price: 160,
      category: "Juice",
      rating: 4.4,
      image:
        "https://images.pexels.com/photos/103566/pexels-photo-103566.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Thick strawberry milkshake.",
    },
    {
      id: 609,
      name: "Latte",
      price: 70,
      category: "Juice",
      rating: 4.7,
      image:
        "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Creamy milk coffee.",
    },
    {
      id: 610,
      name: "Sparkling Water",
      price: 40,
      category: "Juice",
      rating: 4.1,
      image:
        "https://images.pexels.com/photos/1242813/pexels-photo-1242813.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Ambo Water (local brand).",
    },
    {
      id: 611,
      name: "Papaya Juice",
      price: 90,
      category: "Juice",
      rating: 4.2,
      image:
        "https://images.pexels.com/photos/103566/pexels-photo-103566.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Freshly squeezed papaya.",
    },
    {
      id: 612,
      name: "Ice Cream Scoop",
      price: 80,
      category: "Juice",
      rating: 4.5,
      image:
        "https://images.pexels.com/photos/1352296/pexels-photo-1352296.jpeg?auto=compress&cs=tinysrgb&w=600",
      desc: "Vanilla or Chocolate flavor.",
    },
  ];

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = item.category === activeCategory;
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  /* =============================================================
     3. ANIMATION VARIANTS
     ============================================================= */
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  /* =============================================================
     4. UI RENDER
     ============================================================= */
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {/* --- HERO BANNER --- */}
      <div className="relative h-[300px] w-full overflow-hidden">
        <img
          src={restaurant.image}
          className="w-full h-full object-cover"
          alt="Restaurant Cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
          <div className="max-w-[1200px] mx-auto w-full">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base">
              <span className="flex items-center gap-1 bg-orange-500 px-2 py-1 rounded">
                <Star size={16} fill="white" /> {restaurant.rating} (
                {restaurant.reviews} Reviews)
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} /> {restaurant.deliveryTime}
              </span>
              <span className="flex items-center gap-1 font-semibold text-orange-400">
                Min Order: {restaurant.minOrder}
              </span>
            </div>
            <p className="mt-4 text-gray-300 max-w-2xl hidden md:block">
              {restaurant.description}
            </p>
          </div>
        </div>
      </div>

      {/* --- FLOATING SEARCH & CART BAR --- */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b py-4">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search in menu..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full border-none focus:ring-2 focus:ring-orange-500 outline-none transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:flex p-2 hover:bg-gray-100 rounded-full relative">
              <Heart size={22} className="text-gray-600" />
            </button>
            <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden md:block"></div>
            <button className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition shadow-lg transform active:scale-95">
              <ShoppingBag size={18} />
              <span className="font-semibold">Cart ({cartCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- CATEGORY SELECTOR --- */}
      <div className="max-w-[1200px] mx-auto px-6 mt-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap font-semibold transition-all duration-300 transform
                ${
                  activeCategory === cat.id
                    ? "bg-orange-500 text-white shadow-md scale-105"
                    : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-100"
                }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- MENU GRID --- */}
      <main className="max-w-[1200px] mx-auto px-6 mt-10">
        <div className="flex justify-between items-end mb-8 border-l-4 border-orange-500 pl-4">
          <div>
            <h2 className="text-3xl font-bold">{activeCategory}</h2>
            <p className="text-gray-500">
              Discover 12 fresh choices in this section
            </p>
          </div>
          <p className="text-sm font-medium text-orange-600">
            Showing {filteredItems.length} items
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10"
          >
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                {/* Image Section */}
                <div className="relative h-48 w-full overflow-hidden">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    src={item.image}
                    className="w-full h-full object-cover"
                    alt={item.name}
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white text-gray-400 hover:text-red-500 transition">
                    <Heart size={16} />
                  </button>
                  {item.rating >= 4.9 && (
                    <div className="absolute top-3 left-3 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                      <Flame size={12} /> BESTSELLER
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-800 leading-tight group-hover:text-orange-600 transition truncate">
                      {item.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded text-xs font-bold">
                      <Star size={12} fill="currentColor" /> {item.rating}
                    </div>
                    <span className="text-xs text-gray-400">
                      • {item.calories || "500 kcal"}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm mt-3 line-clamp-2 h-10">
                    {item.desc ||
                      "The finest local ingredients cooked with traditional secrets of our chefs."}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-medium">
                        Price
                      </span>
                      <span className="text-xl font-black text-gray-900">
                        {item.price} <small className="text-xs">ETB</small>
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-orange-100 hover:text-orange-600 transition transform active:scale-90"
                        title="Show Details"
                      >
                        <Info size={20} />
                      </button>
                      <button
                        onClick={handleAddToCart}
                        className="p-3 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 shadow-md shadow-orange-200 transition transform active:scale-90"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">No items found</h3>
            <p className="text-gray-500">
              Try adjusting your search or category filter.
            </p>
          </div>
        )}
      </main>

      {/* --- ITEM DETAIL MODAL (MODERN EFFECT) --- */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 h-64 md:h-auto">
                  <img
                    src={selectedItem.image}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <div className="w-full md:w-1/2 p-8">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-4 right-6 text-gray-400 hover:text-black text-2xl"
                  >
                    ×
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedItem.name}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="text-orange-500 font-bold">
                      {selectedItem.rating} ★
                    </span>
                    <span className="text-gray-400">
                      Category: {selectedItem.category}
                    </span>
                  </div>
                  <p className="mt-6 text-gray-600 leading-relaxed">
                    {selectedItem.desc ||
                      "This dish is crafted using only premium ingredients sourced from local farmers around Addis Ababa. A true taste of luxury and tradition."}
                  </p>

                  <div className="mt-8">
                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
                      Estimated Delivery
                    </p>
                    <p className="text-gray-900 font-bold flex items-center gap-2 mt-1">
                      <Clock size={16} className="text-orange-500" /> 20 - 30
                      Minutes
                    </p>
                  </div>

                  <div className="mt-10 flex items-center justify-between gap-4">
                    <span className="text-3xl font-black">
                      {selectedItem.price} ETB
                    </span>
                    <button
                      onClick={() => {
                        handleAddToCart();
                        setSelectedItem(null);
                      }}
                      className="flex-1 bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition shadow-lg"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
