import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { isFullyActive, isSuspended, isPending, hasPlatformAccess, hasTrainingAccess, hasBundleAccess } from "@/hooks/use-member-gate";
import {
  Menu, X, LogOut, LayoutDashboard, BookOpen, Calendar,
  Star, Users, Settings, ChevronDown, Car, Target,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { MiitroLogo } from "@/components/logo";

export function Navbar() {
  const [location] = useLocation();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);
  const memberMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close member dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (memberMenuRef.current && !memberMenuRef.current.contains(e.target as Node)) {
        setMemberMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const publicLinks = [
    { label: "About", href: "/about" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "/faq" },
    { label: "Roadmap", href: "/roadmap" },
    { label: "Contact", href: "/contact" },
  ];

  // All possible member nav links — filtered below based on access tier
  const allMemberLinks = [
    { label: "Dashboard",         href: "/dashboard",  icon: LayoutDashboard },
    { label: "Training Center",   href: "/training",   icon: BookOpen },
    { label: "Live Events",       href: "/events",     icon: Calendar },
    { label: "Trip Log",          href: "/trip-log",   icon: Car },
    { label: "Goals",             href: "/goals",      icon: Target },
    { label: "Membership",        href: "/membership", icon: Star },
    { label: "Affiliate Program", href: "/affiliate",  icon: Users },
    { label: "Settings",          href: "/settings",   icon: Settings },
  ];

  // Derive the member's access tier so the nav only surfaces links they can use.
  //
  //  suspended / pending     → Dashboard only (status screen handles everything)
  //  approved + unpaid       → Dashboard only (ActivateBanner)
  //  training-only           → Dashboard + Training Center + Settings
  //  membership-only         → Dashboard + platform links + Settings (no Training Center, no Affiliate)
  //  bundle                  → all links (including Affiliate Program)
  //
  // This prevents membership-only users from seeing "Training Center" (which
  // would immediately bounce them back) and training-only users from seeing
  // platform-only pages (Events, Trip Log, Goals, Membership).
  const memberLinks = (() => {
    if (!user || isAdmin) return allMemberLinks; // admin never renders this block
    if (isSuspended(user) || isPending(user)) {
      return allMemberLinks.filter((l) => l.href === "/dashboard");
    }
    if (!isFullyActive(user)) {
      return allMemberLinks.filter((l) => l.href === "/dashboard");
    }
    // Fully active: filter by product access
    const canTrain    = hasTrainingAccess(user);
    const canPlatform = hasPlatformAccess(user);
    const canBundle   = hasBundleAccess(user);

    // Training-only: their home IS the training center.
    // Dashboard redirects them away immediately; platform and affiliate pages
    // are not part of their product — show only what they purchased.
    if (canTrain && !canPlatform) {
      return allMemberLinks.filter((l) => ["/training", "/settings"].includes(l.href));
    }

    return allMemberLinks.filter((l) => {
      if (l.href === "/training")                                              return canTrain;
      if (["/events", "/trip-log", "/goals", "/membership"].includes(l.href)) return canPlatform;
      if (l.href === "/affiliate")                                             return canBundle;
      return true; // dashboard, settings — always visible for platform users
    });
  })();

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
        isScrolled ? "glass-effect shadow-sm border-border/40" : "bg-transparent py-2"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <MiitroLogo />
          </Link>

          {/* Desktop — Public nav */}
          {!isAuthenticated && (
            <nav className="hidden md:flex items-center gap-6">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location === link.href ? "text-primary font-semibold" : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Desktop — Member nav (authenticated) */}
          {isAuthenticated && !isAdmin && (
            <nav className="hidden md:flex items-center gap-1">
              {memberLinks.slice(0, 4).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    location.startsWith(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}

              {/* More dropdown — only rendered when there are overflow links */}
              {memberLinks.length > 4 && (
                <div className="relative" ref={memberMenuRef}>
                  <button
                    onClick={() => setMemberMenuOpen(!memberMenuOpen)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    More <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {memberMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-popover border border-border rounded-xl shadow-lg py-1 z-50">
                      {memberLinks.slice(4).map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMemberMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
                            location.startsWith(link.href)
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          <link.icon className="w-4 h-4 text-muted-foreground" />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>
          )}

          {/* Desktop — Admin nav */}
          {isAdmin && (
            <nav className="hidden md:flex items-center gap-2">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="rounded-full">Admin Panel</Button>
              </Link>
            </nav>
          )}

          {/* Desktop — Auth actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground hidden lg:block">
                  {user?.fullName?.split(" ")[0]}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  title="Log out"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/join">
                  <Button size="sm" className="rounded-full shadow-lg shadow-primary/25">
                    Join Miitro
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-xl py-4 px-4 flex flex-col gap-2 max-h-[80vh] overflow-y-auto">
          {isAuthenticated ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1">
                Member Menu
              </p>
              {memberLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg text-base font-medium",
                    location.startsWith(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive"
                onClick={() => { logout(); setMobileMenuOpen(false); }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </>
          ) : (
            <>
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "p-3 rounded-lg text-base font-medium",
                    location === link.href ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              <div className="flex flex-col gap-3">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Log In</Button>
                </Link>
                <Link href="/join" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Join Miitro</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
