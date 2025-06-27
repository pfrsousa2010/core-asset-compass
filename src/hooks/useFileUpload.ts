import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo CSV",
        variant: "destructive",
      });
    }
  };

  const removeFile = () => {
    setFile(null);
    setInputKey(prev => prev + 1);
  };

  const resetFile = () => {
    setFile(null);
    setInputKey(prev => prev + 1);
  };

  return {
    file,
    inputKey,
    handleFileChange,
    removeFile,
    resetFile,
    setFile
  };
}; 