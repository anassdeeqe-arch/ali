import React, { useState } from 'react';
import { Share2, Copy, Check, Facebook, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ title, text, url, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        // If user cancels, we don't need to show the fallback
        if (err instanceof Error && err.name !== 'AbortError') {
          setIsOpen(true);
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    { name: 'Facebook', icon: Facebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'Twitter', icon: Twitter, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
  ];

  return (
    <div className={className}>
      <button 
        onClick={handleShare}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-pastel-pink text-accent-pink hover:bg-accent-pink hover:text-white transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
      >
        <Share2 size={16} /> Share
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20, x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, y: 20, x: '-50%' }}
              className="fixed top-1/2 left-1/2 -translate-y-1/2 z-[70] bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 w-[90%] max-w-sm"
            >
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">Share this with friends</h3>
              
              <div className="flex justify-center gap-6 mb-8">
                {shareLinks.map((link) => (
                  <a 
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-pastel-pink text-accent-pink flex items-center justify-center group-hover:bg-accent-pink group-hover:text-white transition-all">
                      <link.icon size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{link.name}</span>
                  </a>
                ))}
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  readOnly 
                  value={url}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs text-gray-500 pr-12 focus:outline-none"
                />
                <button 
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent-pink hover:bg-white rounded-lg transition-all"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full mt-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
