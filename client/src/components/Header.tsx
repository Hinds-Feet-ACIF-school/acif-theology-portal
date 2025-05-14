import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button.js";
import { Menu, X, LogOut, UserCircle2 as UserIcon, Sun, Moon } from "lucide-react";
import logo from "../assets/logo.jpg";
import { useAuth } from "../context/AuthContext.js";
import { useTheme } from "./theme-provider.js";

interface NavItem {
  name: string;
  href: string;
  requiresAuth?: boolean;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const { currentUser: user, logout } = useAuth();
  const isAuthenticated: boolean = !!user;
  const { theme, setTheme } = useTheme();
  const [currentClientTheme, setCurrentClientTheme] = useState<string | undefined>(theme);

  useEffect(() => {
    setCurrentClientTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const baseNavigation: NavItem[] = [
    { name: "Home", href: "/" },
    { name: "Program Overview", href: "/program-overview" },
    { name: "Courses", href: "/courses", requiresAuth: true },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const filteredNavigation: NavItem[] = baseNavigation.filter(
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
    <header className="sticky top-0 px-4 sm:px-6 lg:px-8 z-50 w-full border-b border-[#C5A467]/20 bg-[#FFF8F0] dark:bg-[#2A0F0F] backdrop-blur supports-[backdrop-filter]:bg-[#FFF8F0]/90 dark:supports-[backdrop-filter]:bg-[#2A0F0F]/90">
      <div className="container mx-auto flex h-16 items-center relative">
        <div className="flex-shrink-0 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="Apostolic Theology Logo"
              className="h-8 w-8 md:h-9 md:w-9 rounded-full object-cover"
            />
            <span className="font-serif font-bold text-lg md:text-lg lg:text-xl text-[#2A0F0F] dark:text-[#E0D6C3] hidden md:inline-block">
              Apostolic Theology
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center md:gap-x-1 lg:gap-x-4 xl:gap-x-6 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`font-serif text-sm md:text-xs lg:text-sm xl:text-base font-medium transition-colors hover:text-[#C5A467] whitespace-nowrap ${
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
              className={`font-serif text-sm md:text-xs lg:text-sm xl:text-base font-medium transition-colors hover:text-[#C5A467] whitespace-nowrap ${
                pathname === "/dashboard"
                  ? "text-[#2A0F0F] dark:text-white"
                  : "text-[#4A1F1F] dark:text-[#E0D6C3]/80"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex-shrink-0 flex items-center gap-x-1 sm:gap-x-2 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden md:inline-flex text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10 rounded-full"
            aria-label={`Switch to ${currentClientTheme === 'light' ? 'dark' : 'light'} mode`}
          >
            {currentClientTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </Button>

          <div className="hidden md:flex items-center gap-x-2 lg:gap-x-3">
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
                  className="border-[#2A0F0F] dark:border-[#E0D6C3] text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10 flex items-center gap-1.5 text-xs sm:text-sm"
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
                    className="border-[#2A0F0F] dark:border-[#E0D6C3] text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10 text-xs sm:text-sm"
                  >
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    className="bg-[#C5A467] hover:bg-[#B08F55] text-[#2A0F0F] font-semibold text-xs sm:text-sm"
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
            className="md:hidden text-[#2A0F0F] dark:text-[#E0D6C3] p-2 -mr-2 rounded-md hover:bg-[#C5A467]/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div
          className="md:hidden py-4 px-4 sm:px-6 lg:px-8 bg-[#FFF8F0] dark:bg-[#2A0F0F] border-t border-[#C5A467]/20 absolute top-16 inset-x-0 z-40 shadow-lg"
        >
          <nav className="flex flex-col space-y-2">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block py-2.5 px-3 rounded-md font-serif text-base font-medium ${
                  pathname === item.href
                    ? "text-[#2A0F0F] dark:text-white bg-[#C5A467]/20"
                    : "text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467] hover:bg-[#C5A467]/10"
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
                  className={`block py-2.5 px-3 rounded-md font-serif text-base font-medium ${
                    pathname === "/dashboard"
                      ? "text-[#2A0F0F] dark:text-white bg-[#C5A467]/20"
                      : "text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467] hover:bg-[#C5A467]/10"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className={`block py-2.5 px-3 rounded-md font-serif text-base font-medium ${
                    pathname === "/profile"
                      ? "text-[#2A0F0F] dark:text-white bg-[#C5A467]/20"
                      : "text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467] hover:bg-[#C5A467]/10"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
              </>
            )}

            <Button
                variant="ghost"
                onClick={() => {
                    toggleTheme();
                    setIsMenuOpen(false);
                }}
                className="w-full justify-start py-2.5 px-3 rounded-md font-serif text-base font-medium text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467] hover:bg-[#C5A467]/10 flex items-center gap-2"
                aria-label={`Switch to ${currentClientTheme === 'light' ? 'dark' : 'light'} mode`}
            >
                {currentClientTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                <span>Switch to {currentClientTheme === 'light' ? 'Dark' : 'Light'} Mode</span>
            </Button>

            <div className="flex flex-col gap-3 pt-3 mt-2 border-t border-[#C5A467]/20">
              {isAuthenticated ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[#2A0F0F] dark:border-[#E0D6C3] text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10 flex items-center justify-center gap-1.5 text-sm"
                  size="md"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
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
                      className="w-full border-[#2A0F0F] dark:border-[#E0D6C3] text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10 text-sm"
                      size="md"
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
                      className="w-full bg-[#C5A467] hover:bg-[#B08F55] text-[#2A0F0F] font-semibold text-sm"
                      size="md"
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