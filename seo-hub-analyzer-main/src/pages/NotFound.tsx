import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ErrorIllustration } from "@/components/ui/ErrorIllustration";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f5f4ed] px-4 font-sans">
      <div className="text-center max-w-md w-full">
        <ErrorIllustration type="404" className="w-56 h-56 mx-auto mb-4" />
        <h1 className="mb-2 text-3xl font-serif text-[#141413] tracking-tight">Page Not Found</h1>
        <p className="mb-8 text-[15px] text-[#87867f]">We couldn't find the page you're looking for. It might have been moved or deleted.</p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-[#c96442] text-white text-[14px] font-medium transition-colors hover:bg-[#d97757]"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
