import React, { createContext, useState, useCallback, ReactNode } from 'react';

interface NotificationContextType {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playSound: (type: 'new' | 'completed' | 'failed') => void;
}

const soundFiles = {
  new: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
  completed: 'https://actions.google.com/sounds/v1/coins/cash_register_fake.ogg',
  failed: 'https://actions.google.com/sounds/v1/emergency/beeper_emergency.ogg',
};

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationSoundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleSound = () => {
    const newValue = !isSoundEnabled;
    setIsSoundEnabled(newValue);
    localStorage.setItem('notificationSoundEnabled', JSON.stringify(newValue));
  };

  const playSound = useCallback((type: 'new' | 'completed' | 'failed') => {
    if (isSoundEnabled) {
      const audio = new Audio(soundFiles[type]);
      audio.play().catch(error => console.error("Error playing sound:", error));
    }
  }, [isSoundEnabled]);

  return (
    <NotificationContext.Provider value={{ isSoundEnabled, toggleSound, playSound }}>
      {children}
    </NotificationContext.Provider>
  );
};
