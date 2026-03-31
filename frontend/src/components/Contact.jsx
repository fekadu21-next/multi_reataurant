import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInstagram,
  FaTelegramPlane,
  FaTwitter,
  FaCheckCircle,
  FaArrowLeft,
} from "react-icons/fa";

const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    question: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post("http://localhost:5000/api/contact", formData);
      setIsSubmitted(true);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        question: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <FaPhoneAlt />,
      title: "Call Us",
      detail: "+251 911 22 33 44",
      subDetail: "Available 24/7 for support",
    },
    {
      icon: <FaEnvelope />,
      title: "Email Us",
      detail: "support@addiseats.et",
      subDetail: "We reply within 2 hours",
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Visit Our Office",
      detail: "Bole Road, Around Edna Mall",
      subDetail: "Addis Ababa, Ethiopia",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen transition-colors duration-300 font-sans">
      {/* HEADER SECTION */}
      <section className="relative pt-32 pb-16 px-6 text-center bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-950 dark:via-slate-900/30 dark:to-slate-950">
        <div className="relative z-10">
          <h2 className="text-orange-500 font-black text-sm uppercase tracking-[0.4em] mb-4">
            Get In Touch
          </h2>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            We're here to <span className="text-orange-500">help you.</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-xl leading-relaxed font-medium">
            Have a question about your order or want to partner with Addis Eats?
            Reach out and our local team will get back to you.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* LEFT: CONTACT INFO */}
          <div className="lg:col-span-5 space-y-10">
            <div className="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[50px] border border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-10 tracking-tight">
                Corporate HQ
              </h3>

              <div className="space-y-10">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex gap-6 items-start group">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20 flex items-center justify-center shrink-0 text-xl transition-transform group-hover:scale-110">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">
                        {item.title}
                      </h4>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                        {item.detail}
                      </p>
                      <p className="text-base text-slate-500 dark:text-slate-400 font-medium">
                        {item.subDetail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-12 h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent dark:from-slate-800 dark:via-slate-800 dark:to-transparent" />

              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
                Connect With Us
              </h4>
              <div className="flex gap-4">
                {[
                  { icon: <FaTelegramPlane />, color: "bg-blue-500" },
                  { icon: <FaInstagram />, color: "bg-pink-500" },
                  { icon: <FaTwitter />, color: "bg-sky-400" },
                ].map((social, i) => (
                  <a
                    key={i}
                    href="#"
                    className={`w-14 h-14 rounded-2xl ${social.color} text-white flex items-center justify-center text-xl transition-all shadow-lg hover:-translate-y-1`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: CONTACT FORM / SUCCESS MESSAGE */}
          <div className="lg:col-span-7 h-full">
            <div className="bg-white dark:bg-slate-900 shadow-[0_40px_100px_rgba(0,0,0,0.08)] dark:shadow-none border border-slate-100 dark:border-slate-800 rounded-[50px] p-10 md:p-16 min-h-[600px] flex flex-col justify-center">
              {!isSubmitted ? (
                <>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-10 tracking-tight">
                    Send a Message
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Abebe Bikila"
                          className="w-full px-8 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@email.com"
                          className="w-full px-8 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-2">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+251..."
                          className="w-full px-8 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="Partnership Inquiry"
                          className="w-full px-8 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-2">
                        Message
                      </label>
                      <textarea
                        name="question"
                        rows="5"
                        required
                        value={formData.question}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        className="w-full px-8 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-slate-900 dark:text-white font-medium resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-6 rounded-3xl font-black text-xl tracking-tight transition-all shadow-2xl ${isSubmitting
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                          : "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-orange-500/30 active:scale-[0.98]"
                        }`}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-5xl">
                    <FaCheckCircle />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      Message Received!
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                      Thank you for reaching out. Our team has received your
                      inquiry and will get back to you within 2 hours.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="flex items-center gap-2 mx-auto text-orange-500 font-black text-lg hover:gap-4 transition-all"
                  >
                    <FaArrowLeft /> Send another message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MAP SECTION - USING RELIABLE PLACE SEARCH URL */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-32">
        <div className="overflow-hidden rounded-[50px] border border-slate-100 dark:border-slate-800 shadow-2xl relative">
          <iframe
            title="Addis Eats HQ"
            // Using the Place Search format which is much more stable than the 'pb' internal string
            src="https://maps.google.com/maps?q=Edna%20Mall,%20Bole%20Road,%20Addis%20Ababa&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="550"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            className="grayscale-[0.2] contrast-[1.1] dark:invert dark:hue-rotate-180 dark:opacity-75 transition-all duration-700"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default Contact;