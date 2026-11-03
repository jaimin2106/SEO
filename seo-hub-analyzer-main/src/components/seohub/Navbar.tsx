import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowRight,
  Menu,
  X,
  User as UserIcon,
  LogOut,
} from "lucide-react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import BrandLogo from "./BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/seohub/AuthModal";

type NavigationItem = {
  label: string;
  href: string;
  type: "route" | "section";
};

const Navbar = () => {
  const { pathname } = useLocation();

  const {
    user,
    profile,
    isLoading,
    signOut,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);

  const lastScrollY = useRef(0);
  const scrollTicking = useRef(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/";
  const isDarkPage = pathname.startsWith("/blog");

  const sectionHref = useCallback(
    (id: string) => (isHome ? `#${id}` : `/#${id}`),
    [isHome]
  );

  const navigation: NavigationItem[] = [
    {
      label: "Features",
      href: sectionHref("features"),
      type: "section",
    },
    {
      label: "How It Works",
      href: sectionHref("workflow"),
      type: "section",
    },
    {
      label: "Pricing",
      href: "/pricing",
      type: "route",
    },
    {
      label: "About Us",
      href: "/about",
      type: "route",
    },
    {
      label: "Sample Report",
      href: "/sample-report",
      type: "route",
    },
    {
      label: "Blog",
      href: "/blog",
      type: "route",
    },
  ];

  // Theme configuration
  const theme = {
    background: isDarkPage
      ? "bg-[#141413] border-[#30302e]"
      : "bg-[#f5f4ed] border-[#e8e6dc]",

    text: isDarkPage
      ? "text-[#b0aea5]"
      : "text-[#5e5d59]",

    textHover: isDarkPage
      ? "hover:text-[#faf9f5]"
      : "hover:text-[#141413]",

    activeText: isDarkPage
      ? "text-[#faf9f5]"
      : "text-[#141413]",

    border: isDarkPage
      ? "after:bg-[#faf9f5]"
      : "after:bg-[#141413]",

    menuIcon: isDarkPage
      ? "text-[#faf9f5]"
      : "text-[#141413]",

    button: isDarkPage
      ? "bg-[#faf9f5] text-[#141413] hover:bg-[#e8e6dc]"
      : "bg-[#141413] text-[#faf9f5] hover:bg-[#30302e]",
  };

  const isActive = (item: NavigationItem) => {
    if (item.type === "section") {
      return false;
    }

    if (item.href === "/blog") {
      return pathname.startsWith("/blog");
    }

    return pathname === item.href;
  };

  // Scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      if (scrollTicking.current) return;

      scrollTicking.current = true;

      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const previousY = lastScrollY.current;
        const difference = currentY - previousY;

        setScrolled(currentY > 16);

        if (mobileMenuOpen || currentY < 40) {
          setVisible(true);
        } else if (Math.abs(difference) > 6) {
          setVisible(difference < 0);
        }

        lastScrollY.current = currentY;
        scrollTicking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mobileMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  // Close menus on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setMobileMenuOpen(false);
      setProfileMenuOpen(false);
      setAuthModalOpen(false);
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Outside click handling
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(target)
      ) {
        setProfileMenuOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Lock body scrolling while mobile menu is open
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);

    await signOut();
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Hide navbar on report page
  if (pathname === "/report") {
    return null;
  }

  const renderNavigationLink = (
    item: NavigationItem,
    mobile = false
  ) => {
    const active = isActive(item);

    const className = mobile
      ? `flex items-center justify-between py-3 text-[15px] font-medium transition-colors ${
          active ? theme.activeText : theme.text
        } hover:text-[#141413]`
      : `relative py-2 text-[13px] font-medium tracking-[0.02em] transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-px after:transition-all after:duration-200 ${
          active
            ? `${theme.activeText} after:w-full ${theme.border}`
            : `${theme.text} ${theme.textHover} after:w-0 hover:after:w-full ${theme.border}`
        }`;

    return (
      <Link
        key={item.label}
        to={item.href}
        onClick={mobile ? closeMobileMenu : undefined}
        aria-current={active ? "page" : undefined}
        className={className}
      >
        {item.label}

        {mobile && (
          <ArrowRight className="h-4 w-4 text-[#87867f]" />
        )}
      </Link>
    );
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transform transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{
          transitionTimingFunction:
            "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          className={`border-b transition-colors duration-300 ${
            scrolled || mobileMenuOpen
              ? theme.background
              : "bg-transparent border-transparent"
          }`}
        >
          <div className="container-page relative">
            {/* Main navbar */}
            <div className="flex h-[76px] items-center gap-4">
              {/* Logo */}
              <Link
                to="/"
                className="shrink-0"
                aria-label="SEO Hub Analyzer homepage"
              >
                <BrandLogo
                  variant={isDarkPage ? "light" : "dark"}
                  className="gap-2.5"
                  iconClassName="h-9 w-9"
                />
              </Link>

              {/* Desktop navigation */}
              <nav
                aria-label="Main navigation"
                className="mx-auto hidden items-center gap-6 xl:flex"
              >
                {navigation.map((item) =>
                  renderNavigationLink(item)
                )}
              </nav>

              {/* Desktop actions */}
              <div className="ml-auto hidden items-center gap-4 lg:flex">
                {isLoading ? (
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-16 animate-pulse rounded-full bg-[#e8e6dc]" />
                    <div className="h-10 w-32 animate-pulse rounded-full bg-[#141413]/10" />
                  </div>
                ) : !user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setAuthModalOpen(true)}
                      className={`text-[13px] font-medium transition-colors ${theme.text} ${theme.textHover}`}
                    >
                      Log in
                    </button>

                    <Link
                      to={sectionHref("hero")}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-all duration-200 hover:-translate-y-0.5 ${theme.button}`}
                    >
                      Start free scan
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <div
                    ref={profileMenuRef}
                    className="relative"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setProfileMenuOpen((previous) => !previous)
                      }
                      aria-expanded={profileMenuOpen}
                      aria-haspopup="menu"
                      className={`flex items-center gap-3 rounded-full border py-1.5 pl-3 pr-1.5 transition-colors ${
                        isDarkPage
                          ? "border-[#30302e] text-[#faf9f5] hover:bg-[#20201f]"
                          : "border-[#e8e6dc] bg-white text-[#141413] hover:bg-[#f0eee6]"
                      }`}
                    >
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                          profile?.tier === "pro" ||
                          profile?.tier === "scale"
                            ? "bg-[#fefce8] text-[#a16207]"
                            : "bg-[#f0eee6] text-[#5e5d59]"
                        }`}
                      >
                        {profile?.tier ?? "free"}
                      </span>

                      <span className="text-[13px] font-medium">
                        {profile?.credits_remaining ?? 0}
                        <span className="ml-1 hidden opacity-60 lg:inline">
                          credits
                        </span>
                      </span>

                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#141413] text-[12px] font-bold text-[#faf9f5]">
                        {profile?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    </button>

                    {profileMenuOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 z-[60] mt-2 w-56 rounded-[16px] border border-[#e8e6dc] bg-white py-2 shadow-xl"
                      >
                        <div className="mb-2 border-b border-[#f0eee6] px-4 py-3">
                          <p className="truncate text-[14px] font-semibold text-[#141413]">
                            {profile?.name || "User"}
                          </p>

                          <p className="truncate text-[12px] text-[#87867f]">
                            {profile?.email || user.email}
                          </p>
                        </div>

                        <Link
                          role="menuitem"
                          to="/dashboard"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-[13px] font-medium text-[#141413] hover:bg-[#faf9f5]"
                        >
                          <UserIcon className="mr-2 h-4 w-4 text-[#87867f]" />
                          Dashboard
                        </Link>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleSignOut}
                          className="flex w-full items-center px-4 py-2 text-[13px] font-medium text-[#c96442] hover:bg-[#fff5f2]"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                type="button"
                className={`ml-auto rounded-full p-2 transition-colors hover:bg-[#87867f]/10 lg:hidden ${theme.menuIcon}`}
                onClick={() =>
                  setMobileMenuOpen((previous) => !previous)
                }
                aria-label={
                  mobileMenuOpen ? "Close menu" : "Open menu"
                }
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Mobile navigation */}
            {mobileMenuOpen && (
              <div
                id="mobile-navigation"
                ref={mobileMenuRef}
                className={`fixed inset-x-0 top-[76px] z-50 max-h-[calc(100dvh-76px)] overflow-y-auto border-t px-6 pb-8 pt-4 lg:hidden ${
                  isDarkPage
                    ? "border-[#30302e] bg-[#141413]"
                    : "border-[#e8e6dc] bg-[#f5f4ed]"
                }`}
              >
                <nav
                  aria-label="Mobile navigation"
                  className="flex flex-col gap-1"
                >
                  {navigation.map((item) =>
                    renderNavigationLink(item, true)
                  )}

                  <div
                    className={`my-3 border-t ${
                      isDarkPage
                        ? "border-[#30302e]"
                        : "border-[#e8e6dc]"
                    }`}
                  />

                  {isLoading ? (
                    <div className="flex flex-col gap-3 py-3">
                      <div className="h-8 w-24 animate-pulse rounded-full bg-[#e8e6dc]" />
                      <div className="h-12 w-full animate-pulse rounded-full bg-[#141413]/10" />
                    </div>
                  ) : !user ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          closeMobileMenu();
                          setAuthModalOpen(true);
                        }}
                        className={`py-3 text-left text-[15px] font-medium ${theme.text} ${theme.textHover}`}
                      >
                        Log in
                      </button>

                      <Link
                        to={sectionHref("hero")}
                        onClick={closeMobileMenu}
                        className={`mt-3 inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[15px] font-medium ${theme.button}`}
                      >
                        Start free scan
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="py-3">
                        <p className={`text-sm font-semibold ${theme.activeText}`}>
                          {profile?.name || "User"}
                        </p>

                        <p className={`mt-1 text-xs ${theme.text}`}>
                          {profile?.credits_remaining ?? 0} credits available
                        </p>

                        <p className={`mt-1 text-xs ${theme.text}`}>
                          {profile?.tier ?? "free"} plan
                        </p>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={closeMobileMenu}
                        className={`flex items-center justify-between py-3 text-[15px] font-medium ${theme.activeText}`}
                      >
                        Dashboard
                        <ArrowRight className="h-4 w-4 text-[#87867f]" />
                      </Link>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex items-center justify-between py-3 text-left text-[15px] font-medium text-[#c96442]"
                      >
                        Sign out
                        <LogOut className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </nav>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Authentication modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
      />
    </>
  );
};

export default Navbar;