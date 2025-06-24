import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Html5QrcodeSupportedFormats } from "html5-qrcode";
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
    try {
      scannerRef.current = new Html5Qrcode(containerId);
      await scannerRef.current.start(
        /* camera config */ { facingMode: 'environment' },
        /* options    */  {
          fps: 10,
          qrbox: { width: 250, height: 250 }
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
    } catch (e) {
      console.error(e);
      setError('Não foi possível acessar a câmera.');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            className="relative aspect-square bg-black rounded-lg overflow-hidden"
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
