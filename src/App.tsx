import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Blog } from './pages/Blog';
import { BlogDetail } from './pages/BlogDetail';
import { Admin } from './pages/Admin';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { store } from './lib/store';

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view on every route change
    store.incrementPageView();
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <Router>
      <AnalyticsTracker />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
}
