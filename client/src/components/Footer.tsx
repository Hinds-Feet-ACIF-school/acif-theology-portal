// src/components/Footer.tsx
import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { Link } from "react-router-dom";
import defaultLogo from "../assets/logo.jpg"; // Fallback logo

// Import the data type
import { FooterContentData } from '../types/footerContentTypes'; // Adjust path

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const fetchPublicFooterContent = async (): Promise<FooterContentData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/content/footer`);
    if (!response.ok) {
        console.warn("Failed to fetch footer content, status:", response.status);
        return null; // Return null on error to use fallbacks
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching footer content:", error);
    return null; // Return null on network error
  }
};

export default function Footer() {
  const [content, setContent] = useState<FooterContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      const fetchedContent = await fetchPublicFooterContent();
      setContent(fetchedContent);
      setIsLoading(false);
    };
    loadContent();
  }, []);

  // Provide fallbacks if content is loading or fails to load
  const siteName = isLoading ? "Loading..." : (content?.siteName || "Apostolic Theology");
  const copyrightHolder = isLoading ? "" : (content?.copyrightText || "International Apostolic Church. All rights reserved.");
  const tagline = isLoading ? "" : (content?.tagline || '"Study to shew thyself approved unto God..." - 2 Timothy 2:15');
  const logoUrl = content?.logoUrl || defaultLogo; // Use fetched logo or fallback

  return (
    <footer className="w-full py-8 sm:py-10 md:py-12 bg-[#FFF8F0] dark:bg-[#2A0F0F] border-t border-[#C5A467]/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-8">
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <div className="flex items-center gap-2">
              <img 
                src={logoUrl} 
                alt={`${siteName} Logo`} 
                className="h-10 w-10 rounded-full object-cover shadow-md border-2 border-[#C5A467]/50" 
                onError={(e) => { (e.target as HTMLImageElement).src = defaultLogo; }} // Fallback for broken dynamic URL
              />
              <span className="font-serif font-bold text-lg text-[#2A0F0F] dark:text-[#E0D6C3]">
                {siteName}
              </span>
            </div>
            <p className="text-sm text-[#4A1F1F] dark:text-[#E0D6C3]/80">
              © {new Date().getFullYear()} {copyrightHolder}
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center md:items-end md:text-right gap-4">
            {/* Navigation links remain static as per current design */}
            <nav className="flex flex-col sm:flex-row gap-y-2 gap-x-4 md:gap-x-6">
              <Link to="/about" className="font-serif text-sm text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467] transition-colors">About Us</Link>
              <Link to="/contact" className="font-serif text-sm text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467] transition-colors">Contact</Link>
            </nav>
            <nav className="flex flex-col sm:flex-row gap-y-2 gap-x-4 md:gap-x-6">
              <Link to="/privacy" className="font-serif text-sm text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467] transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="font-serif text-sm text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:text-[#C5A467] transition-colors">Terms of Use</Link>
            </nav>
          </div>
        </div>

        {tagline && ( // Only render tagline if it exists
          <div className="mt-8 pt-6 border-t border-[#C5A467]/20 text-center">
            <p className="text-xs sm:text-sm text-[#4A1F1F] dark:text-[#E0D6C3]/80">
              {tagline}
            </p>
          </div>
        )}
      </div>
    </footer>
  )
}