import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Star, Award, Users } from 'lucide-react';
import { store } from '../lib/store';
import { WebsiteSettings } from '../types';

export const About: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="pb-20">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gray-900">
        <img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920" 
          alt="About Us" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif font-bold text-white mb-6"
          >
            Our Story
          </motion.h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto uppercase tracking-widest text-sm">
            Defining {settings.websiteLogo || 'Elegance'} Since 2026
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="bg-white p-12 md:p-20 rounded-[3rem] shadow-2xl border border-gray-100 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-8 leading-tight">
                Curating the Best of <span className="italic text-accent-pink">{settings.websiteLogo || 'Elegance'}</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {settings.websiteLogo || 'Elegance'} was born out of a passion for the rich heritage of Pakistani textiles and the dynamic world of international fashion. We believe that every woman deserves to feel confident and beautiful in what she wears.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Our mission is to bridge the gap between traditional craftsmanship and modern style, providing our readers with curated trend reports, designer spotlights, and affordable style guides.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-3xl font-serif font-bold text-gray-900 mb-1">10k+</h3>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Monthly Readers</p>
                </div>
                <div>
                  <h3 className="text-3xl font-serif font-bold text-gray-900 mb-1">500+</h3>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Curated Items</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800" 
                alt="Fashion" 
                className="rounded-[2rem] shadow-xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-8 -left-8 bg-accent-pink text-white p-8 rounded-[2rem] shadow-xl hidden md:block">
                <Heart size={32} />
                <p className="mt-4 font-bold uppercase tracking-widest text-xs">Made with Love</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <section className="container mx-auto px-4 mt-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Our Core Values</h2>
          <p className="text-gray-500 uppercase tracking-widest text-xs">What drives us every day</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Authenticity', desc: 'We only recommend products we truly love and believe in.', icon: Star },
            { title: 'Inclusivity', desc: 'Fashion is for everyone, regardless of size, budget, or background.', icon: Users },
            { title: 'Excellence', desc: 'We strive for the highest quality in our content and curation.', icon: Award },
          ].map((value, idx) => (
            <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm text-center hover:shadow-xl transition-all duration-500">
              <div className="w-16 h-16 bg-pastel-pink text-accent-pink rounded-2xl flex items-center justify-center mx-auto mb-8">
                <value.icon size={32} />
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">{value.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
