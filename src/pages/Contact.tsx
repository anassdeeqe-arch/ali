import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Youtube, Twitter } from 'lucide-react';
import { store } from '../lib/store';
import { WebsiteSettings } from '../types';

export const Contact: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsData = await store.getSettings();
        setSettings(settingsData);
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pastel-pink">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-pink"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6">Get in Touch</h1>
        <p className="text-gray-600 text-lg">
          Have a question, collaboration idea, or just want to say hello? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-8">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-pastel-pink text-accent-pink rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Email Us</p>
                  <p className="text-sm font-bold text-gray-900">contact@elegance.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-pastel-pink text-accent-pink rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Call Us</p>
                  <p className="text-sm font-bold text-gray-900">+92 300 1234567</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-pastel-pink text-accent-pink rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Visit Us</p>
                  <p className="text-sm font-bold text-gray-900">Gulberg III, Lahore, Pakistan</p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-12 border-t border-gray-50">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Follow Our Journey</h4>
              <div className="flex gap-4">
                <a href={settings.pinterest} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-accent-pink transition-all">
                  <Twitter size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-10 md:p-16 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-8">Send us a Message</h3>
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-accent-pink"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-accent-pink"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Subject</label>
                <input 
                  type="text" 
                  placeholder="How can we help?" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-accent-pink"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Message</label>
                <textarea 
                  placeholder="Your message here..." 
                  rows={6}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-accent-pink resize-none"
                ></textarea>
              </div>
      <button 
        type="button"
        disabled={isSending}
        onClick={() => {
          setIsSending(true);
          setTimeout(() => {
            setIsSending(false);
            alert("Message sent! (Demo only)");
          }, 1500);
        }}
        className="w-full bg-gray-900 text-white rounded-xl py-5 font-bold uppercase tracking-widest text-sm hover:bg-accent-pink transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-70"
      >
        {isSending ? "Sending..." : "Send Message"} <Send size={18} className={isSending ? "animate-pulse" : ""} />
      </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
