import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  User, 
  Heart, 
  MessageCircle, 
  Link2,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { supabase, copyToClipboard, Blog, getAnonymousId } from '../../lib/supabase';
import MediaGallery from '../../components/common/MediaGallery';
import Comments from '../../components/common/Comments';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

interface PublicBlogsProps {
  isHomePage?: boolean;
}

const PublicBlogs = ({ isHomePage = false }: PublicBlogsProps) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  const fetchBlogs = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const { data, error } = await supabase
        .from('blogs')
        .select('*, author:profile!blogs_user_id_fkey(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);

      const { data: { session } } = await supabase.auth.getSession();
      const effectiveUserId = session?.user?.id || getAnonymousId();
      
      const { data: likes } = await supabase
        .from('blog_likes')
        .select('blog_id')
        .eq('user_id', effectiveUserId);
      
      if (likes) {
        const likesMap: Record<string, boolean> = {};
        likes.forEach(l => likesMap[l.blog_id] = true);
        setUserLikes(likesMap);
      }
    } catch (err: any) {
      console.error('Error fetching blogs:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setCurrentUserId(session.user.id);
    };
    fetchSession();
    fetchBlogs();
  }, [fetchBlogs]);

  const handleShare = async (blogId: string) => {
    try {
      const fullUrl = `${window.location.origin}/portfolio/blogs#blog-${blogId}`;
      const success = await copyToClipboard(fullUrl);
      if (success) toast.success('Blog link copied to clipboard');
    } catch (err) { toast.error('Failed to copy blog link'); }
  };

  const handleLike = async (blogId: string) => {
    const effectiveUserId = currentUserId || getAnonymousId();
    const isLiked = userLikes[blogId];
    
    try {
      if (isLiked) {
        await supabase.from('blog_likes').delete().match({ blog_id: blogId, user_id: effectiveUserId });
        setUserLikes(prev => ({ ...prev, [blogId]: false }));
      } else {
        await supabase.from('blog_likes').insert({ blog_id: blogId, user_id: effectiveUserId });
        setUserLikes(prev => ({ ...prev, [blogId]: true }));

        // 🔔 Insert notification for like
        const blog = blogs.find(b => b.id === blogId);
        if (blog) {
          await supabase.from('notifications').insert({
            type: 'like',
            title: 'Blog liked',
            description: `"${blog.title}"`,
            entity_type: 'blog',
            entity_id: blogId,
            is_read: false
          });
        }
      }
      fetchBlogs(false);
    } catch (err) {
      console.error('Like error:', err);
      toast.error('Failed to update like'); 
    }
  };

  const toggleComments = (blogId: string) => setExpandedComments(prev => ({ ...prev, [blogId]: !prev[blogId] }));
  const toggleDescription = (blogId: string) => setExpandedDescriptions(prev => ({ ...prev, [blogId]: !prev[blogId] }));
  const formatPostDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (blog.category && blog.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const displayBlogs = isHomePage ? filteredBlogs.slice(0, 3) : filteredBlogs;

  return (
    <div className={`${isHomePage ? 'py-0' : 'bg-slate-900 py-10'} w-full px-0`}>
      <div className="max-w-6xl mx-auto px-0">
        <div className="w-full max-w-md mx-auto md:max-w-none px-0 sm:px-0">
          {/* Desktop Header Grid */}
          <div className="hidden lg:grid grid-cols-3 gap-8 mb-12 items-end">
            <div className="col-span-2">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold text-white mb-2"
              >
                Latest <span className="text-green-500">Blogs</span>
              </motion.h1>
              <p className="text-slate-400">Insights, tutorials, and technical articles from our team.</p>
            </div>
            <div className="col-start-3">
              {isHomePage ? (
                <Link to="/portfolio/blogs" className="block w-full">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 transition-all shadow-lg active:scale-95 group">
                    Read More Blogs
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-500 transition-colors" size={20} />
                  <Input
                    type="text"
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800/50 border-slate-700 focus:border-green-500 text-white pl-12 h-12 rounded-xl"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Mobile/Tablet Header */}
          <div className="lg:hidden mb-12 space-y-6 w-full max-w-md mx-auto md:max-w-none px-0">
            <div className="text-center px-0">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-white"
              >
                Latest <span className="text-green-500">Blogs</span>
              </motion.h1>
            </div>
            {isHomePage ? (
              <div className="flex justify-center px-0">
                <Link to="/portfolio/blogs" className="w-full">
                  <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 transition-all shadow-lg active:scale-95 group w-full">
                    Read More Blogs
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="relative group max-w-md mx-auto md:max-w-none px-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-500 transition-colors" size={20} />
                <Input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800/50 border-slate-700 focus:border-green-500 text-white pl-12 h-12 rounded-xl"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 w-full items-start">
              {[1,2,3].map(i => (
                <div key={i} className="h-[400px] w-full bg-slate-800 animate-pulse rounded-2xl border border-slate-700 max-w-md mx-auto md:max-w-none"/>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 w-full items-stretch px-0">
              <AnimatePresence mode="popLayout">
                {displayBlogs.map((blog, i) => {
                  const media = blog.media_urls?.filter(Boolean) || [];
                  const authorName = blog.author ? `${blog.author.first_name} ${blog.author.last_name}` : 'Portfolio Admin';
                  const isExpanded = expandedDescriptions[blog.id];
                  const shouldShowToggle = blog.description && blog.description.length > 150;

                  return (
                    <motion.div
                      key={blog.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col group hover:border-slate-600 transition-colors w-full shadow-2xl relative h-full max-w-md mx-auto md:max-w-none"
                    >
                      <div className="flex justify-between mb-4">
                        <div className="flex gap-3 items-center">
                          {blog.author?.profile_picture ? (
                            <img src={blog.author.profile_picture} alt={authorName} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center"><User size={18} className="text-slate-300"/></div>
                          )}
                          <div>
                            <p className="text-white text-sm font-bold">{authorName}</p>
                            <p className="text-slate-500 text-xs">{formatPostDate(blog.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-bold group-hover:text-green-500 transition-colors">{blog.title}</h3>
                        {blog.category && <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded uppercase tracking-wider">{blog.category}</span>}
                      </div>

                      <div className="mb-3">
                        <p className={`text-slate-400 text-sm ${isExpanded ? '' : 'line-clamp-3'}`}>
                          {blog.description}
                        </p>
                        {shouldShowToggle && (
                          <button 
                            onClick={() => toggleDescription(blog.id)}
                            className="text-green-500 text-xs font-bold mt-1 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {isExpanded ? (
                              <><ChevronUp size={14} /> See Less</>
                            ) : (
                              <><ChevronDown size={14} /> See More</>
                            )}
                          </button>
                        )}
                      </div>

                      {media.length > 0 && <div className="mb-4"><MediaGallery media={media}/></div>}

                      <div className="border-t border-slate-700 pt-3 mt-auto">
                        <div className="grid grid-cols-3 items-center w-full text-slate-400">
                          <div className="flex justify-start">
                            <button onClick={() => handleLike(blog.id)} className={`flex items-center gap-1.5 cursor-pointer ${userLikes[blog.id] ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}>
                              <Heart size={16} fill={userLikes[blog.id] ? "currentColor" : "none"} />
                              <span className="text-xs font-medium">{blog.like_counts || 0}</span>
                            </button>
                          </div>
                          <div className="flex justify-center">
                            <button onClick={() => toggleComments(blog.id)} className={`flex items-center gap-1.5 cursor-pointer ${expandedComments[blog.id] ? 'text-green-500' : 'text-slate-500 hover:text-green-500'}`}>
                              <MessageCircle size={16} />
                              <span className="text-xs font-medium">{blog.comment_counts || 0}</span>
                            </button>
                          </div>
                          <div className="flex justify-end">
                            <button onClick={() => handleShare(blog.id)} className="text-slate-500 hover:text-green-500 transition-colors cursor-pointer">
                              <Link2 size={16}/>
                            </button>
                          </div>
                        </div>
                      </div>

                      {expandedComments[blog.id] && <Comments table="blog_comments" foreignKey="blog_id" itemId={blog.id} onUpdate={() => fetchBlogs(false)} showDelete={false} />}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {!loading && displayBlogs.length === 0 && (
            <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700 w-full max-w-md mx-auto md:max-w-none px-0">
              <p className="text-slate-400">No blogs found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicBlogs;