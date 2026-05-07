import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/layouts/Footer";
import { Toaster } from "sonner";

const RootLayout = () => {
  const location = useLocation();
  // On Home, navbar overlays the hero — no top padding on main.
  // Elsewhere, push content below the fixed navbar height.
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className={`flex-grow ${isHome ? "" : "pt-16 md:pt-20"}`}>
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="top-center"
        expand
        richColors
        closeButton
        theme="light"
        toastOptions={{
          classNames: {
            toast: "font-sans border border-linen bg-cream text-ink",
            title: "text-ink",
            description: "text-ink2",
          },
        }}
      />
    </div>
  );
};

export default RootLayout;
