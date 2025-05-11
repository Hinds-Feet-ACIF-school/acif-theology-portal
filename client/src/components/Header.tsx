// src/components/Header.js
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button.js";
import { Menu, X, LogOut, UserCircle2 as UserIcon } from "lucide-react";
import logo from "../assets/logo.jpg";
import { useAuth } from "../context/AuthContext.js";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const { currentUser: user, logout } = useAuth(); // <-- CORRECTED HERE
  const isAuthenticated = !!user;

  const baseNavigation = [
    { name: "Home", href: "/" },
    { name: "Program Overview", href: "/program-overview" },
    { name: "Courses", href: "/courses", requiresAuth: true },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const filteredNavigation = baseNavigation.filter(
    (item) => !item.requiresAuth || isAuthenticated
  );

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 px-4 z-50 w-full border-b border-[#C5A467]/20 bg-[#FFF8F0] dark:bg-[#2A0F0F] backdrop-blur supports-[backdrop-filter]:bg-[#FFF8F0]/90 dark:supports-[backdrop-filter]:bg-[#2A0F0F]/90">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="Apostolic Theology Logo"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="font-serif font-bold text-lg text-[#2A0F0F] dark:text-[#E0D6C3] hidden md:inline-block">
              Apostolic Theology
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`font-serif text-sm font-medium transition-colors hover:text-[#C5A467] ${
                pathname === item.href
                  ? "text-[#2A0F0F] dark:text-white"
                  : "text-[#4A1F1F] dark:text-[#E0D6C3]/80"
              }`}
            >
              {item.name}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`font-serif text-sm font-medium transition-colors hover:text-[#C5A467] ${
                pathname === "/dashboard"
                  ? "text-[#2A0F0F] dark:text-white"
                  : "text-[#4A1F1F] dark:text-[#E0D6C3]/80"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/profile" title="My Profile">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10 rounded-full"
                >
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <UserIcon size={22} />
                  )}
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-[#2A0F0F] dark:border-[#E0D6C3] text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10 flex items-center gap-1.5"
              >
                <LogOut size={14} />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2A0F0F] dark:border-[#E0D6C3] text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10"
                >
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  className="bg-[#C5A467] hover:bg-[#B08F55] text-[#2A0F0F] font-semibold"
                  size="sm"
                >
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden text-[#2A0F0F] dark:text-[#E0D6C3]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div
          className="md:hidden py-4 px-4 bg-[#FFF8F0] dark:bg-[#2A0F0F] border-t border-[#C5A467]/20 absolute top-16 inset-x-0 z-40 shadow-md"
        >
          <nav className="flex flex-col space-y-4">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block py-2 font-serif text-base font-medium ${
                  pathname === item.href
                    ? "text-[#2A0F0F] dark:text-white"
                    : "text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467]"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`block py-2 font-serif text-base font-medium ${
                    pathname === "/dashboard"
                      ? "text-[#2A0F0F] dark:text-white"
                      : "text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467]"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className={`block py-2 font-serif text-base font-medium ${
                    pathname === "/profile"
                      ? "text-[#2A0F0F] dark:text-white"
                      : "text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467]"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
              </>
            )}

            <div className="flex flex-col gap-3 pt-4 border-t border-[#C5A467]/20">
              {isAuthenticated ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[#2A0F0F] dark:border-[#E0D6C3] text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10 flex items-center justify-center gap-1.5"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut size={14} />
                  Log out
                </Button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full border-[#2A0F0F] dark:border-[#E0D6C3] text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10"
                      size="sm"
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button
                      className="w-full bg-[#C5A467] hover:bg-[#B08F55] text-[#2A0F0F] font-semibold"
                      size="sm"
                    >
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}