import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Instagram, Facebook, Twitter, Search, User, ArrowUp, Youtube } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { store } from '../lib/store';
import { WebsiteSettings } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await store.getSettings();
        setSettings(data);
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    store.incrementPageView();
    window.scrollTo(0, 0);
    
    const refreshSettings = async () => {
      const data = await store.getSettings();
      setSettings(data);
    };
    refreshSettings();
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pastel-pink">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-pink"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 py-2 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center text-xs tracking-widest uppercase text-gray-500">
          <div className="flex gap-4">
            <a href={settings.pinterest} target="_blank" rel="noopener noreferrer" className="hover:text-accent-pink transition-colors">Pinterest</a>
          </div>
          <div></div>
          <div className="flex gap-4">
            <Link to="/admin" className="hover:text-accent-pink transition-colors flex items-center gap-1">
              <User size={12} /> Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-pink origin-left"
          style={{ scaleX }}
        />
        <div className="container mx-auto px-4 py-4 md:py-6 flex justify-between items-center">
          <button 
            className="md:hidden text-gray-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="text-2xl md:text-4xl font-serif font-bold tracking-tighter text-gray-900 flex items-center gap-3">
            {settings.websiteLogo && (
              <img src={settings.websiteLogo} alt="Logo" className="h-10 w-auto" />
            )}
            {settings.editorName}<span className="text-accent-pink">.</span>
          </Link>

          <nav className="hidden md:flex gap-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm tracking-widest uppercase transition-colors hover:text-accent-pink ${
                  location.pathname === link.path ? 'text-accent-pink font-semibold' : 'text-gray-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {/* Social Icons - Hidden on mobile, visible on large screens */}
            <div className="hidden lg:flex items-center gap-4 mr-2 border-r border-gray-200 pr-6">
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent-pink transition-colors">
                  <Instagram size={18} />
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent-pink transition-colors">
                  <Facebook size={18} />
                </a>
              )}
              {settings.pinterest && (
                <a href={settings.pinterest} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent-pink transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.633 0 12.017 0z"/></svg>
                </a>
              )}
              {settings.youtube && (
                <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent-pink transition-colors">
                  <Youtube size={18} />
                </a>
              )}
            </div>

            <button className="text-gray-600 hover:text-accent-pink transition-colors">
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-white border-b border-gray-100 absolute top-full left-0 w-full p-6 shadow-xl"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-lg font-serif text-gray-800 hover:text-accent-pink"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link to="/admin" className="text-lg font-serif text-gray-800 hover:text-accent-pink border-t pt-4">
                  Admin Dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-serif font-bold mb-6">{settings.editorName}.</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {settings.footerText}
            </p>
            <div className="flex gap-4">
              <a href={settings.pinterest} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-pastel-pink flex items-center justify-center text-accent-pink hover:bg-accent-pink hover:text-white transition-all">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-accent-pink transition-colors">Home</Link></li>
              <li><Link to="/blog" className="hover:text-accent-pink transition-colors">Fashion Blog</Link></li>
              <li><Link to="/about" className="hover:text-accent-pink transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Categories</h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/blog?cat=Summer" className="hover:text-accent-pink transition-colors">Summer Collection</Link></li>
              <li><Link to="/blog?cat=Wedding" className="hover:text-accent-pink transition-colors">Wedding Wear</Link></li>
              <li><Link to="/blog?cat=Jewelry" className="hover:text-accent-pink transition-colors">Jewelry & Accessories</Link></li>
              <li><Link to="/blog?cat=Trending" className="hover:text-accent-pink transition-colors">Trending Now</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Newsletter</h3>
            <p className="text-sm text-gray-500 mb-6">Subscribe to get the latest trends and exclusive offers.</p>
            <form className="relative group">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-gray-50 border border-gray-200 rounded-full px-6 py-3 text-sm w-full focus:outline-none focus:border-accent-pink transition-all"
              />
              <button className="absolute right-1 top-1 bottom-1 bg-gray-900 text-white px-6 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-accent-pink transition-all">
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-16 pt-8 border-t border-gray-50 text-center text-xs text-gray-400 tracking-widest uppercase">
          &copy; {new Date().getFullYear()} {settings.editorName}. All Rights Reserved.
        </div>
      </footer>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl z-[60] hover:bg-accent-pink transition-all"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
