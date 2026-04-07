import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, Heart, Share2, Instagram, Facebook, Twitter } from 'lucide-react';
import { store } from '../lib/store';
import { Newsletter } from '../components/Newsletter';
import { BlogPost, WebsiteSettings } from '../types';

export const Home: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogsData, settingsData] = await Promise.all([
          store.getBlogs(),
          store.getSettings()
        ]);
        setBlogs(blogsData);
        setSettings(settingsData);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pastel-pink">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-pink"></div>
      </div>
    );
  }

  const trendingBlogs = blogs.filter(b => b.category === 'Trending' || b.views > 100).slice(0, 3);
  const recentBlogs = blogs.slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1920" 
            alt="Hero Fashion" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="text-accent-pink font-bold uppercase tracking-widest text-sm mb-4 block">Spring/Summer 2026</span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 leading-tight mb-6">
              The Art of <br /> <span className="italic">{settings.websiteLogo || 'Elegance'}</span>
            </h1>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Discover the latest trends in lawn, silk, and bridal wear. Curated collections from top designers and affordable style guides.
            </p>
            <div className="flex gap-4">
              <Link to="/blog" className="bg-gray-900 text-white px-8 py-4 text-sm uppercase tracking-widest font-bold hover:bg-accent-pink transition-all flex items-center gap-2">
                Explore Blog <ArrowRight size={16} />
              </Link>
              <Link to="/shop" className="bg-white text-gray-900 border border-gray-200 px-8 py-4 text-sm uppercase tracking-widest font-bold hover:bg-gray-50 transition-all">
                Shop Trends
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending Now Slider */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">Trending Now</h2>
            <p className="text-gray-500 uppercase tracking-widest text-xs">The most loved styles this week</p>
          </div>
          <Link to="/blog" className="text-accent-pink font-bold text-sm uppercase tracking-widest hover:underline flex items-center gap-2">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="trending-slider pb-8">
          {trendingBlogs.map((blog) => (
            <div key={blog.id} className="trending-item">
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent-pink">
                    {blog.category}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 uppercase tracking-widest">
                    <span>{blog.createdAt?.toDate ? blog.createdAt.toDate().toLocaleDateString() : 'Recent'}</span>
                    <span>•</span>
                    <span>{blog.views} Views</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-4 line-clamp-2 hover:text-accent-pink transition-colors">
                    <Link to={`/blog/${blog.id}`}>{blog.title}</Link>
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-grow">
                    {blog.content}
                  </p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <Link to={`/blog/${blog.id}`} className="text-xs font-bold uppercase tracking-widest text-gray-900 hover:text-accent-pink transition-colors">
                      Read More
                    </Link>
                    <div className="flex gap-3 text-gray-400">
                      <button className="hover:text-accent-pink transition-colors"><Heart size={16} /></button>
                      <button className="hover:text-accent-pink transition-colors"><Share2 size={16} /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="bg-pastel-pink py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Curated Categories</h2>
            <p className="text-gray-600">Find exactly what you are looking for in our specialized fashion sections.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Summer Lawn', img: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&q=80&w=800', count: 12 },
              { name: 'Wedding Wear', img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800', count: 8 },
              { name: 'Jewelry', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800', count: 15 },
            ].map((cat, idx) => (
              <Link key={idx} to={`/blog?cat=${cat.name.split(' ')[0]}`} className="group relative h-96 overflow-hidden rounded-2xl">
                <img 
                  src={cat.img} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-500"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-2xl font-serif font-bold mb-2">{cat.name}</h3>
                  <p className="text-xs uppercase tracking-widest opacity-80">{cat.count} Articles</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* Recent Posts & Sidebar */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">Recent Articles</h2>
            <div className="space-y-12">
              {recentBlogs.map((blog) => (
                <div key={blog.id} className="flex flex-col md:flex-row gap-8 group">
                  <div className="md:w-1/3 h-64 overflow-hidden rounded-xl">
                    <img 
                      src={blog.image} 
                      alt={blog.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="md:w-2/3 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-xs text-accent-pink font-bold uppercase tracking-widest mb-3">
                      <span>{blog.category}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-400">{blog.createdAt?.toDate ? blog.createdAt.toDate().toLocaleDateString() : 'Recent'}</span>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4 hover:text-accent-pink transition-colors">
                      <Link to={`/blog/${blog.id}`}>{blog.title}</Link>
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-3 mb-6">
                      {blog.content}
                    </p>
                    <Link to={`/blog/${blog.id}`} className="text-xs font-bold uppercase tracking-widest text-gray-900 flex items-center gap-2 hover:text-accent-pink transition-colors">
                      Read Full Article <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-pastel-pink p-8 rounded-2xl border border-accent-pink/20">
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Style Tip of the Day</h3>
              <p className="text-gray-600 text-sm italic leading-relaxed">
                "Fashion is what you're offered four times a year by designers. And style is what you choose." — Lauren Hutton. This season, try pairing traditional lawn prints with modern denim for a chic fusion look.
              </p>
            </div>
          </div>

          <aside className="space-y-12">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-6 border-b border-gray-50 pb-4">About the Editor</h3>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-pastel-pink p-1">
                  <img 
                    src={settings.profileImage} 
                    alt={settings.editorName} 
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h4 className="font-serif font-bold text-gray-900 mb-2">{settings.editorName}</h4>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Fashion Journalist</p>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {settings.editorBio}
                </p>
                <div className="flex justify-center gap-4 text-gray-400">
                  <a href={settings.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={18} className="hover:text-accent-pink cursor-pointer" /></a>
                  <a href={settings.facebook} target="_blank" rel="noopener noreferrer"><Facebook size={18} className="hover:text-accent-pink cursor-pointer" /></a>
                  <a href={settings.pinterest} target="_blank" rel="noopener noreferrer"><Twitter size={18} className="hover:text-accent-pink cursor-pointer" /></a>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 text-white p-8 rounded-2xl">
              <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-2">
                <Star size={20} className="text-accent-pink" /> Editor's Choice
              </h3>
              <div className="space-y-6">
                {blogs.slice(0, 3).map((blog) => (
                  <Link key={blog.id} to={`/blog/${blog.id}`} className="flex gap-4 group">
                    <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                      <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-bold group-hover:text-accent-pink transition-colors line-clamp-2">
                        {blog.title}
                      </h4>
                      <span className="text-[10px] uppercase tracking-widest text-gray-500">{blog.createdAt?.toDate ? blog.createdAt.toDate().toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};
