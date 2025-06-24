import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader, BrowserCodeReader } from '@zxing/browser';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setError(null);
      setIsScanning(true);

      const devices = await BrowserCodeReader.listVideoInputDevices();

      if (devices.length === 0) {
        setError("Nenhuma câmera foi encontrada.");
        setIsScanning(false);
        return;
      }

      const deviceId = devices[0].deviceId;

      readerRef.current = new BrowserMultiFormatReader();

      await readerRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (result, error) => {
          if (result) {
            const code = result.getText();
            onScan(code);
            stopScanning();
            onClose();
          }
        }
      );
    } catch (err) {
      console.error("Erro ao iniciar leitura:", err);
      setError("Não foi possível acessar a câmera.");
      console.error("Erro ao iniciar leitura:", err);
      setError("Não foi possível acessar a câmera.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Escanear Código
          </DialogTitle>
        </DialogHeader>


        <div className="space-y-4">
          <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />


          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="text-sm text-gray-600 text-center">
            {isScanning ? (
              'Posicione o código de barras ou QR code na frente da câmera'
            ) : (
              'Preparando câmera...'
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            {!isScanning && error && (
              <Button onClick={startScanning} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
