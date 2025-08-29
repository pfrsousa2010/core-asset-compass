import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScan }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'html5qr-code-full-region';
  const [error, setError] = useState<string | null>(null);

  /* ---------- iniciar / parar ---------- */
  const start = async () => {
    if (scannerRef.current) return;        // já iniciado
    
    // Verificar se o container existe
    const container = document.getElementById(containerId);
    if (!container) {
      setError('Container da câmera não encontrado.');
      return;
    }

    try {
      scannerRef.current = new Html5Qrcode(containerId);
      
      // Primeiro, tentar com configurações básicas
      let constraints = { facingMode: 'environment' };

      try {
        await scannerRef.current.start(
          constraints,
          /* options    */  {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false
          },
          (decodedText) => {
            onScan(decodedText);
            stop();   // encerra após 1ª leitura
            onClose();
          },
          (err) => {
            // erros de leitura acontecem a todo frame – ignore
          },
        );
        
        setError(null); // Limpar erro se existir
        
      } catch (startError) {
        // Se falhar, tentar sem constraints específicos
        await scannerRef.current.start(
          undefined, // Sem constraints específicos
          /* options    */  {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false
          },
          (decodedText) => {
            onScan(decodedText);
            stop();   // encerra após 1ª leitura
            onClose();
          },
          (err) => {
            // erros de leitura acontecem a todo frame – ignore
          },
        );
        
        setError(null); // Limpar erro se existir
      }
      
    } catch (e) {
      // Mensagens de erro mais específicas
      if (e instanceof Error) {
        if (e.name === 'NotAllowedError') {
          setError('Permissão de câmera negada. Permita o acesso à câmera.');
        } else if (e.name === 'NotFoundError') {
          setError('Câmera não encontrada no dispositivo.');
        } else if (e.name === 'NotSupportedError') {
          setError('Câmera não suportada neste dispositivo.');
        } else if (e.message.includes('getUserMedia')) {
          setError('Erro ao acessar câmera. Verifique as permissões do navegador.');
        } else {
          setError(`Erro ao acessar câmera: ${e.message}`);
        }
      } else {
        setError('Não foi possível acessar a câmera. Verifique as permissões.');
      }
    }
  };

  const stop = async () => {
    if (scannerRef.current?.getState() === Html5QrcodeScannerState.SCANNING) {
      await scannerRef.current?.stop();
    }
    scannerRef.current?.clear();
    scannerRef.current = null;
  };

  /* ---------- ciclo de vida ---------- */
  useEffect(() => {
    let raf: number;

    const safeStart = () => {
      // só inicia se o container já estiver no DOM
      const el = document.getElementById(containerId);
      if (el) start();
      else raf = requestAnimationFrame(safeStart);
    };

    if (isOpen) safeStart();
    else stop();

    return () => {
      cancelAnimationFrame(raf);
      stop();
    };
  }, [isOpen]);

  /* ---------- UI ---------- */
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Escanear Código
          </DialogTitle>
          <DialogDescription>
            Suporta QR code e códigos de barras comuns.
            <br />
            <span className="text-xs text-gray-500">
              💡 Dica: Mantenha a câmera a 15 ou 20 cm do código para melhor foco
            </span>
            <br />
            <span className="text-xs text-gray-500">
              👆 Toque na tela para focar em um ponto específico
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            id={containerId}
            className="relative aspect-square bg-black rounded-lg overflow-hidden cursor-pointer"
            onClick={async (e) => {
              // Implementar foco por toque usando API moderna
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              
              // Normalizar coordenadas para 0-1
              const normalizedX = x / rect.width;
              const normalizedY = y / rect.height;
              
              try {
                // Tentar usar a API de foco por coordenadas se disponível
                const videoElement = document.querySelector(`#${containerId} video`) as HTMLVideoElement;
                if (videoElement && videoElement.srcObject) {
                  const stream = videoElement.srcObject as MediaStream;
                  const track = stream.getVideoTracks()[0];
                  
                  if (track && track.getCapabilities) {
                    const capabilities = track.getCapabilities();
                    
                    // Verificar se suporta foco por coordenadas (usando any para compatibilidade)
                    const trackCapabilities = capabilities as any;
                    if (trackCapabilities.focusMode && trackCapabilities.focusMode.includes('manual')) {
                      // Tentar focar no ponto tocado
                      await track.applyConstraints({
                        advanced: [{
                          focusMode: 'manual',
                          focusDistance: 0.1, // Foco próximo
                          pointsOfInterest: [{ x: normalizedX, y: normalizedY }]
                        } as any]
                      });
                      
                      // Voltar para auto-foco após um tempo
                      setTimeout(async () => {
                        try {
                          await track.applyConstraints({
                            advanced: [{ focusMode: 'continuous' } as any]
                          });
                        } catch (err) {
                          // console.log('Erro ao voltar para auto-foco');
                        }
                      }, 2000);
                    }
                  }
                }
              } catch (err) {
                // console.log('Foco por toque não suportado nesta câmera:', err);
              }
            }}
          />
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </p>
          )}
          <Button
            variant="outline"
            onClick={() => {
              stop();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2"
          >
            <X className="h-4 w-4" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
