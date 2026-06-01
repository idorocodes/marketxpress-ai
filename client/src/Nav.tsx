import { useState } from "react";

const NAV_LINKS = ["How It Works", "Features", "For Vendors", "Pricing"];

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "nav-blur" : ""}`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="font-display font-bold text-xl tracking-tight">
          Market<span className="gold-gradient">Xpress</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href="#"
              className="font-body text-sm text-white/50 hover:text-white transition-colors duration-200"
            >
              {l}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="font-body text-sm text-white/50 hover:text-white px-4 py-2 transition-colors">
            Sign in
          </button>
          <button className="font-body text-sm bg-amber-400 text-black font-medium px-5 py-2 rounded-full hover:bg-amber-300 transition-all duration-200">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
