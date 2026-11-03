import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getLenisInstance } from "@/lib/lenisInstance";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const lenis = getLenisInstance();

    // If there's a hash (e.g. /#features), scroll to that section smoothly
    if (hash) {
      // Allow a brief delay for DOM render / page transition
      const id = setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          if (lenis) {
            // Use Lenis for smooth scroll (respects ongoing animation)
            lenis.scrollTo(el as HTMLElement, { offset: -80, duration: 1.2 });
          } else {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }, 80);
      return () => clearTimeout(id);
    }

    // No hash — reset to top of page immediately
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
      document.documentElement.scrollTo(0, 0);
      document.body.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

