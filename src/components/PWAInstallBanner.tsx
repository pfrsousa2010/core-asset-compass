import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package, X, Download } from 'lucide-react';

export function PWAInstallBanner() {
  const { isInstallable, showInstallPrompt, setShowInstallPrompt, installApp } = usePWA();

  if (!isInstallable || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-4 md:right-auto md:w-80">
      <Card className="shadow-lg border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-600 p-2 rounded-full flex-shrink-0">
              <Package className="h-5 w-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">
                Instalar Armazena
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Instale o app na tela inicial para acesso rápido e funcionalidade offline
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={installApp}
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Instalar
                </Button>
                
                <Button
                  onClick={() => setShowInstallPrompt(false)}
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