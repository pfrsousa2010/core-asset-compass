import { useState, useEffect, useCallback } from 'react';

interface UseScrollToTopReturn {
  showScrollToTop: boolean;
  scrollToTop: () => void;
}

export function useScrollToTop(scrollElement: HTMLElement | null): UseScrollToTopReturn {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const handleScroll = useCallback(() => {
    if (!scrollElement) return;
    setShowScrollToTop(scrollElement.scrollTop > 300);
  }, [scrollElement]);

  const scrollToTop = useCallback(() => {
    scrollElement?.scrollTo({ top: 0, behavior: "smooth" });
  }, [scrollElement]);

  useEffect(() => {
    if (!scrollElement) return;

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [scrollElement, handleScroll]);

  return {
    showScrollToTop,
    scrollToTop,
  };
} 