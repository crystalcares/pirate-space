import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export interface AppConfig {
  [key: string]: string;
}

const AppConfigContext = createContext<AppConfig | null>(null);

export const AppConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchConfig = async () => {
      const { data, error } = await supabase
        .from('app_config')
        .select('key, value')
        .abortSignal(signal);

      if (error) {
        if (error.code !== '20') { // '20' is AbortError
          toast.error('Failed to load app configuration.');
          console.error('Failed to load app configuration.', error);
        }
        setConfig({});
      } else if (data) {
        const configObject = data.reduce((acc, { key, value }) => {
          acc[key] = value || '';
          return acc;
        }, {} as AppConfig);
        setConfig(configObject);
      }
    };

    fetchConfig();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (context === undefined) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
};
