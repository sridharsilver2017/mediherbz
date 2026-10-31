import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
        <span className="text-xs font-bold text-[#18833B] uppercase tracking-wider">Connect With Us</span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#26352A] font-serif">We'd Love to Hear From You</h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Have a question about our botanical formulations, order tracking, or wholesale enquiries? Our wellness team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
            <h2 className="font-bold text-lg text-[#26352A]">Direct Contact Channels</h2>
            <div className="space-y-4 text-sm text-stone-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#18833B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Mediherbz Herbal Wellness Laboratories</p>
                  <p className="text-stone-500 text-xs">Herbal Technology Park, Kerala 682001, India</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#18833B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Customer Care &amp; WhatsApp</p>
                  <p className="text-stone-500 text-xs">+91 98765 43210 (Mon-Sat, 9AM - 7PM IST)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#18833B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Official Inquiries</p>
                  <p className="text-stone-500 text-xs">care@mediherbz.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#18833B] mx-auto" />
                <h3 className="text-xl font-bold text-stone-900">Message Received!</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Thank you for reaching out to Mediherbz. Our Ayurvedic support staff will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Nair"
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="priya@example.com"
                      className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Product inquiry, feedback, order support"
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can our herbal experts help you today?"
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#18833B] hover:bg-[#12632F] text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

