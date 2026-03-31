import React, { useEffect } from "react";
import {
  FaMotorcycle,
  FaStore,
  FaMobileAlt,
  FaShieldAlt,
  FaGlobeAfrica,
  FaChartLine,
  FaClock,
  FaWallet
} from "react-icons/fa";
const Services = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const coreServices = [
    {
      title: "On-Demand Delivery",
      desc: "The fastest food delivery network in Addis Ababa. From your favorite local 'Kitcha Fit-Fit' to international cuisines, delivered in under 45 minutes.",
      icon: <FaMotorcycle />,
      color: "bg-orange-500",
    },
    {
      title: "Restaurant POS Tools",
      desc: "We provide restaurant owners with a powerful dashboard to manage orders, track inventory, and analyze sales growth in real-time.",
      icon: <FaChartLine />,
      color: "bg-blue-600",
    },
    {
      title: "Addis Eats for Business",
      desc: "Corporate meal planning for offices in Bole and Kazanchis. Bulk ordering and scheduled deliveries for your entire team.",
      icon: <FaStore />,
      color: "bg-emerald-600",
    },
    {
      title: "Digital Payments",
      desc: "Integrated with local banks and Telebirr. Seamless, cashless transactions that are secure and instant for both users and vendors.",
      icon: <FaWallet />,
      color: "bg-purple-600",
    },
  ];

  const features = [
    { name: "Real-time Tracking", icon: <FaMobileAlt /> },
    { name: "24/7 Reliability", icon: <FaClock /> },
    { name: "Secure Tech", icon: <FaShieldAlt /> },
    { name: "Nationwide Vision", icon: <FaGlobeAfrica /> },
  ];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      {/* --- HERO SECTION --- */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-orange-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h2 className="text-orange-500 font-black text-sm uppercase tracking-[0.3em] mb-4">
            What We Offer
          </h2>
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">
            Comprehensive Solutions for <span className="text-orange-500">Modern Dining.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Addis Eats isn't just an app; it's a full-stack logistics and technology
            partner driving the digital transformation of Ethiopia's food industry.
          </p>
        </div>
      </section>

      {/* --- CORE SERVICES GRID --- */}
      <section className="py-10 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          {coreServices.map((service, index) => (
            <div
              key={index}
              className="group p-8 md:p-12 rounded-[40px] bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10"
            >
              <div className={`${service.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                {service.icon}
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4">
                {service.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
                {service.desc}
              </p>
              <div className="flex items-center gap-2 text-orange-500 font-bold cursor-pointer group/link">
                Learn more
                <span className="group-hover/link:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- THE ADDED VALUE (ICON ROW) --- */}
      <section className="py-24 bg-slate-900 dark:bg-slate-900/80 my-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {features.map((feature, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="text-orange-500 text-4xl flex justify-center">
                  {feature.icon}
                </div>
                <h4 className="text-white font-bold text-xl">{feature.name}</h4>
                <div className="h-1 w-12 bg-orange-500 mx-auto rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SERVICE FOR VENDORS SECTION --- */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=2070"
              alt="Merchant App"
              className="rounded-[50px] shadow-2xl border-4 border-white dark:border-slate-800"
            />
          </div>
          <div className="lg:w-1/2 order-1 lg:order-2 space-y-8">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              Grow your restaurant with <span className="text-orange-500">data-driven</span> insights.
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              We don't just deliver your food; we deliver customers. Our merchant platform
              allows you to see which dishes are trending in Addis, manage your digital menu,
              and run marketing campaigns specifically for your neighborhood.
            </p>
            <ul className="space-y-4">
              {['Auto-dispatch delivery riders', 'Monthly performance reports', '24/7 Merchant support'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-xs">✔</div>
                  {item}
                </li>
              ))}
            </ul>
            <button className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-black hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95">
              List Your Restaurant
            </button>
          </div>
        </div>
      </section>

      {/* --- BOTTOM CTA --- */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto bg-slate-50 dark:bg-slate-900 p-12 md:p-20 rounded-[60px] border border-slate-100 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />

          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 relative z-10">
            Ready to experience the best of Addis?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 relative z-10">
            Download the app and get your first delivery free.
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-black transition-all">
              <FaMobileAlt /> App Store
            </button>
            <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-black transition-all">
              <FaMobileAlt /> Google Play
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Services;