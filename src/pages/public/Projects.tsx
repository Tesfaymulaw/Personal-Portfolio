import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Calendar, User, Heart, MessageCircle, Link2, Search, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { supabase, copyToClipboard, Project, getAnonymousId } from '../../lib/supabase';
import MediaGallery from '../../components/common/MediaGallery';
import Comments from '../../components/common/Comments';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

const GithubIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
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

interface PublicProjectsProps {
  isHomePage?: boolean;
}

const PublicProjects = ({ isHomePage = false }: PublicProjectsProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchProjects = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*, author:profile!projects_user_id_fkey(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);

      const { data: { session } } = await supabase.auth.getSession();
      const effectiveUserId = session?.user?.id || getAnonymousId();
      
      const { data: likes } = await supabase
        .from('project_likes')
        .select('project_id')
        .eq('user_id', effectiveUserId);
      
      if (likes) {
        const likesMap: Record<string, boolean> = {};
        likes.forEach(l => likesMap[l.project_id] = true);
        setUserLikes(likesMap);
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err);
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
    fetchProjects();
  }, [fetchProjects]);

  const handleShare = async (projectId: string) => {
    try {
      const fullUrl = `${window.location.origin}/portfolio/projects#project-${projectId}`;
      const success = await copyToClipboard(fullUrl);
      if (success) toast.success('Project link copied to clipboard');
    } catch (err) { toast.error('Failed to copy project link'); }
  };

  const handleLike = async (projectId: string) => {
    const effectiveUserId = currentUserId || getAnonymousId();
    const isLiked = userLikes[projectId];

    try {
      if (isLiked) {
        await supabase.from('project_likes').delete().match({ project_id: projectId, user_id: effectiveUserId });
        setUserLikes(prev => ({ ...prev, [projectId]: false }));
      } else {
        await supabase.from('project_likes').insert({ project_id: projectId, user_id: effectiveUserId });
        setUserLikes(prev => ({ ...prev, [projectId]: true }));

        // 🔔 Insert notification for like
        const project = projects.find(p => p.id === projectId);
        if (project) {
          await supabase.from('notifications').insert({
            type: 'like',
            title: 'Project liked',
            description: `"${project.title}"`,
            entity_type: 'project',
            entity_id: projectId,
            is_read: false
          });
        }
      }
      fetchProjects(false);
    } catch (err) {
      console.error('Like error:', err);
      toast.error('Failed to update like'); 
    }
  };

  const toggleComments = (projectId: string) => setExpandedComments(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  const toggleDescription = (projectId: string) => setExpandedDescriptions(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  
  const formatPostDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (project.category && project.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (project.tools_used && project.tools_used.some(tool => tool.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const displayProjects = (isHomePage && !isExpanded) ? filteredProjects.slice(0, 3) : filteredProjects;

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
                Featured <span className="text-green-500">Projects</span>
              </motion.h1>
              <p className="text-slate-400">Discover our latest work and professional achievements.</p>
            </div>
            <div className="col-start-3">
              {isHomePage ? (
                <Link to="/portfolio/projects" className="block w-full">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 transition-all shadow-lg active:scale-95 group">
                    Explore All Projects
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-500 transition-colors" size={20} />
                  <Input
                    type="text"
                    placeholder="Search projects..."
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
                Featured <span className="text-green-500">Projects</span>
              </motion.h1>
            </div>
            {isHomePage ? (
              <div className="flex justify-center px-0">
                <Link to="/portfolio/projects" className="w-full">
                  <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 transition-all shadow-lg active:scale-95 group w-full">
                    Explore All Projects
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="relative group max-w-md mx-auto md:max-w-none px-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-500 transition-colors" size={20} />
                <Input
                  type="text"
                  placeholder="Search projects..."
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
            <div className="space-y-10">
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 w-full items-stretch px-0"
              >
                <AnimatePresence mode="popLayout">
                  {displayProjects.map((project) => {
                    const media = project.media_urls?.filter(Boolean) || [];
                    const authorName = project.author ? `${project.author.first_name} ${project.author.last_name}` : 'Portfolio Admin';
                    const isDescExpanded = expandedDescriptions[project.id];
                    const description = project.description || '';
                    const shouldShowDescToggle = description.length > 120;

                    return (
                      <motion.div
                        key={project.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col group hover:border-slate-600 transition-colors w-full shadow-2xl relative h-full max-w-md mx-auto md:max-w-none"
                      >
                        <div className="flex justify-between mb-4">
                          <div className="flex gap-3 items-center">
                            {project.author?.profile_picture ? (
                              <img src={project.author.profile_picture} alt={authorName} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                            ) : (
                              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center"><User size={18} className="text-slate-300"/></div>
                            )}
                            <div>
                              <p className="text-white text-sm font-bold">{authorName}</p>
                              <p className="text-slate-500 text-xs">{formatPostDate(project.created_at)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-bold group-hover:text-green-500 transition-colors">{project.title}</h3>
                          {project.category && <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded uppercase">{project.category}</span>}
                        </div>

                        <div className="mb-3">
                          <p className={`text-slate-400 text-sm leading-relaxed ${!isDescExpanded && shouldShowDescToggle ? 'line-clamp-3' : ''}`}>
                            {description}
                          </p>
                          {shouldShowDescToggle && (
                            <button 
                              onClick={() => toggleDescription(project.id)}
                              className="text-green-500 hover:text-green-400 text-xs font-bold mt-2 transition-colors flex items-center gap-1"
                            >
                              {isDescExpanded ? (
                                <>See Less <ChevronUp size={14} /></>
                              ) : (
                                <>See More <ChevronDown size={14} /></>
                              )}
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tools_used?.map(tool => (
                            <span key={tool} className="text-[10px] uppercase font-bold bg-green-500/10 text-green-500 px-2 py-1 rounded">{tool}</span>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-slate-500 mb-4 pb-4 border-b border-slate-700/50">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span className="text-xs">{(project as any).completed_at ? new Date((project as any).completed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-3 ml-auto">
                            {project.github_url ? (
                              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="transition-colors text-slate-400 hover:text-white"><GithubIcon size={16}/></a>
                            ) : (
                              <span className="text-slate-700 cursor-not-allowed"><GithubIcon size={16}/></span>
                            )}
                            {project.live_url ? (
                              <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="transition-colors text-slate-400 hover:text-white"><ExternalLink size={16}/></a>
                            ) : (
                              <span className="text-slate-700 cursor-not-allowed"><ExternalLink size={16}/></span>
                            )}
                          </div>
                        </div>

                        {media.length > 0 && <div className="mb-4"><MediaGallery media={media}/></div>}

                        <div className="border-t border-slate-700 pt-3 mt-auto">
                          <div className="grid grid-cols-3 items-center w-full text-slate-400">
                            <div className="flex justify-start">
                              <button onClick={() => handleLike(project.id)} className={`flex items-center gap-1.5 cursor-pointer ${userLikes[project.id] ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}>
                                <Heart size={16} fill={userLikes[project.id] ? "currentColor" : "none"} />
                                <span className="text-xs font-medium">{project.like_counts || 0}</span>
                              </button>
                            </div>
                            <div className="flex justify-center">
                              <button onClick={() => toggleComments(project.id)} className={`flex items-center gap-1.5 cursor-pointer ${expandedComments[project.id] ? 'text-green-500' : 'text-slate-500 hover:text-green-500'}`}>
                                <MessageCircle size={16} />
                                <span className="text-xs font-medium">{project.comment_counts || 0}</span>
                              </button>
                            </div>
                            <div className="flex justify-end">
                              <button onClick={() => handleShare(project.id)} className="text-slate-500 hover:text-green-500 transition-colors cursor-pointer">
                                <Link2 size={16}/>
                              </button>
                            </div>
                          </div>
                        </div>

                        {expandedComments[project.id] && <Comments table="project_comments" foreignKey="project_id" itemId={project.id} onUpdate={() => fetchProjects(false)} showDelete={false} />}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              {isHomePage && filteredProjects.length > 3 && (
                <div className="flex justify-center mt-12">
                  <Button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    variant="outline"
                    className="border-green-600/50 text-green-500 hover:bg-green-600/10 hover:text-green-400 px-10 py-6 rounded-2xl font-bold flex items-center gap-2 group transition-all shadow-lg hover:shadow-green-500/10"
                  >
                    {isExpanded ? (
                      <>
                        See Less <ChevronUp size={20} className="group-hover:-translate-y-1 transition-transform" />
                      </>
                    ) : (
                      <>
                        See More <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {!loading && displayProjects.length === 0 && (
            <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700 w-full max-w-md mx-auto md:max-w-none px-0">
              <p className="text-slate-400">No projects found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProjects;