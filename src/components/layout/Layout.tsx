import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useLimitNotifications } from '@/hooks/useLimitNotifications';
import { createContext, useRef } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const ScrollContext = createContext<React.RefObject<HTMLDivElement> | null>(null);

export function Layout({ children }: LayoutProps) {
  const mainRef = useRef<HTMLDivElement>(null);
  
  // Inicializar notificações de limite
  useLimitNotifications();

  return (
    <ScrollContext.Provider value={mainRef}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main
            ref={mainRef}                       /* ← ref aqui */
            className="flex-1 overflow-y-auto bg-gray-50 px-4 md:px-6 pt-6 pb-20"
          >
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </ScrollContext.Provider>
  );
}
