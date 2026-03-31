import React, { useEffect } from "react";
import {
  FaUtensils,
  FaBiking,
  FaUsers,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaRocket,
  FaAward
} from "react-icons/fa";

const About = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { id: 1, label: "Partner Restaurants", value: "150+", icon: <FaUtensils className="text-orange-500" /> },
    { id: 2, label: "Happy Customers", value: "50k+", icon: <FaUsers className="text-orange-500" /> },
    { id: 3, label: "Cities Covered", value: "10+", icon: <FaMapMarkerAlt className="text-orange-500" /> },
    { id: 4, label: "Daily Deliveries", value: "2,000+", icon: <FaBiking className="text-orange-500" /> },
  ];

  const values = [
    {
      title: "Quality First",
      desc: "We partner only with the best restaurants in Addis Ababa to ensure every meal meets high standards.",
      icon: <FaAward />,
    },
    {
      title: "Fastest Delivery",
      desc: "Our localized logistics engine ensures your food arrives hot, fresh, and exactly on time.",
      icon: <FaRocket />,
    },
    {
      title: "Supporting Local",
      desc: "We empower Ethiopian restaurant owners by providing the digital tools they need to grow.",
      icon: <FaCheckCircle />,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      {/* --- HERO SECTION --- */}
      {/* Height increased to h-[700px] and background adjusted for white navbar compatibility */}
      <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2070"
            alt="Modern High-End Restaurant"
            className="w-full h-full object-cover opacity-60 dark:opacity-30"
          />
          {/* Transition gradient from white navbar (top) to page content (bottom) */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/40 to-white dark:from-slate-950 dark:via-slate-950/40 dark:to-slate-950" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">
            Redefining Food Delivery in <span className="text-orange-500">Addis Ababa</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            Addis Eats is more than a delivery app. We are the bridge between Ethiopia's rich culinary
            traditions and the modern, fast-paced lifestyle of our beautiful capital.
          </p>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-12 -mt-24 relative z-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-2xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800 text-center transition-transform hover:-translate-y-2"
            >
              <div className="bg-orange-50 dark:bg-orange-950/30 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl">
                {stat.icon}
              </div>
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- OUR STORY SECTION --- */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
            <img
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=2047"
              alt="Sophisticated Dining Atmosphere"
              className="rounded-[40px] shadow-2xl relative z-10 border-8 border-white dark:border-slate-900 h-[500px] w-full object-cover"
            />
            <div className="absolute -bottom-10 -right-10 hidden lg:block z-20">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-orange-500 font-black text-3xl italic">"The Best Choice"</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mt-1">— Ethiopian Food Blog</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-orange-500 font-black text-sm uppercase tracking-[0.3em] mb-3">Our Journey</h2>
              <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                From Piassa to the Whole Nation.
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Founded in the heart of Addis Ababa, **Addis Eats** started with a simple vision:
              making the diverse flavors of our city accessible to everyone, everywhere.
              Whether it's traditional Beyaynetu or a modern burger, we believe great food
              brings people together.
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Today, we operate in Bole, Old Airport, Kazanchis, and are rapidly expanding
              to other major Ethiopian cities. Our technology empowers hundreds of local
              vendors to reach more customers than ever before.
            </p>
            <div className="pt-4">
              <button className="bg-slate-900 dark:bg-orange-500 text-white px-10 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg active:scale-95">
                Join Our Network
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- VALUES SECTION --- */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-orange-500 font-black text-sm uppercase tracking-[0.3em] mb-3">Core Values</h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              Why Thousands Choose Addis Eats
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-10 rounded-[35px] border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  {v.icon}
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-4">{v.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER BRAGGING --- */}
      <section className="py-20 text-center border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-slate-300 dark:text-slate-800 text-6xl md:text-9xl font-black uppercase tracking-tighter select-none">
          Addis Eats Ethiopia
        </h2>
      </section>
    </div>
  );
};

export default About;