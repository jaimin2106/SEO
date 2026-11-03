import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

// Augment the global window type to hold our Lenis instance
declare global {
  interface Window {
    lenis?: Lenis;
  }
}

const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  useEffect(() => {
    // CRITICAL FIX: Disable Lenis globally in the admin panel AND report page.
    // Lenis intercepts all wheel events and calls preventDefault().
    // In an app-shell layout where body overflow is hidden and child 
    // containers scroll independently, Lenis breaks all scrolling.
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/report')) {
      window.lenis = undefined;
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    });

    // Expose globally so ScrollToTop can trigger hash-based smooth scrolls
    window.lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      window.lenis = undefined;
    };
  }, [location.pathname]);

  return <>{children}</>;
};

export default SmoothScroll;
