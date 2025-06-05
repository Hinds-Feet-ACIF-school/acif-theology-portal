// src/components/Header.tsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button"; // Assuming .js is not needed if your build handles it
import { Menu, X, LogOut, UserCircle2 as UserIcon, Sun, Moon } from "lucide-react";
import defaultStaticLogo from "../assets/logo.jpg"; // Your static fallback logo (renamed for clarity)
import { useAuth } from "../context/AuthContext"; // Assuming .js is not needed
import { useTheme } from "./theme-provider";    // Assuming .js is not needed

// Import the new unified data type
import { SiteBrandingContentData } from '../types/siteBrandingContentTypes'; // Adjust path if needed

interface NavItem {
  name: string;
  href: string;
  requiresAuth?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Fetch function for the unified site branding content
const fetchPublicSiteBrandingContent = async (): Promise<SiteBrandingContentData | null> => {
  console.log("Header: Fetching site branding content from API...");
  try {
    const response = await fetch(`${API_BASE_URL}/content/site-branding`); // Updated endpoint
    if (!response.ok) {
        console.warn("Header: Failed to fetch site branding content, status:", response.status);
        try {
            const errorData = await response.json();
            console.error("Header: API error data:", errorData.message || response.statusText);
        } catch (e) {
            console.error("Header: Could not parse error response as JSON. Status:", response.statusText);
        }
        return null;
    }
    const data = await response.json();
    if (data && data.header && data.header.siteName !== undefined) { // Check for expected structure
        return data;
    } else {
        console.warn("Header: Fetched site branding data is not in the expected format:", data);
        return null;
    }
  } catch (error) {
    console.error("Header: Network error fetching site branding content:", error);
    return null;
  }
};


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const { currentUser: user, logout } = useAuth();
  const isAuthenticated: boolean = !!user;
  const { theme, setTheme } = useTheme();
  const [currentClientTheme, setCurrentClientTheme] = useState<string | undefined>(undefined); // Init undefined for SSR safety

  // State for global site branding content (logo, site name)
  const [brandingContent, setBrandingContent] = useState<SiteBrandingContentData | null>(null);
  const [isLoadingBranding, setIsLoadingBranding] = useState(true);

  useEffect(() => {
    // This useEffect is specifically for client-side theme determination to avoid hydration issues.
    setCurrentClientTheme(theme);
  }, [theme]);
  
