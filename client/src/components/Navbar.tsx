import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  User,
  Home,
  PlusCircle,
  Building2,
  Calendar,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Navbar = () => {
  const { user, loading, logout, checkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasCheckedAuth = useRef(false);

  const { scrollY } = useScroll();
  // Background opacity ramps from 0 → 0.95 between 0 and 80px scroll
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.95]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      checkAuth();
      hasCheckedAuth.current = true;
    }
  }, [checkAuth]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Routes where the navbar should overlay a dark hero (text becomes cream)
  const isOverHero = location.pathname === "/" && !scrolled;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      /* silent */
    }
  };

  const linkBase = isOverHero
    ? "text-cream/85 hover:text-cream"
    : "text-ink2 hover:text-ink";

  return (
    <motion.nav className="fixed top-0 inset-x-0 z-50">
      {/* animated background that fades in on scroll */}
      <motion.div
        aria-hidden
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 bg-cream backdrop-blur-md"
      />
      <motion.div
        aria-hidden
        style={{ opacity: borderOpacity }}
        className="absolute inset-x-0 bottom-0 h-px bg-linen"
      />

      <div className="relative container-page">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3">
            <span
              className={`font-display italic text-2xl md:text-[26px] leading-none transition-colors ${
                isOverHero ? "text-cream" : "text-ink"
              }`}
            >
              StayFinder
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10">
            <Link to="/listings" className={`eyebrow transition-colors ${linkBase}`}>
              Stays
            </Link>
            <Link
              to="/listings/create"
              className={`eyebrow transition-colors ${linkBase}`}
            >
              List your home
            </Link>
            {!user && (
              <Link to="/login" className={`eyebrow transition-colors ${linkBase}`}>
                Sign in
              </Link>
            )}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            {loading ? (
              <Skeleton className="h-9 w-24 rounded-full" />
            ) : user ? (
              <>
                <Link to="/listings/create" className="hidden md:inline-flex">
                  <Button variant="outline" size="sm" className="gap-2">
                    <PlusCircle className="h-3.5 w-3.5" />
                    New
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full p-0 border border-ink/15 hover:border-ink"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-bone text-ink text-sm">
                          {user.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-60 bg-cream border-linen"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-ink">{user.name}</p>
                        <p className="text-xs text-ink3">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-linen" />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "host" && (
                      <DropdownMenuItem asChild>
                        <Link to="/my-listings" className="cursor-pointer">
                          <Building2 className="mr-2 h-4 w-4" />
                          <span>My Listings</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/bookings" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>My Bookings</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "host" && (
                      <DropdownMenuItem asChild>
                        <Link to="/host/bookings" className="cursor-pointer">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Host Bookings</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-linen" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-ink"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/register">
                <Button size="sm">Get started</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
