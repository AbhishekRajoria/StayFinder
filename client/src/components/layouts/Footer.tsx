import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Github, Globe, Instagram } from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-cream border-t border-linen mt-32">
      <div className="container-page py-22 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand + newsletter */}
          <div className="md:col-span-5">
            <p className="font-display text-3xl text-ink leading-none">StayFinder</p>
            <p className="text-ink2 mt-5 max-w-sm leading-relaxed">
              Hand-picked homes for travellers who care about where they sleep.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email) return;
                toast.success("Subscribed. Welcome aboard.");
                setEmail("");
              }}
              className="mt-10 max-w-sm"
            >
              <p className="eyebrow text-ink mb-3">Letter from the editor</p>
              <div className="flex items-end gap-3 border-b border-ink/30 focus-within:border-ink transition-colors">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent py-3 text-sm text-ink placeholder:text-ink3 focus:outline-none"
                />
                <button
                  type="submit"
                  className="eyebrow text-ink hover:text-terracotta transition-colors pb-3"
                >
                  Subscribe →
                </button>
              </div>
            </form>
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <p className="eyebrow text-ink mb-5">Explore</p>
            <ul className="space-y-3">
              <FooterLink to="/">Stays</FooterLink>
              <FooterLink to="/listings">Search</FooterLink>
              <FooterLink to="/listings?propertyType=villa">Villas</FooterLink>
              <FooterLink to="/listings?propertyType=apartment">Apartments</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <p className="eyebrow text-ink mb-5">Studio</p>
            <ul className="space-y-3">
              <FooterLink to="/about">About</FooterLink>
              <FooterLink to="/listings/create">List your home</FooterLink>
              <FooterLink to="/help">Help</FooterLink>
              <FooterLink to="/privacy">Privacy</FooterLink>
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-3">
            <p className="eyebrow text-ink mb-5">Connect</p>
            <ul className="space-y-3 text-sm text-ink2">
              <li>support@stayfinder.com</li>
              <li>+1 (555) 123 4567</li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a
                href="https://github.com/Abhishek1334/StayFinder"
                target="_blank"
                rel="noreferrer"
                className="h-10 w-10 rounded-full border border-ink/15 hover:border-ink flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://abhishek-rajoria.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="h-10 w-10 rounded-full border border-ink/15 hover:border-ink flex items-center justify-center transition-colors"
                aria-label="Portfolio"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full border border-ink/15 hover:border-ink flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-linen mt-22 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-xs text-ink3">
            © {new Date().getFullYear()} StayFinder. All rights reserved.
          </p>
          <p className="text-xs text-ink3">
            Designed & built by{" "}
            <a
              href="https://abhishek-rajoria.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="editorial-link text-xs"
            >
              Abhishek Rajoria
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li>
    <Link
      to={to}
      className="text-sm text-ink2 hover:text-ink transition-colors"
    >
      {children}
    </Link>
  </li>
);

export default Footer;
