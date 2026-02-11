import React from "react";
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Social Media Data with specific brand colors for hover effects
  const socials = [
    {
      name: "Telegram",
      icon: (
        <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42l10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.703l-.328 4.926c.483 0 .697-.221.967-.481l2.322-2.257l4.829 3.567c.89.491 1.53.237 1.751-.826l3.166-14.913c.325-1.302-.5-1.894-1.354-1.5z" />
      ),
      color: "hover:bg-[#0088cc]",
      link: "#",
    },
    {
      name: "Facebook",
      icon: <Facebook size={20} />,
      color: "hover:bg-[#1877F2]",
      link: "#",
    },
    {
      name: "Instagram",
      icon: <Instagram size={20} />,
      color:
        "hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
      link: "#",
    },
    {
      name: "TikTok",
      icon: (
        <path d="M9 12a4 4 0 1 0 4 4V2a5 5 0 0 0 3 4.6l1 .4v2a5 5 0 0 1-4-1.4V16a6 6 0 1 1-6-6z" />
      ),
      color: "hover:bg-[#000000]",
      link: "#",
    },
  ];

  return (
    <footer className="bg-[#0f172a] text-gray-300 pt-16 pb-8 px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* TOP SECTION: GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* 1. BRAND & ABOUT */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-orange-500 italic">አዲስ</span> Eats
            </h2>
            <p className="text-sm leading-relaxed text-gray-400">
              The #1 food delivery platform in Addis Ababa. We connect you with
              the finest hotels and local restaurants, delivering tradition and
              taste right to your doorstep.
            </p>
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.link}
                  className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(0,0,0,0.4)] ${social.color} hover:text-white`}
                >
                  {typeof social.icon === "object" &&
                  social.name !== "Telegram" &&
                  social.name !== "TikTok" ? (
                    social.icon
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      {social.icon}
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* 2. QUICK LINKS */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-orange-500 pl-3">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {[
                "Browse Restaurants",
                "Popular Dishes",
                "Become a Partner",
                "Join as Driver",
                "About Us",
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="flex items-center gap-2 text-sm hover:text-orange-500 transition-colors group"
                  >
                    <ChevronRight
                      size={14}
                      className="text-orange-500 group-hover:translate-x-1 transition-transform"
                    />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. CONTACT INFO */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-orange-500 pl-3">
              Contact Us
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <MapPin className="text-orange-500 shrink-0" size={20} />
                <span className="text-sm">
                  Bole Road, Near Friendship Mall,
                  <br />
                  Addis Ababa, Ethiopia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-orange-500 shrink-0" size={20} />
                <span className="text-sm">+251 911 00 00 00</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-orange-500 shrink-0" size={20} />
                <span className="text-sm">support@addiseats.com</span>
              </li>
            </ul>
          </div>

          {/* 4. NEWSLETTER */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-orange-500 pl-3">
              Newsletter
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to get offers & news about new restaurants.
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-slate-800 border-none rounded-xl py-3 pl-4 pr-12 focus:ring-2 focus:ring-orange-500 text-sm outline-none"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 p-2 rounded-lg hover:bg-orange-600 transition-colors">
                <Send size={16} className="text-white" />
              </button>
            </div>
            <div className="mt-6 p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
              <p className="text-xs text-orange-400 font-semibold italic">
                "The fastest way to the best taste in Addis!"
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: COPYRIGHT */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>
            © {currentYear}{" "}
            <span className="text-gray-300 font-medium">
              Addis Eats Delivery
            </span>
            . All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Sitemap
            </a>
          </div>
          <p className="flex items-center gap-1">
            Built with <span className="text-red-500 animate-pulse">❤️</span>{" "}
            for Addis Ababa Hotels
          </p>
        </div>
      </div>
    </footer>
  );
}
