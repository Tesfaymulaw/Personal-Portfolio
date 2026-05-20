import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  Globe,
  Send,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Custom Social Icons
const InstagramIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const LinkedinIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const GithubIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const TwitterIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
  </svg>
);

const YoutubeIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"></path>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
  </svg>
);

const TikTokIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
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

// Map of platform keys to real icons
const platformIcons: Record<string, any> = {
  instagram: InstagramIcon,
  github: GithubIcon,
  linkedin: LinkedinIcon,
  facebook: FacebookIcon,
  tiktok: TikTokIcon,
  twitter: TwitterIcon,
  youtube: YoutubeIcon
};

interface ContactInfo {
  location: string;
  primary_phone: string;
  primary_email: string;
  instagram?: string;
  linkedin?: string;
  tiktok?: string;
  facebook?: string;
  github?: string;
  twitter?: string;
  youtube?: string;
}

interface MessageForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact = () => {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    location: '',
    primary_phone: '',
    primary_email: '',
    instagram: '',
    linkedin: '',
    tiktok: '',
    facebook: '',
    github: '',
    twitter: '',
    youtube: ''
  });

  const [formData, setFormData] = useState<MessageForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('contact')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setContactInfo({
          location: data.location || '',
          primary_phone: data.primary_phone || '',
          primary_email: data.primary_email || '',
          instagram: data.instagram || '',
          linkedin: data.linkedin || '',
          tiktok: data.tiktok || '',
          facebook: data.facebook || '',
          github: data.github || '',
          twitter: data.twitter || '',
          youtube: data.youtube || ''
        });
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
      isValid = false;
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required';
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSending(true);

    try {
      // Insert message (without selecting – preserves existing RLS)
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            subject: formData.subject.trim(),
            message: formData.message.trim(),
            is_read: false
          }
        ]);

      if (error) throw error;

      // Insert notification using form data (no need for message ID)
      await supabase.from('notifications').insert({
        type: 'message',
        title: `New message from "${formData.name.trim()}"`,
        description: formData.subject.trim(),
        entity_type: 'message',
        entity_id: null,
        is_read: false
      });

      toast.success('Message sent successfully!', {
        description: "Thank you for reaching out. I'll get back to you soon.",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />
      });

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message', {
        description: error.message || 'Please try again later or contact me directly via email.',
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
    } finally {
      setSending(false);
    }
  };

  const handleSocialClick = (url: string, platform: string) => {
    if (!url) return;
    
    let fullUrl = url;
    if (!url.startsWith('http')) {
      switch(platform) {
        case 'instagram':
          fullUrl = `https://instagram.com/${url.replace('@', '')}`;
          break;
        case 'linkedin':
          fullUrl = `https://linkedin.com/in/${url}`;
          break;
        case 'tiktok':
          fullUrl = `https://tiktok.com/@${url.replace('@', '')}`;
          break;
        case 'facebook':
          fullUrl = `https://facebook.com/${url}`;
          break;
        case 'github':
          fullUrl = `https://github.com/${url}`;
          break;
        case 'twitter':
          fullUrl = `https://twitter.com/${url}`;
          break;
        case 'youtube':
          fullUrl = `https://youtube.com/${url.startsWith('@') ? url : '@' + url}`;
          break;
      }
    }
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 w-full">
      <div className="max-w-md mx-auto md:max-w-none w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12 max-w-2xl mx-auto"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Get in Touch</h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Have a question or want to work together? Feel free to reach out to me!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full"
          >
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 sm:p-6 hover:border-green-500/50 transition-all h-full flex flex-col w-full max-w-md mx-auto md:max-w-none">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-8 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" />
                Contact Info
              </h2>

              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-6 lg:space-y-8">
                  {contactInfo.location && (
                    <div className="flex items-start gap-3 lg:gap-4">
                      <MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm lg:text-base font-medium text-slate-400 mb-1">Location</h3>
                        <p className="text-white text-base lg:text-lg">{contactInfo.location}</p>
                      </div>
                    </div>
                  )}

                  {contactInfo.primary_phone && (
                    <div className="flex items-start gap-3 lg:gap-4">
                      <Phone className="w-5 h-5 lg:w-6 lg:h-6 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm lg:text-base font-medium text-slate-400 mb-1">Phone</h3>
                        <p className="text-white text-base lg:text-lg">{contactInfo.primary_phone}</p>
                      </div>
                    </div>
                  )}

                  {contactInfo.primary_email && (
                    <div className="flex items-start gap-3 lg:gap-4">
                      <Mail className="w-5 h-5 lg:w-6 lg:h-6 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm lg:text-base font-medium text-slate-400 mb-1">Email</h3>
                        <p className="text-white text-base lg:text-lg">{contactInfo.primary_email}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-700/50">
                  <h3 className="text-sm font-medium text-slate-400 mb-6 uppercase tracking-wider">Follow Me</h3>
                  <div className="flex flex-row flex-nowrap items-center justify-start gap-2 sm:gap-3">
                    {Object.entries(platformIcons).map(([key, Icon]) => {
                      const url = (contactInfo as any)[key];
                      if (!url) return null;
                      return (
                        <button
                          key={key}
                          onClick={() => handleSocialClick(url, key)}
                          className="text-slate-400 hover:text-white transition-all duration-300 group shrink-0"
                          title={key.charAt(0).toUpperCase() + key.slice(1)}
                        >
                          <Icon className="w-6 h-6 lg:w-7 lg:h-7 group-hover:scale-110 transition-transform" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-full"
          >
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 sm:p-6 hover:border-green-500/50 transition-all h-full w-full max-w-md mx-auto md:max-w-none">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-8 flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-500" />
                Send a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6 flex flex-col h-[calc(100%-4rem)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your Name"
                      className={`bg-slate-900/50 border-slate-700 h-12 text-white focus:border-green-500/50 ${formErrors.name ? 'border-red-500/50' : ''}`}
                    />
                    {formErrors.name && <p className="text-xs text-red-400 ml-1">{formErrors.name}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your Email"
                      className={`bg-slate-900/50 border-slate-700 h-12 text-white focus:border-green-500/50 ${formErrors.email ? 'border-red-500/50' : ''}`}
                    />
                    {formErrors.email && <p className="text-xs text-red-400 ml-1">{formErrors.email}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Subject"
                    className={`bg-slate-900/50 border-slate-700 h-12 text-white focus:border-green-500/50 ${formErrors.subject ? 'border-red-500/50' : ''}`}
                  />
                  {formErrors.subject && <p className="text-xs text-red-400 ml-1">{formErrors.subject}</p>}
                </div>

                <div className="space-y-1.5 flex-1">
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Your message here..."
                    className={`bg-slate-900/50 border-slate-700 text-white focus:border-green-500/50 h-full min-h-[150px] resize-none ${formErrors.message ? 'border-red-500/50' : ''}`}
                  />
                  {formErrors.message && <p className="text-xs text-red-400 ml-1">{formErrors.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-green-500/20 group mt-2 cursor-pointer"
                >
                  {sending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;