import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';
import { sendAppUpdateNotification } from '@/lib/notification-service';

export function PWAUpdateBanner() {
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  useEffect(() => {
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdateBanner(true);
        // Enviar notificação de atualização para todos os usuários
        sendAppUpdateNotification();
      });
    }
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  if (!showUpdateBanner) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-4 md:right-auto md:w-80">
      <Card className="shadow-lg border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-600 p-2 rounded-full flex-shrink-0">
              <RefreshCw className="h-5 w-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">
                Nova versão disponível
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Uma nova versão do Armazena está disponível. Atualize para obter as últimas funcionalidades.
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdate}
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                
                <Button
                  onClick={() => setShowUpdateBanner(false)}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 