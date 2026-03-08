import { createContext, useContext } from 'react';
import type { Member } from '../types';

export interface AppSessionContextValue {
  currentUser: Member | null;
  setCurrentUser: (member: Member | null) => void;
  openLogin: () => void;
}

export const AppSessionContext = createContext<AppSessionContextValue | null>(null);

export function useAppSession(): AppSessionContextValue {
  const context = useContext(AppSessionContext);
  if (!context) {
    throw new Error('useAppSession must be used within AppSessionContext.Provider');
  }
  return context;
}
