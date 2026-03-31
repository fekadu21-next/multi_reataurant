import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Send,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socials = [
    {
      name: "Telegram",
      icon: <MessageCircle size={20} />, // Using MessageCircle as a clean modern alternative or custom path
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
      color: "hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
      link: "#",
    },
    {
      name: "TikTok",
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.88-.39-2.81-.14-.93.25-1.76.84-2.27 1.67-.39.63-.55 1.39-.46 2.13.1 1.04.66 2.01 1.51 2.62.86.63 1.96.88 3.02.66 1.05-.2 1.99-.9 2.49-1.85.34-.63.48-1.35.45-2.07-.03-4.63-.01-9.26-.01-13.89z" />
        </svg>
      ),
      color: "hover:bg-black dark:hover:bg-white dark:hover:text-black",
      link: "#",
    },
  ];

  return (
    <footer className="bg-[#013864] dark:bg-[#0f172a] text-gray-200 dark:text-gray-300 pt-16 pb-8 px-6 transition-colors duration-500 border-t border-white/5">
      <div className="max-w-[1200px] mx-auto">
        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* BRAND */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-orange-500 italic">ማራኪ</span> Eats
            </h2>
            <p className="text-sm leading-relaxed text-gray-300 dark:text-gray-400">
              The #1 food delivery platform in Addis Ababa, connecting you with
              your favorite local flavors.
            </p>

            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.link}
                  aria-label={social.name}
                  className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg ${social.color} text-white`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-orange-500 pl-3">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Browse Restaurants", path: "/restaurants" },
                { name: "Services", path: "/services" },
                { name: "Contact Us", path: "/contact" },
                { name: "About Us", path: "/about" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 text-sm hover:text-orange-500 transition-colors group"
                  >
                    <ChevronRight
                      size={14}
                      className="text-orange-500 group-hover:translate-x-1 transition-transform"
                    />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-orange-500 pl-3">
              Contact Us
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                  <MapPin className="text-orange-500" size={18} />
                </div>
                <span className="text-sm pt-1">Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                  <Phone className="text-orange-500" size={18} />
                </div>
                <span className="text-sm">+251 911 00 00 00</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                  <Mail className="text-orange-500" size={18} />
                </div>
                <span className="text-sm">support@marakieats.com</span>
              </li>
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-orange-500 pl-3">
              Newsletter
            </h3>
            <p className="text-xs mb-4 text-gray-400">Subscribe for the latest offers.</p>
            <div className="relative group">
              <input
                type="email"
                placeholder="Email address"
                className="w-full p-3.5 pr-12 rounded-xl bg-white/10 border border-white/5 focus:border-orange-500 focus:outline-none transition-all text-sm placeholder:text-gray-500"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 rounded-lg transition-colors shadow-lg">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] uppercase tracking-widest text-gray-400">
          <p>© {currentYear} ማራኪ Eats. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}