  useEffect(() => {
    const loadBrandingContent = async () => {
        setIsLoadingBranding(true);
        const fetchedContent = await fetchPublicSiteBrandingContent();
        setBrandingContent(fetchedContent);
        setIsLoadingBranding(false);
    };
    loadBrandingContent();
  }, []);


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
      setIsMenuOpen(false); // Close mobile menu on logout
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally, show an error message to the user
    }
  };

  // Determine site name and logo URL with fallbacks
  // Accessing content within brandingContent.header
  const siteNameToDisplay = isLoadingBranding 
    ? "Loading..." 
    : (brandingContent?.header?.siteName || "Apostolic Theology"); // Fallback site name
  
  const siteLogoToDisplay = brandingContent?.header?.siteLogoUrl || defaultStaticLogo;

  return (
    <header className="sticky top-0 px-4 sm:px-6 lg:px-8 z-50 w-full border-b border-[#C5A467]/20 bg-[#FFF8F0] dark:bg-[#2A0F0F] backdrop-blur supports-[backdrop-filter]:bg-[#FFF8F0]/90 dark:supports-[backdrop-filter]:bg-[#2A0F0F]/90">
      <div className="container mx-auto flex h-16 items-center relative">
        {/* Site Logo and Name */}
        <div className="flex-shrink-0 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={siteLogoToDisplay}
              alt={`${siteNameToDisplay} Logo`}
              className="h-8 w-8 md:h-9 md:w-9 rounded-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = defaultStaticLogo; }} // Fallback if dynamic URL fails
            />
            <span className="font-serif font-bold text-lg md:text-lg lg:text-xl text-[#2A0F0F] dark:text-[#E0D6C3] hidden md:inline-block">
              {siteNameToDisplay}
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center md:gap-x-1 lg:gap-x-4 xl:gap-x-6 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`font-serif text-sm md:text-xs lg:text-sm xl:text-base font-medium transition-colors hover:text-[#C5A467] whitespace-nowrap ${
                pathname === item.href
                  ? "text-[#C5A467]"
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
                  ? "text-[#C5A467]"
                  : "text-[#4A1F1F] dark:text-[#E0D6C3]/80"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Side Controls: Theme Toggle, Auth Buttons, Mobile Menu Toggle */}
        <div className="flex-shrink-0 flex items-center gap-x-1 sm:gap-x-2 ml-auto">
          {currentClientTheme !== undefined && ( // Render theme toggle only when client theme is determined
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hidden md:inline-flex text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10 rounded-full"
                aria-label={`Switch to ${currentClientTheme === 'light' ? 'dark' : 'light'} mode`}
            >
                {currentClientTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </Button>
          )}

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-x-2 lg:gap-x-3">
            {isAuthenticated ? (
              <>
                <Link to="/profile" title="My Profile">
                  <Button variant="ghost" size="icon" className="text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10 rounded-full">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <UserIcon size={22} />
                    )}
                  </Button>
                </Link>
                <Button
                  type="button" variant="outline" size="sm" onClick={handleLogout}
                  className="border-[#2A0F0F] dark:border-[#E0D6C3] text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10 flex items-center gap-1.5 text-xs sm:text-sm"
                >
                  <LogOut size={14} /> Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="border-[#2A0F0F] dark:border-[#E0D6C3] text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10 text-xs sm:text-sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-[#C5A467] hover:bg-[#B08F55] text-[#2A0F0F] font-semibold text-xs sm:text-sm" size="sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
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

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="md:hidden py-4 px-4 sm:px-6 lg:px-8 bg-[#FFF8F0] dark:bg-[#2A0F0F] border-t border-[#C5A467]/20 absolute top-16 inset-x-0 z-40 shadow-lg">
          <nav className="flex flex-col space-y-2">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block py-2.5 px-3 rounded-md font-serif text-base font-medium ${
                  pathname === item.href
                    ? "text-[#C5A467] bg-[#C5A467]/20"
                    : "text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467] hover:bg-[#C5A467]/10"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link to="/dashboard" /* className as above */ onClick={() => setIsMenuOpen(false)} className={`block py-2.5 px-3 rounded-md font-serif text-base font-medium ${pathname === "/dashboard" ? "text-[#C5A467] bg-[#C5A467]/20" : "text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467] hover:bg-[#C5A467]/10"}`}>Dashboard</Link>
                <Link to="/profile" /* className as above */ onClick={() => setIsMenuOpen(false)} className={`block py-2.5 px-3 rounded-md font-serif text-base font-medium ${pathname === "/profile" ? "text-[#C5A467] bg-[#C5A467]/20" : "text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467] hover:bg-[#C5A467]/10"}`}>My Profile</Link>
              </>
            )}

            {currentClientTheme !== undefined && (
                <Button
                    variant="ghost"
                    onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
                    className="w-full justify-start py-2.5 px-3 rounded-md font-serif text-base font-medium text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467] hover:bg-[#C5A467]/10 flex items-center gap-2"
                    aria-label={`Switch to ${currentClientTheme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {currentClientTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    <span>Switch to {currentClientTheme === 'light' ? 'Dark' : 'Light'} Mode</span>
                </Button>
            )}

            <div className="flex flex-col gap-3 pt-3 mt-2 border-t border-[#C5A467]/20">
              {isAuthenticated ? (
                <Button
                  type="button" variant="outline" size="lg" // Changed to "md" to match others, or keep "lg" if preferred
                  className="w-full border-[#2A0F0F] dark:border-[#E0D6C3] text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10 flex items-center justify-center gap-1.5 text-sm"
                  onClick={handleLogout}
                >
                  <LogOut size={16} /> Log out
                </Button>
              ) : (
                <>
                  <Link to="/login" className="block w-full" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="lg" className="w-full border-[#2A0F0F] dark:border-[#E0D6C3] text-[#2A0F0F] dark:text-[#E0D6C3] hover:bg-[#C5A467]/10 text-sm">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register" className="block w-full" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-[#C5A467] hover:bg-[#B08F55] text-[#2A0F0F] font-semibold text-sm" size="lg">
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