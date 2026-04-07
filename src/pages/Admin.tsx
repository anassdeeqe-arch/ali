import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, FileText, TrendingUp, BarChart3, LogOut, 
  Plus, Trash2, Edit2, Save, X, Eye, MousePointer2, CheckCircle, AlertCircle,
  Image as ImageIcon, ExternalLink, Calendar, User, Mail
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { store } from '../lib/store';
import { BlogPost, Analytics, WebsiteSettings } from '../types';
import { cn } from '../lib/utils';

export const Admin: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'blogs' | 'trending' | 'settings' | 'analytics'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('elegance_admin_dark_mode') === 'true');
  
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [showBlogPreview, setShowBlogPreview] = useState(false);
  
  const [newBlog, setNewBlog] = useState<Partial<BlogPost>>({ category: 'Summer' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = store.subscribeToAuthChanges(async (user) => {
      if (user) {
        const isAdmin = await store.verifyAdmin(user);
        if (isAdmin) {
          setIsLoggedIn(true);
        } else {
          await store.logout();
          setIsLoggedIn(false);
          showNotification('error', 'Access denied. Your email is not registered as an admin.');
        }
      } else {
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      const [blogsData, analyticsData, settingsData] = await Promise.all([
        store.getBlogs(),
        store.getAnalytics(),
        store.getSettings()
      ]);
      setBlogs(blogsData);
      setAnalytics(analyticsData);
      setSettings(settingsData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      showNotification('error', 'Failed to fetch dashboard data.');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('elegance_admin_dark_mode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGoogleLogin = async () => {
    try {
      await store.loginWithGoogle();
      showNotification('success', 'Logged in with Google!');
    } catch (error: any) {
      showNotification('error', error.message || 'Google login failed!');
    }
  };

  const handleLogout = async () => {
    try {
      await store.logout();
      showNotification('success', 'Logged out successfully!');
    } catch (error: any) {
      showNotification('error', error.message || 'Logout failed!');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      setIsSubmitting(true);
      try {
        await store.saveSettings(settings);
        showNotification('success', 'Website settings saved!');
      } catch (error: any) {
        showNotification('error', error.message || 'Failed to save settings.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBlog.title || newBlog.title.length < 5) {
      showNotification('error', 'Title must be at least 5 characters.');
      return;
    }
    
    if (!newBlog.content || newBlog.content.length < 10) {
      showNotification('error', 'Content must be at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    const blogData: Omit<BlogPost, 'id' | 'createdAt'> = {
      title: newBlog.title,
      content: newBlog.content,
      image: newBlog.image || 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&q=80&w=800',
      category: newBlog.category || 'Summer',
      views: 0,
      productLink: newBlog.productLink
    };
    try {
      await store.addBlog(blogData);
      await fetchData();
      setNewBlog({ category: 'Summer' });
      showNotification('success', 'Blog post published!');
    } catch (error: any) {
      console.error(error);
      showNotification('error', error.message || 'Failed to publish blog post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    
    if (!editingBlog.title || editingBlog.title.length < 5) {
      showNotification('error', 'Title must be at least 5 characters.');
      return;
    }
    
    if (!editingBlog.content || editingBlog.content.length < 10) {
      showNotification('error', 'Content must be at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await store.updateBlog(editingBlog.id, {
        title: editingBlog.title,
        content: editingBlog.content,
        image: editingBlog.image,
        category: editingBlog.category,
        productLink: editingBlog.productLink
      });
      await fetchData();
      setEditingBlog(null);
      showNotification('success', 'Blog post updated!');
    } catch (error: any) {
      console.error(error);
      showNotification('error', error.message || 'Failed to update blog post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState<{ type: 'blog', id: string } | null>(null);

  const handleDeleteBlog = async (id: string) => {
    if (isDeleting?.id === id) {
      try {
        await store.deleteBlog(id);
        await fetchData();
        showNotification('success', 'Blog post deleted!');
        setIsDeleting(null);
      } catch (error) {
        showNotification('error', 'Failed to delete blog post.');
      }
    } else {
      setIsDeleting({ type: 'blog', id });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'blog', isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEditing && editingBlog) {
          setEditingBlog({ ...editingBlog, image: base64String });
        } else {
          setNewBlog({ ...newBlog, image: base64String });
        }
        setIsUploadingImage(false);
      };
      reader.onerror = () => {
        showNotification('error', 'Failed to read image file.');
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    if (editingBlog) {
      const original = blogs.find(b => b.id === editingBlog.id);
      setEditingBlog({ ...editingBlog, image: original?.image || '' });
    } else {
      setNewBlog({ ...newBlog, image: '' });
    }
    showNotification('success', 'Image reset!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pastel-pink">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-pink"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-pastel-pink p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[2rem] shadow-2xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-accent-pink/10 rounded-full flex items-center justify-center mx-auto mb-8 text-accent-pink">
            <LayoutDashboard size={40} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-500 text-sm mb-8 uppercase tracking-widest">Restricted Access</p>
          
          <div className="space-y-6">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-gray-100 text-gray-900 rounded-xl py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Login with Google
            </button>
          </div>
        </motion.div>
        
        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={cn(
                "fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50",
                notification.type === 'success' ? "bg-green-500 text-white" : "bg-red-500 text-white"
              )}
            >
              {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span className="text-sm font-bold">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex flex-col md:flex-row transition-colors duration-300", isDarkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900")}>
      {/* Sidebar */}
      <aside className={cn("w-full md:w-72 border-r p-8 flex flex-col transition-colors", isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100")}>
        <div className="mb-12 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif font-bold">Admin<span className="text-accent-pink">.</span></h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Fashion Dashboard</p>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn("p-2 rounded-xl transition-colors", isDarkMode ? "bg-gray-800 text-yellow-400 hover:bg-gray-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}
          >
            {isDarkMode ? <Eye size={18} /> : <TrendingUp size={18} />}
          </button>
        </div>

        <motion.nav 
          className="space-y-2 flex-grow"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
              }
            }
          }}
        >
          {[
            { id: 'dashboard', label: 'Overview', icon: BarChart3 },
            { id: 'blogs', label: 'Manage Blogs', icon: FileText },
            { id: 'trending', label: 'Trending Now', icon: TrendingUp },
            { id: 'settings', label: 'Website Settings', icon: Save },
            { id: 'analytics', label: 'Analytics Panel', icon: TrendingUp },
          ].map((item) => (
            <motion.button
              key={item.id}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all",
                activeTab === item.id 
                ? 'bg-gray-900 text-white shadow-xl scale-105' 
                : isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-accent-pink' : 'text-gray-500 hover:bg-pastel-pink hover:text-accent-pink'
              )}
            >
              <item.icon size={20} />
              {item.label}
            </motion.button>
          ))}
        </motion.nav>

        <button 
          onClick={handleLogout}
          className="mt-12 flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Content */}
      <main className="flex-grow p-8 md:p-12 overflow-y-auto max-h-screen relative">
        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={cn(
                "fixed top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[100]",
                notification.type === 'success' ? "bg-green-500 text-white" : "bg-red-500 text-white"
              )}
            >
              {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span className="text-sm font-bold">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-12"
            >
              <div className="flex justify-between items-center">
                <h1 className="text-4xl font-serif font-bold text-gray-900">Analytics Overview</h1>
                <div className="text-xs text-gray-400 uppercase tracking-widest font-bold bg-white px-4 py-2 rounded-full border border-gray-100">
                  Last Updated: Just Now
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                    <Eye size={24} />
                  </div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Total Page Views</p>
                  <h3 className="text-4xl font-serif font-bold text-gray-900">{(analytics?.totalPageViews || 0).toLocaleString()}</h3>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <MousePointer2 size={24} />
                  </div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Total Affiliate Clicks</p>
                  <h3 className="text-4xl font-serif font-bold text-gray-900">{(analytics?.totalClicks || 0).toLocaleString()}</h3>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-pink-50 text-accent-pink rounded-2xl flex items-center justify-center mb-6">
                    <FileText size={24} />
                  </div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Total Blog Posts</p>
                  <h3 className="text-4xl font-serif font-bold text-gray-900">{blogs.length}</h3>
                </div>
              </div>

              {/* Charts */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-8">Traffic & Engagement</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.dailyStats}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f9a8d4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f9a8d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="views" stroke="#f9a8d4" fillOpacity={1} fill="url(#colorViews)" strokeWidth={3} />
                      <Area type="monotone" dataKey="clicks" stroke="#db2777" fillOpacity={0} strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-8 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent-pink"></div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Page Views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-deep-pink"></div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Affiliate Clicks</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-8">Top Performing Posts</h3>
                  <div className="space-y-6">
                    {blogs.sort((a, b) => b.views - a.views).slice(0, 4).map((blog, idx) => (
                      <div key={blog.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-serif font-bold text-gray-100 group-hover:text-accent-pink transition-colors">0{idx + 1}</span>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{blog.title}</h4>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{blog.category}</p>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-gray-900">{blog.views} Views</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'blogs' && (
            <motion.div
              key="blogs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-12"
            >
              <div className="flex justify-between items-center">
                <h1 className="text-4xl font-serif font-bold text-gray-900">Manage Blog Posts</h1>
                <button 
                  onClick={() => {
                    setNewBlog({ category: 'Summer' });
                    setEditingBlog(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-xs uppercase tracking-widest font-bold hover:bg-accent-pink transition-all flex items-center gap-2"
                >
                  <Plus size={16} /> New Article
                </button>
              </div>

              {/* Add/Edit Blog Form */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-accent-pink"></div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-8 flex items-center gap-2">
                  <Plus className="text-accent-pink" size={20} />
                  {editingBlog ? 'Edit Blog Post' : 'Create New Post'}
                </h3>
                <form onSubmit={editingBlog ? handleUpdateBlog : handleAddBlog} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-1 space-y-6">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Featured Image</label>
                      <div className="aspect-video bg-gray-50 rounded-2xl border border-dashed border-gray-200 overflow-hidden relative group">
                        {isUploadingImage ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-pink"></div>
                            <p className="text-[10px] uppercase font-bold mt-2 text-accent-pink">Uploading...</p>
                          </div>
                        ) : null}
                        {(editingBlog?.image || newBlog.image) ? (
                          <>
                            <img 
                              src={editingBlog?.image || newBlog.image} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                              <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-accent-pink hover:text-white transition-colors">
                                Change Image
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => handleImageUpload(e, 'blog', !!editingBlog)} 
                                />
                              </label>
                              <button 
                                type="button"
                                onClick={handleClearImage}
                                className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-colors"
                              >
                                Reset Image
                              </button>
                            </div>
                          </>
                        ) : (
                          <label className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 cursor-pointer hover:bg-gray-100 transition-colors">
                            <ImageIcon size={48} />
                            <p className="text-[10px] uppercase font-bold mt-2">Upload Image</p>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'blog', !!editingBlog)} 
                            />
                          </label>
                        )}
                      </div>
                      <div className="mt-4 space-y-2">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-gray-400 block">Or Paste URL</label>
                        <input 
                          type="url" 
                          required
                          value={editingBlog ? editingBlog.image : (newBlog.image || '')}
                          onChange={(e) => editingBlog 
                            ? setEditingBlog({...editingBlog, image: e.target.value})
                            : setNewBlog({...newBlog, image: e.target.value})
                          }
                          placeholder="https://images.unsplash.com/..." 
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-accent-pink"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Title</label>
                        <input 
                          type="text" 
                          required
                          minLength={5}
                          maxLength={100}
                          value={editingBlog ? editingBlog.title : (newBlog.title || '')}
                          onChange={(e) => editingBlog
                            ? setEditingBlog({...editingBlog, title: e.target.value})
                            : setNewBlog({...newBlog, title: e.target.value})
                          }
                          placeholder="Enter blog title" 
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-accent-pink"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Category</label>
                        <select 
                          required
                          value={editingBlog ? editingBlog.category : newBlog.category}
                          onChange={(e) => editingBlog
                            ? setEditingBlog({...editingBlog, category: e.target.value as any})
                            : setNewBlog({...newBlog, category: e.target.value as any})
                          }
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-accent-pink"
                        >
                          <option value="Summer">Summer</option>
                          <option value="Wedding">Wedding</option>
                          <option value="Jewelry">Jewelry</option>
                          <option value="Trending">Trending</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Product Link (Optional)</label>
                        <input 
                          type="url" 
                          value={editingBlog ? (editingBlog.productLink || '') : (newBlog.productLink || '')}
                          onChange={(e) => editingBlog
                            ? setEditingBlog({...editingBlog, productLink: e.target.value})
                            : setNewBlog({...newBlog, productLink: e.target.value})
                          }
                          placeholder="https://..." 
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-accent-pink"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Content</label>
                      <textarea 
                        required
                        minLength={10}
                        maxLength={10000}
                        value={editingBlog ? editingBlog.content : (newBlog.content || '')}
                        onChange={(e) => editingBlog
                          ? setEditingBlog({...editingBlog, content: e.target.value})
                          : setNewBlog({...newBlog, content: e.target.value})
                        }
                        placeholder="Write article content..." 
                        rows={8}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-accent-pink resize-none"
                      ></textarea>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        disabled={isSubmitting}
                        className={cn(
                          "flex-grow bg-gray-900 text-white rounded-xl py-4 font-bold uppercase tracking-widest text-sm hover:bg-accent-pink transition-all flex items-center justify-center gap-2",
                          isSubmitting && "opacity-70 cursor-not-allowed"
                        )}
                      >
                        {isSubmitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        ) : (
                          <Save size={18} />
                        )}
                        {isSubmitting ? 'Processing...' : (editingBlog ? 'Update Post' : 'Publish Post')}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowBlogPreview(!showBlogPreview)}
                        className="bg-pastel-pink text-accent-pink px-8 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-accent-pink hover:text-white transition-all flex items-center gap-2"
                      >
                        <Eye size={18} /> {showBlogPreview ? 'Hide Preview' : 'Live Preview'}
                      </button>
                      {editingBlog && (
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingBlog(null);
                            setShowBlogPreview(false);
                          }}
                          className="bg-gray-100 text-gray-500 px-8 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </form>

                {/* Live Preview */}
                <AnimatePresence>
                  {showBlogPreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-12 pt-12 border-t border-gray-100"
                    >
                      <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 text-center">Live Preview</h4>
                      <div className="max-w-2xl mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
                        <div className="h-64 overflow-hidden">
                          <img 
                            src={editingBlog?.image || newBlog.image || 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&q=80&w=800'} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-8">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-accent-pink mb-4">
                            {editingBlog?.category || newBlog.category} • {new Date().toLocaleDateString()}
                          </div>
                          <h3 className="text-3xl font-serif font-bold text-gray-900 mb-6">
                            {editingBlog?.title || newBlog.title || 'Your Article Title'}
                          </h3>
                          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {editingBlog?.content || newBlog.content || 'Your article content will appear here...'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Blog List Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-grow bg-gray-200"></div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 whitespace-nowrap">Existing Blog Posts</h3>
                  <div className="h-px flex-grow bg-gray-200"></div>
                </div>
                
                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <tr>
                      <th className="px-8 py-6">Article</th>
                      <th className="px-8 py-6">Category</th>
                      <th className="px-8 py-6">Date</th>
                      <th className="px-8 py-6">Views</th>
                      <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {blogs.map((blog) => (
                      <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={blog.image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 line-clamp-1">{blog.title}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 rounded-full bg-pastel-pink text-accent-pink text-[10px] font-bold uppercase tracking-widest">
                            {blog.category}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-500">{blog.date}</td>
                        <td className="px-8 py-6 text-sm font-bold text-gray-900">{blog.views}</td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-4">
                            <button 
                              onClick={() => {
                                setEditingBlog(blog);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-accent-pink transition-colors"
                            >
                              <Edit2 size={14} /> Edit/Rename
                            </button>
                            <button 
                              onClick={() => handleDeleteBlog(blog.id)}
                              className={cn("flex items-center gap-1 text-xs font-bold transition-colors", isDeleting?.id === blog.id ? "text-red-600" : "text-gray-400 hover:text-red-500")}
                            >
                              {isDeleting?.id === blog.id ? <AlertCircle size={14} /> : <Trash2 size={14} />} Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

          {activeTab === 'trending' && (
            <motion.div
              key="trending"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-12"
            >
              <h1 className="text-4xl font-serif font-bold text-gray-900">Trending Section</h1>
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <p className="text-gray-500 mb-8">
                  Select which articles should appear in the "Trending Now" slider on the home page.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {blogs.map((blog) => (
                    <div key={blog.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden">
                          <img src={blog.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{blog.title}</h4>
                      </div>
                      <button 
                        onClick={async () => {
                          try {
                            const newCategory = blog.category === 'Trending' ? 'Summer' : 'Trending';
                            await store.updateBlog(blog.id, { category: newCategory });
                            await fetchData();
                            showNotification('success', 'Trending status updated!');
                          } catch (error) {
                            showNotification('error', 'Failed to update trending status.');
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                          blog.category === 'Trending' 
                          ? 'bg-accent-pink text-white shadow-lg' 
                          : 'bg-white text-gray-400 border border-gray-200'
                        }`}
                      >
                        {blog.category === 'Trending' ? 'Trending' : 'Set Trending'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-12"
            >
              <h1 className="text-4xl font-serif font-bold">Website Settings</h1>
              
              {settings && (
                <form onSubmit={handleSaveSettings} className="space-y-12">
                  {/* Branding */}
                  <div className={cn("p-10 rounded-[3rem] shadow-sm border transition-colors", isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100")}>
                    <h3 className="text-xl font-serif font-bold mb-8 flex items-center gap-2">
                      <Save className="text-accent-pink" size={20} /> Branding & Identity
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Website Name</label>
                        <input 
                          type="text" 
                          value={settings.editorName}
                          onChange={(e) => setSettings({...settings, editorName: e.target.value})}
                          className={cn("w-full border rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-accent-pink transition-colors", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100")}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Logo URL (Optional)</label>
                        <input 
                          type="text" 
                          value={settings.websiteLogo}
                          onChange={(e) => setSettings({...settings, websiteLogo: e.target.value})}
                          className={cn("w-full border rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-accent-pink transition-colors", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100")}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Footer Description</label>
                        <textarea 
                          value={settings.footerText}
                          onChange={(e) => setSettings({...settings, footerText: e.target.value})}
                          rows={3}
                          className={cn("w-full border rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-accent-pink resize-none transition-colors", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100")}
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Editor Info */}
                  <div className={cn("p-10 rounded-[3rem] shadow-sm border transition-colors", isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100")}>
                    <h3 className="text-xl font-serif font-bold mb-8 flex items-center gap-2">
                      <User className="text-accent-pink" size={20} /> About the Editor
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Editor Name</label>
                        <input 
                          type="text" 
                          value={settings.editorName}
                          onChange={(e) => setSettings({...settings, editorName: e.target.value})}
                          className={cn("w-full border rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-accent-pink transition-colors", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100")}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Profile Image URL</label>
                        <input 
                          type="text" 
                          value={settings.profileImage}
                          onChange={(e) => setSettings({...settings, profileImage: e.target.value})}
                          className={cn("w-full border rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-accent-pink transition-colors", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100")}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Short Bio</label>
                        <textarea 
                          value={settings.editorBio}
                          onChange={(e) => setSettings({...settings, editorBio: e.target.value})}
                          rows={3}
                          className={cn("w-full border rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-accent-pink resize-none transition-colors", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100")}
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Social & Contact */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className={cn("p-10 rounded-[3rem] shadow-sm border transition-colors", isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100")}>
                      <h3 className="text-xl font-serif font-bold mb-8 flex items-center gap-2">
                        <TrendingUp className="text-accent-pink" size={20} /> Social Links
                      </h3>
                      <div className="space-y-6">
                        {['instagram', 'facebook', 'pinterest', 'youtube'].map((platform) => (
                          <div key={platform}>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">{platform} URL</label>
                            <input 
                              type="text" 
                              value={(settings as any)[platform]}
                              onChange={(e) => setSettings({...settings, [platform]: e.target.value})}
                              className={cn("w-full border rounded-xl px-6 py-3 text-sm focus:outline-none focus:border-accent-pink transition-colors", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100")}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={cn("p-10 rounded-[3rem] shadow-sm border transition-colors", isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100")}>
                      <h3 className="text-xl font-serif font-bold mb-8 flex items-center gap-2">
                        <Mail className="text-accent-pink" size={20} /> Contact Info
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Email Address</label>
                          <input 
                            type="email" 
                            value={settings.contact?.email || ''}
                            onChange={(e) => setSettings({...settings, contact: { phone: settings.contact?.phone || '', email: e.target.value}})}
                            className={cn("w-full border rounded-xl px-6 py-3 text-sm focus:outline-none focus:border-accent-pink transition-colors", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100")}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Phone Number</label>
                          <input 
                            type="text" 
                            value={settings.contact?.phone || ''}
                            onChange={(e) => setSettings({...settings, contact: { email: settings.contact?.email || '', phone: e.target.value}})}
                            className={cn("w-full border rounded-xl px-6 py-3 text-sm focus:outline-none focus:border-accent-pink transition-colors", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className={cn(
                      "w-full bg-gray-900 text-white rounded-2xl py-6 font-bold uppercase tracking-widest text-sm hover:bg-accent-pink transition-all shadow-2xl flex items-center justify-center gap-3",
                      isSubmitting && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <Save size={20} />
                    )}
                    {isSubmitting ? 'Saving Settings...' : 'Save All Website Settings'}
                  </button>
                </form>
              )}
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-12"
            >
              <h1 className="text-4xl font-serif font-bold">Detailed Analytics</h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={cn("lg:col-span-2 p-10 rounded-[3rem] shadow-sm border transition-colors", isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100")}>
                  <h3 className="text-2xl font-serif font-bold mb-8">Performance Trends</h3>
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics?.dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1f2937" : "#f3f4f6"} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: isDarkMode ? '#111827' : '#fff', color: isDarkMode ? '#fff' : '#000' }} />
                        <Line type="monotone" dataKey="views" stroke="#f9a8d4" strokeWidth={4} dot={{ r: 4, fill: '#f9a8d4', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="clicks" stroke="#db2777" strokeWidth={4} dot={{ r: 4, fill: '#db2777', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-xl">
                    <h3 className="text-xl font-serif font-bold mb-6">Conversion Rate</h3>
                    <div className="text-5xl font-serif font-bold text-accent-pink mb-2">
                      {analytics && analytics.totalPageViews ? ((analytics.totalClicks || 0) / analytics.totalPageViews * 100).toFixed(1) : 0}%
                    </div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Clicks per View</p>
                  </div>

                  <div className={cn("p-10 rounded-[3rem] shadow-sm border transition-colors", isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100")}>
                    <h3 className="text-xl font-serif font-bold mb-6">Device Split</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Mobile', value: 65, color: 'bg-accent-pink' },
                        { label: 'Desktop', value: 28, color: 'bg-gray-900' },
                        { label: 'Tablet', value: 7, color: 'bg-gray-200' },
                      ].map((device) => (
                        <div key={device.label}>
                          <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                            <span>{device.label}</span>
                            <span>{device.value}%</span>
                          </div>
                          <div className={cn("h-2 rounded-full overflow-hidden", isDarkMode ? "bg-gray-800" : "bg-gray-50")}>
                            <div className={cn("h-full rounded-full", device.color)} style={{ width: `${device.value}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
