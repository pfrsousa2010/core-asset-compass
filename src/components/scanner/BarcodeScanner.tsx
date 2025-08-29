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
      
      // Obter todas as câmeras disponíveis para encontrar a de maior resolução
      const devices = await Html5Qrcode.getCameras();
      let selectedDeviceId: string | undefined;
      
      if (devices && devices.length > 0) {
        // Tentar encontrar a câmera traseira (environment) primeiro
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('traseira') ||
          device.label.toLowerCase().includes('environment')
        );
        
        if (backCamera) {
          selectedDeviceId = backCamera.id;
        } else {
          // Se não encontrar câmera traseira, usar a primeira disponível
          selectedDeviceId = devices[0].id;
        }
      }

      // Configurações para máxima resolução e auto-foco
      const constraints = selectedDeviceId ? {
        deviceId: { exact: selectedDeviceId }
      } : {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      };

      try {
        await scannerRef.current.start(
          constraints,
          /* options    */  {
            fps: 15, // Reduzido para estabilidade em câmeras com foco lento
            qrbox: { width: 400, height: 400 }, // Área de captura maior para QR codes menores
            aspectRatio: 1.0,
            disableFlip: false // Habilita ajuste dinâmico de brilho
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
        
        // Configurar auto-foco contínuo após iniciar
        setTimeout(() => {
          configureAutoFocus();
        }, 1000);
        
      } catch (startError) {
        // Se falhar com deviceId específico, tentar com configurações básicas
        await scannerRef.current.start(
          { facingMode: 'environment' },
          /* options    */  {
            fps: 15,
            qrbox: { width: 400, height: 400 },
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
        
        // Configurar auto-foco contínuo após iniciar
        setTimeout(() => {
          configureAutoFocus();
        }, 1000);
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

  // Função para configurar auto-foco contínuo
  const configureAutoFocus = async () => {
    try {
      const videoElement = document.querySelector(`#${containerId} video`) as HTMLVideoElement;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        
        if (track && track.getCapabilities) {
          const capabilities = track.getCapabilities();
          const trackCapabilities = capabilities as any;
          
          // Verificar se suporta foco automático
          if (trackCapabilities.focusMode && trackCapabilities.focusMode.includes('continuous')) {
            await track.applyConstraints({
              advanced: [{ focusMode: 'continuous' } as any]
            });
          }
        }
      }
    } catch (err) {
      // console.log('Auto-foco não suportado nesta câmera');
    }
  };

  // Função para focar em um ponto específico
  const focusAtPoint = async (normalizedX: number, normalizedY: number) => {
    try {
      const videoElement = document.querySelector(`#${containerId} video`) as HTMLVideoElement;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        
        if (track && track.getCapabilities) {
          const capabilities = track.getCapabilities();
          const trackCapabilities = capabilities as any;
          
          // Verificar se suporta foco manual
          if (trackCapabilities.focusMode && trackCapabilities.focusMode.includes('manual')) {
            // Aplicar foco manual no ponto tocado
            await track.applyConstraints({
              advanced: [{
                focusMode: 'manual',
                focusDistance: 0.1,
                pointsOfInterest: [{ x: normalizedX, y: normalizedY }]
              } as any]
            });
            
            // Voltar para auto-foco após 3 segundos
            setTimeout(async () => {
              try {
                await track.applyConstraints({
                  advanced: [{ focusMode: 'continuous' } as any]
                });
              } catch (err) {
                // console.log('Erro ao voltar para auto-foco');
              }
            }, 3000);
          }
        }
      }
    } catch (err) {
      // console.log('Foco manual não suportado nesta câmera');
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
              
              // Focar no ponto tocado
              await focusAtPoint(normalizedX, normalizedY);
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
