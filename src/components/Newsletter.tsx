import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1500);
  };

  return (
    <div className="bg-gray-900 text-white p-8 md:p-12 rounded-3xl relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-pink/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-deep-pink/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="py-8"
            >
              <div className="w-20 h-20 bg-accent-pink rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-white" />
              </div>
              <h3 className="text-3xl font-serif font-bold mb-4">You're on the list!</h3>
              <p className="text-gray-400">
                Thank you for joining Elegance. Get ready for exclusive style guides and trend alerts in your inbox.
              </p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-8 text-accent-pink font-bold uppercase tracking-widest text-xs hover:underline"
              >
                Back to form
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight">
                Join the <span className="italic">Elegance</span> Inner Circle
              </h2>
              <p className="text-gray-400 mb-10 text-lg">
                Subscribe to receive weekly trend reports, early access to designer lawn launches, and curated style tips.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-grow bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent-pink backdrop-blur-sm transition-all"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-white text-gray-900 rounded-full px-8 py-4 font-bold uppercase tracking-widest text-xs hover:bg-accent-pink hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {status === 'loading' ? 'Joining...' : (
                    <>
                      Subscribe <Send size={14} />
                    </>
                  )}
                </button>
              </form>
              <p className="mt-6 text-[10px] text-gray-500 uppercase tracking-widest">
                No spam, just style. Unsubscribe anytime.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
