import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/seohub/AuthModal";

const Navbar = () => {
  const { pathname } = useLocation();
  const lastScrollY = useRef(0);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, profile, isLoading, signOut } = useAuth();
  const isHome = pathname === "/";

  const sectionHref = (id: string) => (isHome ? `#${id}` : `/#${id}`);
  const heroHref = sectionHref("hero");
  const links = [
    { label: "Features", href: sectionHref("features") },
    { label: "How It Works", href: sectionHref("workflow") },
    { label: "Pricing", to: "/pricing" },
    { label: "Blog", to: "/blog" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const scrollingUp = currentY < lastScrollY.current;

      setScrolled(currentY > 16);
      setVisible(currentY < 40 || scrollingUp || open);
      lastScrollY.current = currentY;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      setVisible(true);
    }
  }, [open]);

  const isDarkPage = pathname === "/blog";
  
  // Theme variables
  const bgScrolledClass = isDarkPage ? "bg-[#141413] border-[#30302e]" : "bg-[#f5f4ed] border-[#e8e6dc]";
  const bgTransparentClass = "bg-transparent border-transparent";
  const textMutedClass = isDarkPage ? "text-[#b0aea5]" : "text-[#5e5d59]";
  const textHoverClass = isDarkPage ? "text-[#faf9f5]" : "text-[#141413]";
  const borderHoverClass = isDarkPage ? "after:bg-[#faf9f5]" : "after:bg-[#141413]";
  const menuIconClass = isDarkPage ? "text-[#faf9f5]" : "text-[#141413]";

  if (pathname === "/report") return null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transform transition-transform duration-500 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      <div
        className={`transition-colors duration-300 border-b ${
          scrolled || open ? bgScrolledClass : bgTransparentClass
        }`}
      >
        <div className="container-page relative">
          <div className="flex h-[76px] items-center gap-4">
            <Link to={heroHref} className="shrink-0" aria-label="Go to homepage hero">
              <BrandLogo variant={isDarkPage ? "light" : "dark"} className="gap-2.5" iconClassName="h-9 w-9" />
            </Link>

            <nav className="mx-auto hidden items-center gap-8 lg:flex">
              {links.map((link) => (
                <Link
                  key={link.label}
                  to={(link as { to?: string }).to ?? (link as { href?: string }).href ?? '/'}
                  className={`relative py-2 text-[13px] font-medium tracking-[0.02em] transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:transition-all after:duration-200 hover:after:w-full ${textMutedClass} hover:${textHoverClass} ${borderHoverClass}`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/about"
                className={`relative py-2 text-[13px] font-medium tracking-[0.02em] transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-px after:transition-all after:duration-200 ${
                  pathname === "/about"
                    ? `${textHoverClass} after:w-full ${borderHoverClass}`
                    : `${textMutedClass} hover:${textHoverClass} after:w-0 hover:after:w-full ${borderHoverClass}`
                }`}
              >
                About Us
              </Link>
              <Link
                to="/sample-report"
                className={`relative py-2 text-[13px] font-medium tracking-[0.02em] transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-px after:transition-all after:duration-200 ${
                  pathname === "/sample-report"
                    ? `${textHoverClass} after:w-full ${borderHoverClass}`
                    : `${textMutedClass} hover:${textHoverClass} after:w-0 hover:after:w-full ${borderHoverClass}`
                }`}
              >
                Sample Report
              </Link>
              <Link
                to="/blog"
                className={`relative py-2 text-[13px] font-medium tracking-[0.02em] transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-px after:transition-all after:duration-200 ${
                  pathname.startsWith("/blog")
                    ? `${textHoverClass} after:w-full ${borderHoverClass}`
                    : `${textMutedClass} hover:${textHoverClass} after:w-0 hover:after:w-full ${borderHoverClass}`
                }`}
              >
                Blog
              </Link>
            </nav>

            <div className="ml-auto hidden items-center gap-4 md:flex">
              {isLoading ? (
                <div className="flex items-center gap-4">
                  <div className={`h-8 w-16 rounded-full animate-pulse ${isDarkPage ? 'bg-[#30302e]' : 'bg-[#e8e6dc]'}`} />
                  <div className={`h-10 w-32 rounded-full animate-pulse ${isDarkPage ? 'bg-[#faf9f5]/20' : 'bg-[#141413]/10'}`} />
                </div>
              ) : !user ? (
                <>
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className={`text-[13px] font-medium tracking-[0.02em] transition-colors duration-200 ${textMutedClass} hover:${textHoverClass}`}
                  >
                    Log in
                  </button>
                  <Link
                    to={heroHref}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium tracking-[0.01em] transition-all duration-200 hover:-translate-y-0.5 ${
                      isDarkPage 
                        ? "bg-[#faf9f5] text-[#141413] hover:bg-[#e8e6dc] shadow-[0_0_0_1px_#faf9f5]" 
                        : "bg-[#141413] text-[#faf9f5] hover:bg-[#30302e] shadow-[0_0_0_1px_#141413]"
                    }`}
                  >
                    Start free scan
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className={`flex items-center gap-3 rounded-full pl-3 pr-1.5 py-1.5 border transition-colors ${
                      isDarkPage 
                        ? "border-[#30302e] hover:bg-[#20201f] text-[#faf9f5]" 
                        : "border-[#e8e6dc] bg-white hover:bg-[#f0eee6] text-[#141413]"
                    }`}
                  >
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                      profile?.tier === "pro" || profile?.tier === "scale" 
                        ? "bg-[#fefce8] text-[#a16207]" 
                        : "bg-[#f0eee6] text-[#5e5d59]"
                    }`}>
                      {profile?.tier}
                    </span>
                    <span className="text-[13px] font-medium tracking-[0.02em]">
                      {profile?.credits_remaining} <span className="opacity-60 hidden lg:inline">credits</span>
                    </span>
                    <div className="h-7 w-7 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center text-[12px] font-bold">
                      {profile?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </button>
                  
                  {profileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e8e6dc] rounded-[16px] shadow-lg py-2 z-50">
                        <div className="px-4 py-3 border-b border-[#f0eee6] mb-2">
                          <p className="text-[14px] font-semibold text-[#141413] truncate">{profile?.name}</p>
                          <p className="text-[12px] text-[#87867f] truncate">{profile?.email}</p>
                        </div>
                        <Link 
                          to="/dashboard" 
                          onClick={() => setProfileMenuOpen(false)} 
                          className="flex items-center px-4 py-2 text-[13px] font-medium text-[#141413] hover:bg-[#faf9f5]"
                        >
                          <UserIcon className="w-4 h-4 mr-2 text-[#87867f]" />
                          Dashboard
                        </Link>
                        <button 
                          onClick={() => { setProfileMenuOpen(false); signOut(); }} 
                          className="w-full flex items-center px-4 py-2 text-[13px] font-medium text-[#c96442] hover:bg-[#fff5f2]"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              className={`ml-auto rounded-full p-2 transition-colors md:hidden ${menuIconClass} hover:bg-[#87867f]/10`}
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {open && (
            <div className={`border-t pb-5 pt-3 md:hidden ${isDarkPage ? 'border-[#30302e]' : 'border-[#e8e6dc]'}`}>
              <div className="flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    to={(link as { to?: string }).to ?? (link as { href?: string }).href ?? '/'}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between py-3 text-[15px] font-medium ${textHoverClass}`}
                  >
                    {link.label}
                    <ArrowRight className="h-4 w-4 text-[#87867f]" />
                  </Link>
                ))}

                <Link
                  to="/about"
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between py-3 text-[15px] font-medium ${textHoverClass}`}
                >
                  About Us
                  <ArrowRight className="h-4 w-4 text-[#87867f]" />
                </Link>

                <Link
                  to="/sample-report"
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between py-3 text-[15px] font-medium ${textHoverClass}`}
                >
                  Sample Report
                  <ArrowRight className="h-4 w-4 text-[#87867f]" />
                </Link>

                <Link
                  to="/blog"
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between py-3 text-[15px] font-medium ${textHoverClass}`}
                >
                  Blog
                  <ArrowRight className="h-4 w-4 text-[#87867f]" />
                </Link>

                {isLoading ? (
                  <div className="flex flex-col gap-3 py-3">
                    <div className={`h-8 w-24 rounded-full animate-pulse ${isDarkPage ? 'bg-[#30302e]' : 'bg-[#e8e6dc]'}`} />
                    <div className={`h-12 w-full rounded-full animate-pulse mt-1 ${isDarkPage ? 'bg-[#faf9f5]/20' : 'bg-[#141413]/10'}`} />
                  </div>
                ) : !user ? (
                  <>
                    <button
                      onClick={() => { setOpen(false); setAuthModalOpen(true); }}
                      className={`flex items-center justify-between py-3 text-[15px] font-medium ${textHoverClass}`}
                    >
                      Log in
                    </button>
                    <Link
                      to={heroHref}
                      onClick={() => setOpen(false)}
                      className={`mt-3 inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[15px] font-medium ${
                        isDarkPage ? "bg-[#faf9f5] text-[#141413]" : "bg-[#141413] text-[#faf9f5]"
                      }`}
                    >
                      Start free scan
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between py-3 text-[15px] font-medium ${textHoverClass}`}
                    >
                      Dashboard
                      <ArrowRight className="h-4 w-4 text-[#87867f]" />
                    </Link>
                    <button
                      onClick={() => { setOpen(false); signOut(); }}
                      className="flex items-center justify-between py-3 text-[15px] font-medium text-[#c96442]"
                    >
                      Sign out
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
      />
    </header>
  );
};

export default Navbar;
