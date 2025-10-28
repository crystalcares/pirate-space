import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { Tables } from '@/lib/database.types';
import { toast } from 'sonner';

type Profile = Tables<'profiles'> & { roles: string[] };

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        setTimeout(async () => {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select(`
              *,
              user_roles (
                roles ( name )
              )
            `)
            .eq('id', currentUser.id)
            .single();

          if (error) {
            toast.error('Failed to fetch user profile. Please check your network connection or Supabase configuration.');
            console.error('Error fetching profile:', error);
            setProfile(null);
            setIsAdmin(false);
          } else if (profileData) {
            const userRolesData = profileData.user_roles as unknown as { roles: { name: string } }[];
            const roles = (Array.isArray(userRolesData) ? userRolesData : []).map(r => r.roles.name);
            
            const userProfile: Profile = {
              ...(profileData as Omit<typeof profileData, 'user_roles'>),
              roles,
            };
            setProfile(userProfile);
            setIsAdmin(roles.includes('admin'));
          }
          setLoading(false);
        }, 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    profile,
    isAdmin,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
