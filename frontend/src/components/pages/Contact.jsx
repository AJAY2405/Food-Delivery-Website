import React from "react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

const Contact = () => {
  return (
    <div className="min-h-screen bg-orange-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-400 to-orange-400 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>

          <p className="max-w-2xl mx-auto text-lg text-orange-100">
            Have questions or need help with your order? We'd love to hear from
            you. Our support team is always ready to assist you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left Side */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Get in Touch
            </h2>

            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-center gap-5 bg-white rounded-2xl shadow-md p-5">
                <div className="bg-orange-100 p-4 rounded-full">
                  <Phone className="text-orange-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">Phone</h3>
                  <p className="text-gray-600">+91 8528xxxx24</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-5 bg-white rounded-2xl shadow-md p-5">
                <div className="bg-orange-100 p-4 rounded-full">
                  <Mail className="text-orange-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">Email</h3>
                  <p className="text-gray-600">support@foodexpress.com</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-5 bg-white rounded-2xl shadow-md p-5">
                <div className="bg-orange-100 p-4 rounded-full">
                  <MapPin className="text-orange-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">Address</h3>
                  <p className="text-gray-600">
                    Hisar, Haryana, India
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-center gap-5 bg-white rounded-2xl shadow-md p-5">
                <div className="bg-orange-100 p-4 rounded-full">
                  <Clock className="text-orange-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">Working Hours</h3>
                  <p className="text-gray-600">Monday - Sunday</p>
                  <p className="text-gray-600">9:00 AM - 11:00 PM</p>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="mt-10">
              <h3 className="text-2xl font-semibold mb-5">
                Follow Us
              </h3>

              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-orange-400 hover:bg-orange-500 text-white flex items-center justify-center transition"
                >
                  <FaFacebookF size={20} />
                </a>

                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-orange-400 hover:bg-orange-500 text-white flex items-center justify-center transition"
                >
                  <FaInstagram size={20} />
                </a>

                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-orange-400 hover:bg-orange-500 text-white flex items-center justify-center transition"
                >
                  <FaTwitter size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Send us a Message
            </h2>

            <form className="space-y-6">
              <div>
                <label className="block font-medium mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Subject
                </label>

                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Message
                </label>

                <textarea
                  rows={5}
                  placeholder="Write your message..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
              >
                <Send size={18} />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-orange-400 py-16 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-4">
            We Are Here to Help 
          </h2>

          <p className="text-orange-100 text-lg mb-8">
            Whether it's a question about your order, delivery, or feedback, our
            team is always ready to assist you.
          </p>

          <button className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-orange-100 transition">
            Contact Support
          </button>
        </div>
      </section>
    </div>
  );
};

export default Contact;