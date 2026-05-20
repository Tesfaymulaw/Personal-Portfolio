import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Briefcase, Contact, FileText, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const GithubIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const LinkedinIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const TwitterIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const InstagramIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const YouTubeIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"></path>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
  </svg>
);

const TikTokIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    <circle cx="9" cy="16" r="4" />
  </svg>
);

const platformIcons: Record<string, any> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon
};

const PublicLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchContact = async () => {
      const { data } = await supabase.from('contact').select('*').limit(1).maybeSingle();
      if (data) setContactInfo(data);
    };
    fetchContact();
  }, []);

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/projects', icon: Briefcase, label: 'Projects' },
  { to: '/blogs', icon: BookOpen, label: 'Blogs' },
  { to: '/resume', icon: FileText, label: 'Resume' },
  { to: '/contact', icon: Contact, label: 'Contact' },
];

  const activeLinkStyle = "flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-700 text-green-500 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/5 cursor-pointer";
  const inactiveLinkStyle = "flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/30 hover:text-slate-200 rounded-xl transition-all duration-200 group cursor-pointer";

  const handleSocialClick = (url: string, platform: string) => {
    if (!url) return;
    let fullUrl = url;
    if (!url.startsWith('http')) {
      switch(platform) {
        case 'instagram': fullUrl = `https://instagram.com/${url.replace('@', '')}`; break;
        case 'linkedin': fullUrl = `https://linkedin.com/in/${url}`; break;
        case 'tiktok': fullUrl = `https://tiktok.com/@${url.replace('@', '')}`; break;
        case 'facebook': fullUrl = `https://facebook.com/${url}`; break;
        case 'github': fullUrl = `https://github.com/${url}`; break;
        case 'twitter': fullUrl = `https://twitter.com/${url}`; break;
        case 'youtube': fullUrl = `https://youtube.com/${url.startsWith('@') ? url : '@' + url}`; break;
      }
    }
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden">
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden cursor-pointer"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full lg:hidden"
            >
              <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
                <span className="text-lg font-bold text-green-500">&lt;/TM&gt;port</span>
                <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto no-scrollbar">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => (isActive ? activeLinkStyle : inactiveLinkStyle)}
                  >
                    <item.icon size={18} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <header className="sticky top-0 h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md shrink-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Mobile Menu Button - Left */}
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Menu size={24} />
          </button>

          {/* Desktop Logo - Left */}
          <NavLink to="/" className="hidden lg:flex items-center text-xl font-bold text-green-500">
             <span>&lt;/TM&gt;port</span>
          </NavLink>

          {/* Desktop Navigation - Center/Right */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink 
                key={item.to} 
                to={item.to} 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors hover:text-green-500 ${isActive ? 'text-green-500' : 'text-slate-400'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Logo/Redirect - Right (in place of Logout) */}
          <div className="lg:hidden flex-1 flex justify-end">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-green-500 transition-all duration-200 group"
            >
              <span className="text-sm font-bold tracking-wider text-green-500">&lt;/TM&gt;port</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>

        <footer className="border-t border-slate-800 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              {/* Logo Section */}
              <div className="flex items-center">
                <Link to="/" className="text-2xl font-bold text-green-500">
                  &lt;/TM&gt;port
                </Link>
              </div>

              {/* Horizontal Navigation */}
              <nav className="flex items-center gap-6">
                {navItems.map((item) => (
                  <Link 
                    key={item.to} 
                    to={item.to} 
                    className="text-slate-400 hover:text-green-500 transition-colors text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Horizontal Social Links */}
              <div className="flex items-center gap-4">
                {contactInfo && Object.entries(platformIcons).map(([key, Icon]) => {
                  const url = contactInfo[key];
                  if (!url) return null;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSocialClick(url, key)}
                      className="text-slate-400 hover:text-white transition-all duration-300 group"
                      title={key.charAt(0).toUpperCase() + key.slice(1)}
                    >
                      <Icon size={20} className="group-hover:scale-110 transition-transform" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs">
              <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
              <div className="flex items-center gap-6">
                <Link to="#" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
                <Link to="#" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default PublicLayout;