import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { store } from './lib/store';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Blog = lazy(() => import('./pages/Blog').then(module => ({ default: module.Blog })));
const BlogDetail = lazy(() => import('./pages/BlogDetail').then(module => ({ default: module.BlogDetail })));
const Admin = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));
const About = lazy(() => import('./pages/About').then(module => ({ default: module.About })));
const Contact = lazy(() => import('./pages/Contact').then(module => ({ default: module.Contact })));

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view on every route change
    store.incrementPageView();
  }, [location.pathname]);

  return null;
}

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-pink"></div>
  </div>
);

export default function App() {
  return (
    <Router>
      <AnalyticsTracker />
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}
