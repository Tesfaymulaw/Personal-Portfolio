import React, { useEffect, useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface CommentsProps {
  table: 'project_comments' | 'blog_comments';
  foreignKey: 'project_id' | 'blog_id';
  itemId: string;
  onUpdate?: () => void;
  showDelete?: boolean;
}

const Comments: React.FC<CommentsProps> = ({ table, foreignKey, itemId, onUpdate, showDelete = true }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(foreignKey, itemId)
      .order('created_at', { ascending: false });

    if (!error && data) setComments(data);
  };

  useEffect(() => {
    fetchComments();
  }, [itemId]);

  // Helper to get parent title (blog or project) for notification
  const getParentTitle = async (): Promise<string | null> => {
    if (table === 'blog_comments') {
      const { data } = await supabase
        .from('blogs')
        .select('title')
        .eq('id', itemId)
        .single();
      return data?.title || null;
    } else if (table === 'project_comments') {
      const { data } = await supabase
        .from('projects')
        .select('title')
        .eq('id', itemId)
        .single();
      return data?.title || null;
    }
    return null;
  };

  const handleAddComment = async () => {
    if (!author.trim() || !content.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const { error, data: newComment } = await supabase
        .from(table)
        .insert({
          [foreignKey]: itemId,
          author_name: author,
          content,
        })
        .select()
        .single();

      if (error) {
        toast.error('Failed to add comment');
      } else {
        setAuthor('');
        setContent('');
        await fetchComments();
        if (onUpdate) onUpdate();
        toast.success('Comment added');

        // 🔔 Insert notification for comment
        const parentTitle = await getParentTitle();
        if (parentTitle) {
          await supabase.from('notifications').insert({
            type: 'comment',
            title: `New comment on ${table === 'blog_comments' ? 'blog' : 'project'}`,
            description: `"${parentTitle}" - "${author}" commented: ${content.slice(0, 50)}${content.length > 50 ? '...' : ''}`,
            entity_type: table === 'blog_comments' ? 'blog' : 'project',
            entity_id: itemId,
            is_read: false
          });
        }
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);

      if (error) {
        toast.error('Failed to delete');
      } else {
        setComments(prev => prev.filter(c => c.id !== id));
        if (onUpdate) onUpdate();
        toast.success('Comment deleted');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 border-t border-slate-700 pt-4">
      <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl mb-4 w-full max-w-md mx-auto">
        <input
          type="text"
          placeholder="Your name..."
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full mb-2 p-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
        />

        <textarea
          placeholder="Write your comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
        />

        <div className="flex mt-2">
          <button
            onClick={handleAddComment}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Send size={16} />
            {loading ? 'Posting...' : 'Send'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-3 w-full max-w-md mx-auto"
          >
            <div className="flex items-start justify-between">
              <div className="font-semibold text-sm text-white">
                {comment.author_name}
              </div>

              {showDelete && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingId === comment.id}
                  className={`text-slate-400 hover:text-red-500 transition ${deletingId === comment.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Delete comment"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-500 mb-2">
              {new Date(comment.created_at).toLocaleString()}
            </div>

            <div className="text-sm text-slate-300 leading-relaxed">
              {comment.content}
            </div>
          </motion.div>
        ))}

        {comments.length === 0 && (
          <p className="text-slate-500 text-sm text-center">
            No comments yet
          </p>
        )}
      </div>
    </div>
  );
};

export default Comments;