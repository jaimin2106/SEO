
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowRight,
  ChevronDown,
  LogOut,
  Menu,
  User as UserIcon,
  X,
} from "lucide-react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import BrandLogo from "./BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/seohub/AuthModal";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type NavigationItem = {
  label: string;
  href: string;
  type: "route" | "section";
};

type NavbarTheme = {
  logo: "light" | "dark";
  background: string;
  transparent: string;
  text: string;
  activeText: string;
  textHover: string;
  underline: string;
  icon: string;
  iconHover: string;
  button: string;
  buttonHover: string;
  panel: string;
  panelBorder: string;
  mobileText: string;
  mobileActive: string;
  divider: string;
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const Navbar = () => {
  const { pathname, hash } = useLocation();

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

  const headerRef = useRef<HTMLElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileNavigationRef = useRef<HTMLElement>(null);

  const isHome = pathname === "/";

  /*
   * Important:
   * The blog listing uses a dark background.
   * Individual blog articles use a light background.
   *
   * Do not use pathname.startsWith("/blog") here.
   */
  const isDarkSurface = pathname === "/blog";

  /* ---------------------------------------------------------------------- */
  /* Navigation                                                              */
  /* ---------------------------------------------------------------------- */

  const sectionHref = useCallback(
    (id: string) => (
      isHome ? `#${id}` : `/#${id}`
    ),
    [isHome]
  );

  const navigation: NavigationItem[] = [
    {
      label: "Features",
      href: sectionHref("features"),
      type: "section",
    },
    {
      label: "How it works",
      href: sectionHref("workflow"),
      type: "section",
    },
    {
      label: "Pricing",
      href: "/pricing",
      type: "route",
    },
    {
      label: "Sample report",
      href: "/sample-report",
      type: "route",
    },
    {
      label: "Blog",
      href: "/blog",
      type: "route",
    },
    {
      label: "About",
      href: "/about",
      type: "route",
    },
  ];

  /* ---------------------------------------------------------------------- */
  /* Theme configuration                                                    */
  /* ---------------------------------------------------------------------- */

  const theme: NavbarTheme = isDarkSurface
    ? {
        logo: "light",

        background:
          "border-[#30302e] bg-[#141413]/95 shadow-[0_8px_30px_rgba(0,0,0,0.14)]",

        transparent:
          "border-transparent bg-transparent",

        text: "text-[#aaa79e]",

        activeText: "text-[#faf9f5]",

        textHover: "hover:text-[#faf9f5]",

        underline: "after:bg-[#c96442]",

        icon: "text-[#faf9f5]",

        iconHover:
          "hover:bg-white/[0.08] hover:text-white",

        button:
          "bg-[#faf9f5] text-[#141413] border border-[#faf9f5]",

        buttonHover:
          "hover:bg-[#e8e6dc] hover:border-[#e8e6dc]",

        panel: "bg-[#141413]",

        panelBorder: "border-[#30302e]",

        mobileText: "text-[#aaa79e]",

        mobileActive: "text-[#faf9f5]",

        divider: "border-[#30302e]",
      }
    : {
        logo: "dark",

        background:
          "border-[#e8e6dc] bg-[#faf9f5]/95 shadow-[0_8px_30px_rgba(20,20,19,0.07)]",

        transparent:
          "border-transparent bg-transparent",

        text: "text-[#68665f]",

        activeText: "text-[#141413]",

        textHover: "hover:text-[#141413]",

        underline: "after:bg-[#c96442]",

        icon: "text-[#24231f]",

        iconHover:
          "hover:bg-black/[0.05] hover:text-black",

        button:
          "bg-[#141413] text-[#faf9f5] border border-[#141413]",

        buttonHover:
          "hover:bg-[#30302e] hover:border-[#30302e]",

        panel: "bg-[#faf9f5]",

        panelBorder: "border-[#e8e6dc]",

        mobileText: "text-[#68665f]",

        mobileActive: "text-[#141413]",

        divider: "border-[#e8e6dc]",
      };

  /* ---------------------------------------------------------------------- */
  /* Active navigation                                                      */
  /* ---------------------------------------------------------------------- */

  const isActive = (item: NavigationItem) => {
    if (item.type === "section") {
      if (!isHome) return false;

      const targetHash = item.href.split("#")[1];

      return hash === `#${targetHash}`;
    }

    if (item.href === "/blog") {
      return pathname === "/blog" || pathname.startsWith("/blog/");
    }

    return pathname === item.href;
  };

  /* ---------------------------------------------------------------------- */
  /* Scroll state                                                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    let ticking = false;

    const updateScrollState = () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 12);
        ticking = false;
      });
    };

    updateScrollState();

    window.addEventListener("scroll", updateScrollState, {
      passive: true,
    });

    return () => {
      window.removeEventListener(
        "scroll",
        updateScrollState
      );
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Close menus on route change                                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  /* ---------------------------------------------------------------------- */
  /* Escape key                                                             */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Outside click                                                          */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const handleOutsideClick = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;

      /*
       * The header ref contains both the hamburger button
       * and the mobile menu, preventing the trigger from
       * closing its own menu.
       */
      if (
        mobileMenuOpen &&
        headerRef.current &&
        !headerRef.current.contains(target)
      ) {
        setMobileMenuOpen(false);
      }

      if (
        profileMenuOpen &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );
    };
  }, [mobileMenuOpen, profileMenuOpen]);

  /* ---------------------------------------------------------------------- */
  /* Body scroll lock                                                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileNavigationRef.current) {
      mobileNavigationRef.current.inert = !mobileMenuOpen;
    }
  }, [mobileMenuOpen]);

  /* ---------------------------------------------------------------------- */
  /* Actions                                                                */
  /* ---------------------------------------------------------------------- */

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleSignOut = async () => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);

    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const openAuthModal = () => {
    setMobileMenuOpen(false);
    setAuthModalOpen(true);
  };

  /* ---------------------------------------------------------------------- */
  /* Navigation link renderer                                               */
  /* ---------------------------------------------------------------------- */

  const renderNavigationLink = (
    item: NavigationItem,
    mobile = false
  ) => {
    const active = isActive(item);

    const className = mobile
      ? `group flex min-h-[48px] items-center justify-between border-b py-3 text-[14px] font-medium transition-colors ${
          theme.panelBorder
        } ${
          active
            ? theme.mobileActive
            : theme.mobileText
        } hover:text-[#c96442]`
      : `group relative inline-flex items-center whitespace-nowrap py-2 text-[12px] font-medium tracking-[0.015em] transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:rounded-full after:transition-all after:duration-300 ${
          active
            ? `${theme.activeText} after:w-full ${theme.underline}`
            : `${theme.text} ${theme.textHover} after:w-0 ${theme.underline} hover:after:w-full`
        }`;

    return (
      <Link
        key={item.label}
        to={item.href}
        onClick={mobile ? closeMobileMenu : undefined}
        aria-current={active ? "page" : undefined}
        className={className}
      >
        <span>{item.label}</span>

        {mobile && (
          <ArrowRight
            className={`h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 ${
              active ? "text-[#c96442]" : theme.text
            }`}
          />
        )}
      </Link>
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Hide on report page                                                    */
  /* ---------------------------------------------------------------------- */

  if (pathname === "/report") {
    return null;
  }

  /* ---------------------------------------------------------------------- */
  /* Shared user actions                                                    */
  /* ---------------------------------------------------------------------- */

  const renderDesktopActions = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-3">
          <div className="h-9 w-16 animate-pulse rounded-full bg-current/10" />

          <div className="h-10 w-32 animate-pulse rounded-full bg-current/10" />
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex shrink-0 items-center gap-5">

          <button
            type="button"
            onClick={openAuthModal}
            className={`text-[12px] font-semibold transition-colors ${theme.text} ${theme.textHover}`}
          >
            Log in
          </button>

          <Link
            to={sectionHref("hero")}
            className={`group inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-5 text-[12px] font-semibold transition-all duration-200 hover:-translate-y-0.5 ${theme.button} ${theme.buttonHover}`}
          >
            Start free scan

            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>

        </div>
      );
    }

    return (
      <div
        ref={profileMenuRef}
        className="relative shrink-0"
      >
        <button
          type="button"
          onClick={() =>
            setProfileMenuOpen((previous) => !previous)
          }
          aria-expanded={profileMenuOpen}
          aria-haspopup="menu"
          aria-controls="profile-dropdown"
          className={`group flex min-h-10 items-center gap-3 rounded-full border py-1 pl-3 pr-1.5 transition-colors ${
            isDarkSurface
              ? "border-[#393832] bg-white/[0.035] hover:bg-white/[0.08] text-[#faf9f5]"
              : "border-[#e2dfd5] bg-white/70 hover:bg-white text-[#24231f]"
          }`}
        >
          <span
            className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${
              profile?.tier === "pro" || profile?.tier === "scale"
                ? "bg-[#fef3c7] text-[#92400e]"
                : isDarkSurface
                  ? "bg-white/10 text-[#d7d3c8]"
                  : "bg-[#f0eee6] text-[#5e5d59]"
            }`}
          >
            {profile?.tier ?? "Free"}
          </span>

          <span className="text-[12px] font-semibold tabular-nums">
            {profile?.credits_remaining ?? 0}
            <span className={`ml-1 hidden text-[10px] font-medium xl:inline ${
              isDarkSurface ? "text-[#87867f]" : "text-[#87867f]"
            }`}>
              credits
            </span>
          </span>

          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
              isDarkSurface
                ? "bg-[#faf9f5] text-[#141413]"
                : "bg-[#141413] text-[#faf9f5]"
            }`}
          >
            {profile?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <ChevronDown
            className={`mr-1 h-3.5 w-3.5 transition-transform ${
              profileMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {profileMenuOpen && (
          <div
            id="profile-dropdown"
            role="menu"
            className="absolute right-0 top-full z-[70] mt-3 w-[250px] overflow-hidden rounded-xl border border-[#e8e6dc] bg-white py-2 text-[#141413] shadow-[0_18px_50px_rgba(0,0,0,0.14)]"
          >
            <div className="border-b border-[#eeeae1] px-4 py-4">
              <p className="truncate text-[13px] font-semibold">
                {profile?.name || "Your account"}
              </p>

              <p className="mt-1 truncate text-[11px] text-[#87867f]">
                {profile?.email || user.email}
              </p>
            </div>

            <div className="px-3 py-2">
              <Link
                role="menuitem"
                to="/dashboard"
                onClick={() => setProfileMenuOpen(false)}
                className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-[12px] font-medium transition-colors hover:bg-[#f5f4ed]"
              >
                <UserIcon className="h-4 w-4 text-[#77746c]" />

                Dashboard

                <ArrowRight className="ml-auto h-3.5 w-3.5 text-[#a5a196]" />
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={() => void handleSignOut()}
                className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[12px] font-medium text-[#c15f3c] transition-colors hover:bg-[#fff4ef]"
              >
                <LogOut className="h-4 w-4" />

                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-[60] w-full"
      >
        {/* Main navigation surface */}
        <div
          className={`border-b transition-all duration-300 ${
            scrolled || mobileMenuOpen
              ? theme.background
              : theme.transparent
          }`}
        >
          <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">

            <div className="flex h-[76px] items-center gap-4">

              {/* ------------------------------------------------------ */}
              {/* Brand logo                                             */}
              {/* ------------------------------------------------------ */}

              <Link
                to="/"
                aria-label="SEO Hub Analyzer home"
                className="group inline-flex shrink-0 items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c96442] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
              >
                <BrandLogo
                  variant={theme.logo}
                  className="gap-2.5 transition-opacity duration-200 group-hover:opacity-80"
                  iconClassName="h-9 w-9 shrink-0"
                />
              </Link>

              {/* ------------------------------------------------------ */}
              {/* Desktop navigation                                    */}
              {/* ------------------------------------------------------ */}

              <nav
                aria-label="Main navigation"
                className="mx-auto hidden items-center justify-center gap-5 2xl:gap-7 xl:flex"
              >
                {navigation.map((item) =>
                  renderNavigationLink(item)
                )}
              </nav>

              {/* ------------------------------------------------------ */}
              {/* Desktop actions                                       */}
              {/* ------------------------------------------------------ */}

              <div className="hidden shrink-0 items-center justify-end xl:flex">
                {renderDesktopActions()}
              </div>

              {/* ------------------------------------------------------ */}
              {/* Mobile/tablet menu trigger                            */}
              {/* ------------------------------------------------------ */}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen((previous) => !previous);
                  setProfileMenuOpen(false);
                }}
                aria-label={
                  mobileMenuOpen ? "Close navigation" : "Open navigation"
                }
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                className={`ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors xl:hidden ${theme.icon} ${
                  isDarkSurface
                    ? "border-[#3a3933] hover:bg-white/[0.08]"
                    : "border-[#e5e2d8] hover:bg-black/[0.04]"
                }`}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MOBILE / TABLET NAVIGATION                                   */}
        {/* ============================================================ */}

        <div
          id="mobile-navigation"
          aria-hidden={!mobileMenuOpen}
          className={`fixed inset-x-0 top-[76px] z-[65] overflow-y-auto overscroll-contain border-t transition-all duration-300 xl:hidden ${
            theme.panel
          } ${theme.panelBorder} ${
            mobileMenuOpen
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-2 opacity-0 pointer-events-none"
          }`}
          style={{
            maxHeight: "calc(100dvh - 76px)",
          }}
        >
          <div className="mx-auto max-w-[1320px] px-5 pb-7 pt-4 sm:px-8">

            <nav
              ref={mobileNavigationRef}
              aria-label="Mobile navigation"
              className="flex flex-col"
            >
              {/* Primary navigation */}
              <div>
                <p className="mb-2 px-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#99958b]">
                  Navigation
                </p>

                {navigation.map((item) =>
                  renderNavigationLink(item, true)
                )}
              </div>

              {/* Account area */}
              <div className={`mt-6 border-t pt-5 ${theme.divider}`}>

                {isLoading ? (
                  <div className="space-y-3 py-3">
                    <div className="h-4 w-28 animate-pulse rounded bg-current/10" />
                    <div className="h-11 w-full animate-pulse rounded bg-current/10" />
                  </div>
                ) : !user ? (
                  <div className="space-y-3">

                    <button
                      type="button"
                      onClick={openAuthModal}
                      className={`flex min-h-11 w-full items-center justify-between text-left text-[14px] font-semibold ${theme.mobileText}`}
                    >
                      Log in

                      <UserIcon className="h-4 w-4" />
                    </button>

                    <Link
                      to={sectionHref("hero")}
                      onClick={closeMobileMenu}
                      className={`flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-[13px] font-semibold ${theme.button} ${theme.buttonHover}`}
                    >
                      Start free scan

                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">

                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
                          isDarkSurface
                            ? "bg-[#faf9f5] text-[#141413]"
                            : "bg-[#141413] text-[#faf9f5]"
                        }`}
                      >
                        {profile?.name?.charAt(0).toUpperCase() || "U"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-[13px] font-semibold ${theme.activeText}`}>
                          {profile?.name || "User"}
                        </p>

                        <p className={`mt-1 truncate text-[11px] ${theme.text}`}>
                          {profile?.email || user.email}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
                          profile?.tier === "pro" || profile?.tier === "scale"
                            ? "bg-[#fef3c7] text-[#92400e]"
                            : "bg-[#d6d4ca]/20 text-[#99958b]"
                        }`}
                      >
                        {profile?.tier ?? "Free"}
                      </span>
                    </div>

                    <div className={`flex items-center justify-between border-y py-3 ${theme.divider}`}>
                      <span className={`text-[11px] ${theme.text}`}>
                        Available credits
                      </span>

                      <span className={`text-[13px] font-semibold tabular-nums ${theme.activeText}`}>
                        {profile?.credits_remaining ?? 0}
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={closeMobileMenu}
                      className={`flex min-h-11 items-center justify-between text-[13px] font-semibold ${theme.activeText}`}
                    >
                      Dashboard

                      <ArrowRight className="h-4 w-4 text-[#c96442]" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => void handleSignOut()}
                      className="flex min-h-11 w-full items-center justify-between text-[13px] font-semibold text-[#c96442]"
                    >
                      Sign out

                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Bottom branding */}
            <div className={`mt-6 border-t pt-5 ${theme.divider}`}>
              <p className={`text-[9px] font-semibold uppercase tracking-[0.18em] ${theme.text}`}>
                SEO Hub Analyzer
              </p>

              <p className={`mt-2 text-[11px] ${theme.text}`}>
                Technical SEO intelligence for the modern web.
              </p>
            </div>
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
