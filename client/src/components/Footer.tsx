// src/components/Footer.tsx
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import defaultStaticLogo from "../assets/logo.jpg"; // Your static fallback logo

// Import the new unified data type
import { SiteBrandingContentData } from '../types/siteBrandingContentTypes'; // Adjust path if needed

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Fetch function for the unified site branding content
const fetchPublicSiteBrandingContent = async (): Promise<SiteBrandingContentData | null> => {
  console.log("Footer: Fetching site branding content from API...");
  try {
    const response = await fetch(`${API_BASE_URL}/content/site-branding`); // Updated endpoint
    if (!response.ok) {
        console.warn("Footer: Failed to fetch site branding content, status:", response.status);
        // Try to get error message from response if possible
        try {
            const errorData = await response.json();
            console.error("Footer: API error data:", errorData.message || response.statusText);
        } catch (e) {
            console.error("Footer: Could not parse error response as JSON. Status:", response.statusText);
        }
        return null; // Return null on error to use fallbacks
    }
    const data = await response.json();
    // Basic validation
    if (data && data.header && data.footer) {
        return data;
    } else {
        console.warn("Footer: Fetched site branding data is not in the expected format:", data);
        return null;
    }
  } catch (error) {
    console.error("Footer: Network error fetching site branding content:", error);
    return null; // Return null on network error
  }
};

export default function Footer() {
  const [brandingContent, setBrandingContent] = useState<SiteBrandingContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      const fetchedContent = await fetchPublicSiteBrandingContent();
      setBrandingContent(fetchedContent);
      setIsLoading(false);
    };
    loadContent();
  }, []);

  // Provide fallbacks if content is loading or fails to load
  // Accessing content within brandingContent.footer
  const footerSiteName = isLoading 
    ? "Loading..." 
    : (brandingContent?.footer?.footerSiteName || "Apostolic Theology");
  
  const copyrightHolder = isLoading 
    ? "" 
    : (brandingContent?.footer?.copyrightText || "International Apostolic Church");
  
  const tagline = isLoading 
    ? "" 
    : (brandingContent?.footer?.tagline || '"Study to shew thyself approved unto God..." - 2 Timothy 2:15');
  
  const footerLogoToDisplay = brandingContent?.footer?.footerLogoUrl || defaultStaticLogo;

  return (
    <footer className="w-full py-8 sm:py-10 md:py-12 bg-[#FFF8F0] dark:bg-[#2A0F0F] border-t border-[#C5A467]/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-8">
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <div className="flex items-center gap-2">
              <img 
                src={footerLogoToDisplay} 
                alt={`${footerSiteName} Footer Logo`} 
                className="h-10 w-10 rounded-full object-cover shadow-md border-2 border-[#C5A467]/50" 
                onError={(e) => { (e.target as HTMLImageElement).src = defaultStaticLogo; }} // Fallback if dynamic URL fails
              />
              <span className="font-serif font-bold text-lg text-[#2A0F0F] dark:text-[#E0D6C3]">
                {footerSiteName}
              </span>
            </div>
            <p className="text-sm text-[#4A1F1F] dark:text-[#E0D6C3]/80">
              © {new Date().getFullYear()} {copyrightHolder}. All rights reserved.
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

        {/* Render tagline only if it's not empty after loading and potential fallback */}
        {(tagline || (!isLoading && brandingContent?.footer?.tagline)) && (
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