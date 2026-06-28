
import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function Contact() {
  const [contact, setContact] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setSuccess(false);
    setErrors({});
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const err = {};

    if (!contact.name.trim()) err.name = "Name is required";
    if (!contact.email.trim()) err.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(contact.email))
      err.email = "Invalid email";

    if (!contact.subject.trim()) err.subject = "Subject is required";
    if (!contact.message.trim()) err.message = "Message is required";

    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSuccess(true);
      setContact(initialForm);
      setLoading(false);
    }, 1000);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-black/30 via-gray-900/50 to-black/30 backdrop-blur-lg rounded-3xl py-16 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-4">
            Get In Touch
          </h1>
          <p className="text-gray-400 text-lg">Have questions? We'd love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Contact Form */}
          <div className="bg-gradient-to-br from-gray-900/60 to-gray-950/80 backdrop-blur-3xl border border-gray-700/50 rounded-3xl shadow-2xl p-10">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-300 block mb-2">Full Name</label>
                <input
                  name="name"
                  placeholder="Enter your name"
                  value={contact.name}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-300 block mb-2">Email Address</label>
                <input
                  name="email"
                  placeholder="your@email.com"
                  value={contact.email}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-300 block mb-2">Subject</label>
                <input
                  name="subject"
                  placeholder="What's this about?"
                  value={contact.subject}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all"
                />
                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-300 block mb-2">Message</label>
                <textarea
                  name="message"
                  placeholder="Tell us more..."
                  value={contact.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full rounded-xl bg-gray-950/80 border border-gray-700 px-4 py-3.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all resize-none"
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>

              {success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                  <p className="text-green-400 font-semibold">Message sent successfully!</p>
                </div>
              )}
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-950/80 backdrop-blur-3xl border border-gray-700/50 rounded-3xl shadow-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500/20 p-4 rounded-xl">
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Email</h3>
                  <p className="text-gray-400">support@cleanindia.gov.in</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/60 to-gray-950/80 backdrop-blur-3xl border border-gray-700/50 rounded-3xl shadow-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500/20 p-4 rounded-xl">
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Phone</h3>
                  <p className="text-gray-400">1800-XXX-XXXX (Toll Free)</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/60 to-gray-950/80 backdrop-blur-3xl border border-gray-700/50 rounded-3xl shadow-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500/20 p-4 rounded-xl">
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Office</h3>
                  <p className="text-gray-400">Ministry of Environment<br/>New Delhi, India</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
