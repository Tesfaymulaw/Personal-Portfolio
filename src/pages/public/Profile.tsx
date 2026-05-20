import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Camera, 
  Loader2,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { supabase, getUserProfile, updateUserProfile, uploadProfilePicture, ProfileData } from '@/lib/supabase';
import { toast } from 'sonner';

// Continuous Scrolling Title Component
const ScrollingTitle = ({ title }: { title: string }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const displayText = title || 'Professional Title';
  
  const scrollingText = displayText + '   ' + displayText;

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;
    let animationFrame: number;
    const speed = 1.2;
    const animate = () => {
      setScrollPosition(prev => {
        const newPos = prev - speed;
        const textWidth = text.offsetWidth / 2;
        if (newPos <= -textWidth) return 0;
        return newPos;
      });
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [displayText]);

  return (
    <div 
      ref={containerRef} 
      className="text-blue-400 whitespace-nowrap overflow-hidden max-w-full relative text-base sm:text-lg md:text-xl font-medium"
      style={{ 
        width: '100%',
        maskImage: 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)'
      }}
    >
      <span ref={textRef} className="inline-block" style={{ transform: `translateX(${scrollPosition}px)`, willChange: 'transform' }}>
        {scrollingText}
      </span>
    </div>
  );
};

const PublicProfile = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    id: '',
    first_name: '',
    last_name: '',
    title: '',
    biography: '',
    profile_picture: '',
    email: '',
  });
  const [contact, setContact] = useState<{
    location: string;
    primary_phone: string;
    primary_email: string;
  } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch Profile
      if (user) {
        const { data, error } = await getUserProfile(user.id);
        if (data) setProfile(data);
      } else {
        const { data: allProfiles } = await supabase.from('profile').select('*').limit(1).single();
        if (allProfiles) setProfile(allProfiles);
      }

      // Fetch Contact Info
      const { data: contactData } = await supabase
        .from('contact')
        .select('location, primary_phone, primary_email')
        .limit(1)
        .maybeSingle();
      
      if (contactData) {
        setContact(contactData);
      }

    } catch (error: any) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;
      const publicUrl = await uploadProfilePicture(profile.id, file);
      setProfile(prev => ({ ...prev, profile_picture: publicUrl }));
      toast.success('Avatar uploaded successfully');
    } catch (error: any) {
      toast.error('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const { error } = await updateUserProfile(profile.id, {
        first_name: profile.first_name,
        last_name: profile.last_name,
        title: profile.title,
        biography: profile.biography,
        profile_picture: profile.profile_picture,
      });
      if (error) throw error;
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error('Error updating profile: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col gap-8">
        <div className="space-y-6">
          <Card className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm overflow-hidden w-full max-w-md mx-auto md:max-w-none rounded-2xl shadow-2xl">
            <CardContent className="pt-6 sm:pt-8 px-2 sm:px-4 flex flex-col items-center">
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-700 bg-slate-900 flex items-center justify-center overflow-hidden relative shadow-2xl">
                  {profile.profile_picture ? (
                    <img src={profile.profile_picture} alt={`${profile.first_name}`} className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-slate-700 sm:w-16 sm:h-16 md:w-20 md:h-20" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 animate-spin" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-2 sm:p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full cursor-pointer shadow-lg transition-transform z-10 border border-slate-600">
                    <Camera size={24} className="text-blue-400" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                  </label>
                )}
              </div>

              <div className="mt-4 sm:mt-6 text-center w-full px-2 sm:px-0">
                <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-white">
                  {`${profile.first_name} ${profile.last_name}`.trim() || 'Portfolio Owner'}
                </h2>
                
                {!isEditing ? (
                  <div className="w-full mt-3 sm:mt-4">
                    <ScrollingTitle title={profile.title || 'Professional Title'} />
                  </div>
                ) : (
                  <p className="text-blue-400 text-base sm:text-lg font-medium mt-3">{profile.title || 'Professional Title'}</p>
                )}

                {/* Contact Info Row */}
                {!isEditing && contact && (
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-4 text-slate-400 text-sm">
                    {contact.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-blue-400" />
                        <span>{contact.location}</span>
                      </div>
                    )}
                    {contact.primary_phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} className="text-blue-400" />
                        <span>{contact.primary_phone}</span>
                      </div>
                    )}
                    {contact.primary_email && (
                      <div className="flex items-center gap-1.5">
                        <Mail size={14} className="text-blue-400" />
                        <span>{contact.primary_email}</span>
                      </div>
                    )}
                  </div>
                )}

                {!isEditing && profile.biography && (
                  <div className="mt-4 sm:mt-6 px-2 sm:px-4 max-w-4xl mx-auto text-left">
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{profile.biography}</p>
                  </div>
                )}
                
                <div className="flex flex-col items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                  {!isEditing && (
                    <Button 
                      onClick={() => setIsEditing(true)} 
                      className="cursor-pointer bg-green-600 hover:bg-green-700 text-white border border-green-600 text-sm sm:text-base px-4 sm:px-6 py-2.5 rounded-xl h-auto transition-all font-semibold"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <AnimatePresence mode="wait">
            {isEditing && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }}>
                <Card className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm w-full max-w-md mx-auto md:max-w-none rounded-2xl shadow-2xl">
                  <CardContent className="pt-6 sm:pt-8 px-2 sm:px-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-slate-400 text-xs font-bold uppercase tracking-wider">First Name</Label>
                          <Input name="first_name" value={profile.first_name} onChange={handleInputChange} className="bg-slate-900/50 border-slate-700 text-white rounded-xl" required />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Last Name</Label>
                          <Input name="last_name" value={profile.last_name} onChange={handleInputChange} className="bg-slate-900/50 border-slate-700 text-white rounded-xl" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Professional Title</Label>
                        <Input name="title" value={profile.title} onChange={handleInputChange} className="bg-slate-900/50 border-slate-700 text-white rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Biography</Label>
                        <Textarea name="biography" value={profile.biography} onChange={handleInputChange} className="bg-slate-900/50 border-slate-700 text-white rounded-xl min-h-[150px]" />
                      </div>

                      <div className="flex flex-row items-center justify-between gap-4 pt-4">
                        <Button type="submit" disabled={updating} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2.5 rounded-xl h-auto transition-all order-1">
                          {updating ? 'Saving...' : 'Save'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={updating} className="w-full sm:w-auto bg-white text-slate-900 border-slate-200 hover:bg-slate-50 font-medium px-8 py-2.5 rounded-xl h-auto transition-all order-2">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;