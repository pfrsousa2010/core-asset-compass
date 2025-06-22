
import { useState, useEffect } from 'react';

export function useDevice() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent;
      
      // Verificar se é mobile (até 768px)
      const mobile = width < 768;
      
      // Verificar se é tablet (768px a 1024px)
      const tablet = width >= 768 && width <= 1024;
      
      // Verificar se é desktop (acima de 1024px)
      const desktop = width > 1024;
      
      // Também verificar pelo user agent para dispositivos móveis
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      setIsMobile(mobile || (isMobileDevice && !tablet));
      setIsTablet(tablet);
      setIsDesktop(desktop && !isMobileDevice);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet: isMobile || isTablet
  };
}
