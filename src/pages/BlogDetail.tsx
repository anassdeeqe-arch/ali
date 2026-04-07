import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Eye, Heart, MessageCircle } from 'lucide-react';
import { store } from '../lib/store';
import { BlogPost, WebsiteSettings } from '../types';
import { ShareButton } from '../components/ShareButton';
import { trackPostView } from '../lib/db';

export const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [blogsData, settingsData] = await Promise.all([
          store.getBlogs(),
          store.getSettings()
        ]);
        
        const found = blogsData.find(b => b.id === id);
        if (found) {
          setBlog(found);
          setSettings(settingsData);
          setRelatedBlogs(blogsData.filter(b => b.id !== id).slice(0, 3));
          
          // Increment views in Firestore
          await trackPostView(id);
        } else {
          navigate('/blog');
        }
      } catch (error) {
        console.error("Error fetching blog detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading || !blog || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pastel-pink">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-pink"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-accent-pink transition-colors mb-12">
        <ArrowLeft size={14} /> Back to Blog
      </Link>

      <article className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 text-[10px] text-accent-pink font-bold uppercase tracking-widest mb-6">
            <span className="bg-pastel-pink px-4 py-1 rounded-full">{blog.category}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-400 flex items-center gap-1"><Calendar size={12} /> {blog.createdAt?.toDate ? blog.createdAt.toDate().toLocaleDateString() : 'Recent'}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-400 flex items-center gap-1"><Eye size={12} /> {blog.views} Views</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-8 leading-tight">
            {blog.title}
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-pastel-pink">
              <img src={settings.profileImage} alt={settings.editorName} className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-gray-900">{settings.editorName}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Fashion Editor</p>
            </div>
          </div>
        </header>

        <div className="relative h-[50vh] md:h-[70vh] rounded-[3rem] overflow-hidden mb-16 shadow-2xl">
          <img 
            src={blog.image} 
            alt={blog.title} 
            loading="lazy"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Actions */}
          <aside className="lg:col-span-1 flex lg:flex-col gap-6 items-center lg:pt-8 sticky top-24 h-fit">
            <button className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-accent-pink hover:border-accent-pink transition-all shadow-sm">
              <Heart size={20} />
            </button>
            <button className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-accent-pink hover:border-accent-pink transition-all shadow-sm">
              <MessageCircle size={20} />
            </button>
            <ShareButton 
              title={blog.title}
              text={`Check out this amazing fashion article: ${blog.title}`}
              url={window.location.href}
              className="lg:mt-4"
            />
          </aside>

          {/* Content */}
          <div className="lg:col-span-11 prose prose-lg max-w-none">
            <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-sm border border-gray-100 mb-12">
              <div 
                className="text-xl text-gray-600 leading-relaxed first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-accent-pink"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
              {blog.productLink && (
                <div className="mt-8">
                  <a 
                    href={blog.productLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-accent-pink text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-900 transition-all"
                  >
                    View Product
                  </a>
                </div>
              )}
            </div>

            {/* Author Box */}
            <div className="bg-pastel-pink p-12 rounded-[3rem] flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
                <img src={settings.profileImage} alt={settings.editorName} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-xl font-serif font-bold text-gray-900 mb-2">Written by {settings.editorName}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {settings.editorBio}
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <section className="mt-24">
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-12 text-center">You Might Also Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {relatedBlogs.map((related) => (
            <Link key={related.id} to={`/blog/${related.id}`} className="group">
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col hover:shadow-xl transition-all duration-500">
                <div className="relative h-48 overflow-hidden">
                  <img src={related.image} alt={related.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-serif font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-accent-pink transition-colors">
                    {related.title}
                  </h3>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{related.createdAt?.toDate ? related.createdAt.toDate().toLocaleDateString() : 'Recent'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
