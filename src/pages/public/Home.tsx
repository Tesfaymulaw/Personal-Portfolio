import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Loader2,
  MapPin,
  Phone,
  Mail,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase, ProfileData, Service } from '@/lib/supabase';
import PublicBlogs from './Blogs';
import PublicProjects from './Projects';
import PublicContact from './Contact';
import { motion } from 'framer-motion';

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

const PublicHome = () => {
  const [loading, setLoading] = useState(true);
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
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profile').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      } else {
        const { data: allProfiles } = await supabase.from('profile').select('*').limit(1).maybeSingle();
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

      // Fetch Services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (servicesData) {
        setServices(servicesData);
      }

    } catch (error: any) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 animate-pulse">Loading home page...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20 px-0 md:px-0">
      {/* Profile & Services Section */}
      <section>
        <div className="flex flex-col md:grid md:grid-cols-12 gap-8 lg:gap-8">
          {/* Profile Column */}
          <div className="md:col-span-6 px-0">
            <Card className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm overflow-hidden rounded-2xl shadow-2xl h-full w-full max-w-md mx-auto md:max-w-none">
              <CardContent className="pt-8 sm:pt-10 px-2 sm:px-6 flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-slate-700 bg-slate-900 flex items-center justify-center overflow-hidden relative shadow-2xl">
                    {profile.profile_picture ? (
                      <img src={profile.profile_picture} alt={`${profile.first_name}`} className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-slate-700 sm:w-20 sm:h-20" />
                    )}
                  </div>
                </div>

                <div className="mt-6 text-center w-full px-2 sm:px-0">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    {`${profile.first_name} ${profile.last_name}`.trim() || 'Portfolio Owner'}
                  </h2>
                  
                  <div className="w-full mt-4">
                    <ScrollingTitle title={profile.title || 'Professional Title'} />
                  </div>

                  {/* Contact Info */}
                  {contact && (
                    <div className="flex flex-col gap-3 mt-6 text-slate-400 text-sm items-start max-w-[250px] mx-auto">
                      {contact.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-blue-400 shrink-0" />
                          <span className="truncate">{contact.location}</span>
                        </div>
                      )}
                      {contact.primary_phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-blue-400 shrink-0" />
                          <span className="truncate">{contact.primary_phone}</span>
                        </div>
                      )}
                      {contact.primary_email && (
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-blue-400 shrink-0" />
                          <span className="truncate">{contact.primary_email}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {profile.biography && (
                    <div className="mt-8 px-2 text-left">
                      <p className="text-sm sm:text-base text-slate-300 leading-relaxed italic">{profile.biography}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services Column */}
          <div className="md:col-span-6 flex flex-col w-full max-w-md mx-auto md:max-w-none px-0">
            <div className="flex items-center gap-3 mb-4 w-full px-0">
              <div className="h-px bg-slate-700 flex-1"></div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Services</h3>
              <div className="h-px bg-slate-700 flex-1"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {services.length > 0 ? (
                services.map((service) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800/50 transition-all group"
                  >
                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {service.title}
                    </h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-slate-500 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                  <p>No services listed yet.</p>
                </div>
              )}
            </div>

            {/* Let's Work Together Button */}
            <div className="mt-auto flex justify-center md:justify-end w-full">
              <div className="w-full lg:grid lg:grid-cols-3">
                <div className="lg:col-start-2 lg:col-span-2">
                  <Button 
                    onClick={scrollToContact}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-xl active:scale-95 group"
                  >
                    Let's work together
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Sections */}
      <div className="space-y-16 w-full px-0">
        <section id="blogs" className="w-full">
          <PublicBlogs isHomePage={true} />
        </section>
        
        <section id="projects" className="w-full">
          <PublicProjects isHomePage={true} />
        </section>
        
        <section id="contact" className="w-full">
          <PublicContact />
        </section>
      </div>
    </div>
  );
};

export default PublicHome;