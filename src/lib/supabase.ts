import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lohfrcmskpeuabuqcous.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvaGZyY21za3BldWFidXFjb3VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTMyMjYsImV4cCI6MjA4ODAyOTIyNn0.kr1eLpe8FrS-JzgoKKtM5E1SLcu_U7xPwhwPTbcOLbk';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  biography: string;
  profile_picture: string;
  email: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category?: string;
  tools_used?: string[];
  media_urls?: string[];
  github_url?: string;
  live_url?: string;
  created_at: string;
  completed_date?: string;
  user_id: string;
  like_counts?: number;
  comment_counts?: number;
  author?: {
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
}

export interface Blog {
  id: string;
  title: string;
  description: string;
  category?: string;
  media_urls?: string[];
  created_at: string;
  user_id: string;
  like_counts?: number;
  comment_counts?: number;
  author?: {
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  order_index?: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  type: 'message' | 'like' | 'comment';
  title: string;
  description: string | null;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
}

export const getUserProfile = async (userId: string) => {
  return await supabase
    .from('profile')
    .select('*')
    .eq('id', userId)
    .single();
};

export const updateUserProfile = async (userId: string, data: Partial<ProfileData>) => {
  return await supabase
    .from('profile')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
};

export const updateMessageReadStatus = async (id: string, isRead: boolean) => {
  return await supabase
    .from('messages')
    .update({ is_read: isRead })
    .eq('id', id);
};

export const uploadProfilePicture = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('profiles')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('profiles')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const parseImages = (images: any): string[] => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    try {
      return JSON.parse(images);
    } catch (e) {
      return [images];
    }
  }
  return [];
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!text) return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('navigator.clipboard failed, falling back...', err);
    }
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed:', err);
    return false;
  }
};

export const getAnonymousId = () => {
  let id = localStorage.getItem('anonymous_user_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('anonymous_user_id', id);
  }
  return id;
};