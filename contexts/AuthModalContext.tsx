import { createContext, useContext, useState, ReactNode } from 'react';

type AuthModalContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialTab: 'signin' | 'signup';
  setInitialTab: (tab: 'signin' | 'signup') => void;
};

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<'signin' | 'signup'>('signin');

  const value = {
    isOpen,
    setIsOpen,
    initialTab,
    setInitialTab,
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};
