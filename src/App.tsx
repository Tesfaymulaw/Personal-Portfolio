import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import { Toaster } from 'sonner';

// Public Pages
import PublicHome from './pages/public/Home';
import PublicBlogs from './pages/public/Blogs';
import PublicProjects from './pages/public/Projects';
import PublicContact from './pages/public/Contact';
import PublicResume from './pages/public/Resume';

function App() {
  return (
    <Router>
      <Toaster position="top-right" theme="dark" />
      <Routes>
        
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<PublicHome />} />
          <Route path="blogs" element={<PublicBlogs />} />
          <Route path="projects" element={<PublicProjects />} />
          <Route path="contact" element={<PublicContact />} />
          <Route path="resume" element={<PublicResume />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </Router>
  );
}

export default App;