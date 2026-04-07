import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, Eye, ArrowRight } from 'lucide-react';
import { store } from '../lib/store';
import { stripHtml } from '../lib/utils';
import { Newsletter } from '../components/Newsletter';
import { BlogPost } from '../types';

export const Blog: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('cat');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(categoryFilter || 'All');
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  const categories = ['All', 'Summer', 'Wedding', 'Jewelry', 'Trending'];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogsData = await store.getBlogs();
        setAllBlogs(blogsData);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filteredBlogs = allBlogs.filter(blog => {
    const matchesCategory = activeCategory === 'All' || blog.category === activeCategory;
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         blog.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    if (categoryFilter) setActiveCategory(categoryFilter);
  }, [categoryFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pastel-pink">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-pink"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6">Fashion Blog</h1>
        <p className="text-gray-600 text-lg">
          Stay ahead of the curve with our expert fashion advice, trend reports, and style guides.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12 border-b border-gray-100 pb-8">
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                activeCategory === cat 
                ? 'bg-gray-900 text-white shadow-lg scale-105' 
                : 'bg-white text-gray-500 hover:bg-pastel-pink hover:text-accent-pink border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Search articles..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-full px-12 py-3 text-sm focus:outline-none focus:border-accent-pink shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        <AnimatePresence mode="popLayout">
          {filteredBlogs.map((blog, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              key={blog.id}
              className="group"
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col hover:shadow-xl transition-all duration-500">
                <div className="relative h-72 overflow-hidden">
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent-pink shadow-sm">
                    {blog.category}
                  </div>
                </div>
                
                <div className="p-8 flex-grow flex flex-col">
                  <div className="flex items-center gap-4 text-[10px] text-gray-400 mb-4 uppercase tracking-widest font-bold">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {blog.createdAt?.toDate ? blog.createdAt.toDate().toLocaleDateString() : 'Recent'}</span>
                    <span className="flex items-center gap-1"><Eye size={12} /> {blog.views} Views</span>
                  </div>
                  
                  <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 line-clamp-2 hover:text-accent-pink transition-colors leading-snug">
                    <Link to={`/blog/${blog.id}`}>{blog.title}</Link>
                  </h2>
                  
                  <p className="text-gray-500 text-sm line-clamp-3 mb-8 flex-grow leading-relaxed">
                    {stripHtml(blog.content)}
                  </p>
                  
                  <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                    <Link to={`/blog/${blog.id}`} className="text-xs font-bold uppercase tracking-widest text-gray-900 hover:text-accent-pink transition-colors flex items-center gap-2">
                      Read More <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredBlogs.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Search size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-500">Try adjusting your search or category filters.</p>
          <button 
            onClick={() => {setActiveCategory('All'); setSearchTerm('');}}
            className="mt-6 text-accent-pink font-bold uppercase tracking-widest text-xs hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

    </div>
  );
};
