import {
  FaShoppingCart,
  FaInstagram,
  FaMapMarkerAlt,
  FaMicrophone,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="w-full">
      <div className="w-full bg-[#2e2e2e] h-10 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex items-center gap-6 text-white text-xl cursor-pointer">
          <FaShoppingCart />
          <FaInstagram />
        </div>
      </div>

      <div className="w-full bg-white py-4 px-10 flex items-center justify-between shadow">
        <div
          className="flex items-center gap-1 select-none cursor-pointer"
          onClick={() => navigate("/")}
        >
          <span
            className="text-4xl font-bold"
            style={{
              fontFamily: "'Abyssinica SIL', serif",
              letterSpacing: "1px",
              fontWeight: 700,
            }}
          >
            ማራኪ
          </span>
          <span
            className="text-orange-500 text-3xl"
            style={{ fontFamily: "'Pacifico', cursive", marginLeft: "4px" }}
          >
            Eats
          </span>
        </div>

        <div className="flex items-center bg-gray-100 px-4 py-3 rounded-full w-[45%] border">
          <FaMapMarkerAlt className="text-gray-600 text-lg mr-3" />
          <input
            type="text"
            className="bg-transparent w-full outline-none text-gray-700 text-sm"
            placeholder="Bole, Addis Ababa | What are you craving? (E.g., Shiro, under 200 Birr)"
          />
          <FaMicrophone className="text-gray-600 text-lg ml-3 cursor-pointer" />
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <button
                className="px-6 py-2 border border-gray-700 bg-gray-800 text-white hover:bg-gray-700 rounded-full"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="px-6 py-2 rounded-full bg-[#2A5248] text-white hover:bg-[#2A5241]"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">
                Hi, {user.firstName || user.name || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          )}

          <div className="relative">
            <FaShoppingCart
              className="text-2xl text-gray-700 cursor-pointer"
              onClick={() => navigate("/cart")}
            />
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-[1px] rounded-full">
              0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
