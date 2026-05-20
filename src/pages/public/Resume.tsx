import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Activity, 
  Globe, 
  Loader2,
  Calendar,
  MapPin,
  Code,
  Phone,
  Mail,
  Users,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase, ProfileData, Project } from '@/lib/supabase';
import { toast } from 'sonner';

// --- Types ---

interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
  description: string[];
}

interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
  coursework?: string[];
}

interface ActivityItem {
  id: string;
  name: string;
  description: string;
  organization?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
}

interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  issue_date?: string;
}

interface SkillItem {
  id: string;
  name: string;
  level: number;
  category: string;
}

interface LanguageItem {
  id: string;
  name: string;
  language_proficiencies: {
    id: string;
    name: string;
    level: number;
  }[];
}

interface ReferenceItem {
  id: string;
  full_name: string;
  role: string;
  organization: string;
  phone: string;
  email: string;
}

interface ProfileWithCV extends ProfileData {
  cv_url?: string;
}

const PublicResume = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileWithCV | null>(null);
  const [contact, setContact] = useState<{
    location: string;
    primary_phone: string;
    primary_email: string;
  } | null>(null);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [downloadingCV, setDownloadingCV] = useState(false);

  useEffect(() => {
    fetchResumeData();
  }, []);

  const fetchResumeData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel including cv_url from profile
      const [
        profilePromise,
        contactPromise,
        expPromise,
        eduPromise,
        projPromise,
        actPromise,
        certPromise,
        skillPromise,
        langPromise,
        refPromise
      ] = await Promise.all([
        supabase.from('profile').select('*').single(),
        supabase.from('contact').select('location, primary_phone, primary_email').limit(1).maybeSingle(),
        supabase.from('experience').select('*').order('start_date', { ascending: false }),
        supabase.from('education').select('*').order('start_date', { ascending: false }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('activities').select('*').order('created_at', { ascending: false }),
        supabase.from('certificates').select('*').order('issue_date', { ascending: false }),
        supabase.from('skills').select('*').order('category'),
        supabase.from('languages').select('*, language_proficiencies(*)'),
        supabase.from('references').select('*').order('created_at', { ascending: true })
      ]);

      if (profilePromise.data) setProfile(profilePromise.data as ProfileWithCV);
      if (contactPromise.data) setContact(contactPromise.data);
      if (expPromise.data) setExperiences(expPromise.data);
      if (eduPromise.data) setEducation(eduPromise.data);
      if (projPromise.data) setProjects(projPromise.data);
      if (actPromise.data) setActivities(actPromise.data);
      if (certPromise.data) setCertificates(certPromise.data);
      if (skillPromise.data) setSkills(skillPromise.data);
      if (langPromise.data) setLanguages(langPromise.data);
      if (refPromise.data) setReferences(refPromise.data);

    } catch (error: any) {
      console.error('Error fetching resume data:', error);
      toast.error('Could not load resume information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = async () => {
    if (!profile?.cv_url) {
      toast.error('CV not available. Please contact the administrator.');
      return;
    }

    setDownloadingCV(true);
    try {
      // Fetch the PDF file from the public URL
      const response = await fetch(profile.cv_url);
      if (!response.ok) throw new Error('Failed to fetch CV');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profile.first_name}_${profile.last_name}_CV.pdf`; // or extract filename from URL
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('CV downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download CV. Please try again later.');
    } finally {
      setDownloadingCV(false);
    }
  };

  const groupSkillsByCategory = (skills: SkillItem[]) => {
    const categories: Record<string, SkillItem[]> = {};
    skills.forEach(skill => {
      if (!categories[skill.category]) categories[skill.category] = [];
      categories[skill.category].push(skill);
    });
    return Object.entries(categories).map(([category, skills]) => ({ category, skills }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 text-white animate-spin" />
        <p className="text-white animate-pulse">Loading resume...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-0 py-12 space-y-12">
      
      {/* Top Resume Header */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto md:max-w-none px-0 sm:px-0">
        <h2 className="text-3xl font-bold text-white tracking-tight">Resume</h2>
        <Button 
          onClick={handleDownloadCV}
          disabled={downloadingCV || !profile?.cv_url}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-lg active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloadingCV ? (
            <Loader2 size={18} className="mr-2 animate-spin" />
          ) : (
            <Download size={18} className="mr-2" />
          )}
          Download CV
        </Button>
      </div>

      {/* Header Info Block (About Section) */}
      <section className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start gap-8 shadow-xl w-full max-w-md mx-auto md:max-w-none"
        >
          <div className="space-y-4 flex-1">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              {profile ? `${profile.first_name} ${profile.last_name}` : 'Developer'}
            </h1>
            <p className="text-xl text-white font-medium opacity-90">
              {profile?.title || 'Full Stack Developer'}
            </p>
            
            {/* Real Contact Details - Horizontal on PC */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 pt-2">
              {contact?.location && (
                <div className="flex items-center gap-2 text-white opacity-80 text-sm">
                  <MapPin size={16} className="text-green-500" />
                  <span>{contact.location}</span>
                </div>
              )}
              {contact?.primary_phone && (
                <div className="flex items-center gap-2 text-white opacity-80 text-sm">
                  <Phone size={16} className="text-green-500" />
                  <span>{contact.primary_phone}</span>
                </div>
              )}
              {contact?.primary_email && (
                <div className="flex items-center gap-2 text-white opacity-80 text-sm">
                  <Mail size={16} className="text-green-500" />
                  <span>{contact.primary_email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-white opacity-80 text-sm">
                <Calendar size={16} className="text-green-500" />
                <span>Available for Hire</span>
              </div>
            </div>

            <div className="max-w-2xl pt-4">
              <p className="text-white opacity-80 leading-relaxed text-sm sm:text-base">
                {profile?.biography || "Highly motivated and skilled Full-Stack Developer with a focus on MERN and PERN stacks."}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <div className="space-y-12">
        {/* Experience Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 w-full max-w-md mx-auto md:max-w-none px-0 sm:px-0">
            <div className="p-2.5 bg-green-600 rounded-full border border-green-500/30 shrink-0">
              <Briefcase size={22} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Work Experience</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experiences.map((exp, index) => (
              <motion.div 
                key={exp.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden group w-full"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                    <Badge variant="secondary" className="bg-slate-700 text-white border-slate-600">
                      {new Date(exp.start_date).getFullYear()} - {exp.is_current ? 'Present' : (exp.end_date ? new Date(exp.end_date).getFullYear() : '')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-white opacity-90 font-medium text-sm sm:text-base">
                    <span>{exp.company}</span>
                    {exp.location && (
                      <span className="text-white opacity-60 text-xs sm:text-sm">{exp.location}</span>
                    )}
                  </div>
                  <p className="text-white opacity-70 text-sm leading-relaxed mt-4">
                    {exp.description?.join(" ")}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Education Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 w-full max-w-md mx-auto md:max-w-none px-0 sm:px-0">
            <div className="p-2.5 bg-green-600 rounded-full border border-green-500/30 shrink-0">
              <GraduationCap size={22} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Education</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {education.map((edu, index) => (
              <motion.div 
                key={edu.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl w-full relative group"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xl font-bold text-white">{edu.degree}</h3>
                    <Badge variant="secondary" className="bg-slate-700 text-white border-slate-600">
                      {new Date(edu.start_date).getFullYear()} - {edu.is_current ? 'Present' : (edu.end_date ? new Date(edu.end_date).getFullYear() : '')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-white opacity-90 font-medium text-sm sm:text-base">
                    <span>{edu.institution}</span>
                    {edu.location && (
                      <span className="text-white opacity-60 text-xs sm:text-sm">{edu.location}</span>
                    )}
                  </div>
                  {edu.coursework && edu.coursework.length > 0 && (
                    <div className="mt-4">
                      <p className="text-white opacity-70 text-sm leading-relaxed">
                        {edu.coursework.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 w-full max-w-md mx-auto md:max-w-none px-0 sm:px-0">
            <div className="p-2.5 bg-green-600 rounded-full border border-green-500/30 shrink-0">
              <Code size={22} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Projects</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj, index) => (
              <motion.div 
                key={proj.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4 w-full group relative"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xl font-bold text-white">{proj.title}</h3>
                  <Badge variant="secondary" className="bg-slate-700 text-white border-slate-600">
                    {(proj as any).completed_date ? new Date((proj as any).completed_date).getFullYear() : (proj.created_at ? new Date(proj.created_at).getFullYear() : 'N/A')}
                  </Badge>
                </div>
                <p className="text-white opacity-70 text-sm leading-relaxed mt-2">
                  {proj.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Activities & Certificates - Aligned Vertically on Desktop */}
        <div className="space-y-12">
          {/* Activities */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 w-full max-w-md mx-auto md:max-w-none px-0 sm:px-0">
              <div className="p-2.5 bg-green-600 rounded-full border border-green-500/30 shrink-0">
                <Activity size={22} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Activities</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activities.map((a, i) => (
                <motion.div 
                  key={a.id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden group w-full"
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xl font-bold text-white">{a.name}</h3>
                      {(a.start_date || a.end_date || a.is_current) && (
                        <Badge variant="secondary" className="bg-slate-700 text-white border-slate-600">
                          {a.start_date ? new Date(a.start_date).getFullYear() : ''} - {a.is_current ? 'Present' : (a.end_date ? new Date(a.end_date).getFullYear() : '')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-white opacity-90 font-medium text-sm sm:text-base">
                      <span>{a.organization || ''}</span>
                      {a.location && (
                        <span className="text-white opacity-60 text-xs sm:text-sm">{a.location}</span>
                      )}
                    </div>
                    <p className="text-white opacity-70 text-sm leading-relaxed mt-4">
                      {a.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Certificates - with year badge on the rightmost */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 w-full max-w-md mx-auto md:max-w-none px-0 sm:px-0">
              <div className="p-2.5 bg-green-600 rounded-full border border-green-500/30 shrink-0">
                <Award size={22} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Certificates</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((c, i) => (
                <motion.div 
                  key={c.id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl relative group w-full"
                >
                  {/* Title and badge side by side */}
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <h3 className="text-xl font-bold text-white">{c.name}</h3>
                    {c.issue_date && (
                      <Badge variant="secondary" className="bg-slate-700 text-white border-slate-600 shrink-0">
                        {new Date(c.issue_date).getFullYear()}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-medium text-white opacity-90">{c.issuer}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Skills Section */}
        <section className="space-y-8">
          <div className="flex flex-col items-center gap-3 w-full mb-8">
            <div className="flex items-center gap-3 w-full">
              <div className="p-2.5 bg-green-600 rounded-full border border-green-500/30 shrink-0">
                <Award size={22} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Skills & Expertise</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groupSkillsByCategory(skills).map((cat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden group hover:border-white/30 transition-all shadow-xl w-full relative"
              >
                <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    {cat.category}
                  </h3>
                </div>
                <CardContent className="p-6 space-y-5">
                  {cat.skills.map((skill, sIdx) => (
                    <div key={sIdx} className="space-y-2 group/skill relative">
                      <div className="flex justify-between text-sm">
                        <span className="text-white font-medium">{skill.name}</span>
                        <span className="text-white font-bold">{skill.level}%</span>
                      </div>
                      <Progress 
                        value={skill.level} 
                        className="h-1.5 bg-slate-900 [&_[data-slot=progress-indicator]]:bg-white" 
                      />
                    </div>
                  ))}
                </CardContent>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Languages Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 w-full px-0 sm:px-0">
            <div className="p-2.5 bg-green-600 rounded-full border border-green-500/30 shrink-0">
              <Globe size={22} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Languages</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {languages.map((lang, idx) => (
              <motion.div 
                key={lang.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden group hover:border-white/30 transition-all shadow-xl w-full relative"
              >
                <div className="p-4 bg-slate-800 border-b border-slate-700">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    {lang.name}
                  </h3>
                </div>
                <CardContent className="p-6 space-y-5">
                  {lang.language_proficiencies?.map((skill, sIdx) => (
                    <div key={sIdx} className="space-y-2">
                      <div className="flex justify-end text-sm">
                        <span className="text-white font-bold">{skill.level}%</span>
                      </div>
                      <Progress 
                        value={skill.level} 
                        className="h-1.5 bg-slate-900 [&_[data-slot=progress-indicator]]:bg-white" 
                      />
                    </div>
                  ))}
                </CardContent>
              </motion.div>
            ))}
          </div>
        </section>

        {/* References Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 w-full px-0 sm:px-0">
            <div className="p-2.5 bg-green-600 rounded-full border border-green-500/30 shrink-0">
              <Users size={22} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">References</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {references.map((ref, idx) => (
              <motion.div 
                key={ref.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden group w-full"
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">{ref.full_name}</h3>
                  <p className="text-white opacity-90 font-medium text-sm sm:text-base">
                    {ref.role}, <span className="opacity-70 font-normal">{ref.organization}</span>
                  </p>
                  <div className="pt-2 flex items-center justify-between gap-4 text-white opacity-60 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-green-500" />
                      <span>{ref.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-green-500" />
                      <span>{ref.email}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PublicResume;