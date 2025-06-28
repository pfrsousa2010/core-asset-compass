import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-4 md:right-auto md:w-80">
      <Alert className="border-orange-200 bg-orange-50">
        <WifiOff className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          Você está offline. Algumas funcionalidades podem não estar disponíveis.
        </AlertDescription>
      </Alert>
    </div>
  );
} 