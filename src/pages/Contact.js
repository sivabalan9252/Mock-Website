import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';

const Contact = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  
  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        email: user.email || '',
        name: user.displayName || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.message) {
        showNotification('error', 'Please fill in all fields');
        return;
      }

      // Save to Firestore
      await addDoc(collection(db, 'contacts'), {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        userId: user ? user.uid : 'anonymous',
        createdAt: serverTimestamp()
      });

      // Identify user in Intercom if available
      if (window.identifyIntercomUser) {
        window.identifyIntercomUser({
          name: formData.name,
          email: formData.email,
          user_id: formData.email.toLowerCase().trim(),
          created_at: Math.floor(Date.now() / 1000)
        });
        
        console.log('Intercom: User identified with data:', {
          name: formData.name, 
          email: formData.email
        });
      }

      // Open Intercom chat with pre-filled message
      if (window.IntercomUtils) {
        setTimeout(() => {
          // First update the Last Page URL
          window.IntercomUtils.updateLastPageUrl();
          
          // Then open the chat with pre-filled message
          window.IntercomUtils.showNewMessage(
            `Hi! I just submitted the contact form. Here's my message: ${formData.message}`
          );
          
          console.log('Intercom: Chat initiated with message from contact form');
        }, 1000);
      }

      // Show success message
      showNotification('success', 'Thank you! We\'ll get back to you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      showNotification('error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Contact Us</h1>
          <p className="text-gray-600 text-center mb-10">
            Have a question or want to work with us? Send us a message!
          </p>

          {/* Notification */}
          {notification.show && (
            <motion.div 
              className={`p-4 mb-6 rounded-lg ${
                notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {notification.message}
            </motion.div>
          )}

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e53935]"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e53935]"
                  placeholder="Your email"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e53935]"
                  placeholder="Your message"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-[#e53935] text-white py-3 px-4 rounded-lg font-bold ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-red-700'
                }`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {/* Address */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="inline-block p-4 rounded-full bg-red-100 text-[#e53935] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Address</h3>
              <p className="text-gray-600">123 Creative Way<br />Design District, CA 90210</p>
            </div>

            {/* Email */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="inline-block p-4 rounded-full bg-red-100 text-[#e53935] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Email</h3>
              <a href="mailto:info@stellarcreative.com" className="text-gray-600 hover:text-[#e53935]">
                info@stellarcreative.com
              </a>
            </div>

            {/* Phone */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="inline-block p-4 rounded-full bg-red-100 text-[#e53935] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Phone</h3>
              <a href="tel:5551234567" className="text-gray-600 hover:text-[#e53935]">(555) 123-4567</a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
