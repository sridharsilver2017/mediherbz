import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-6 right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#18833B] hover:bg-[#12632F] text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 border-2 border-white/60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#A6C928]"
    >
      <ArrowUp className="w-5 h-5 text-white" />
    </button>
  );
};
