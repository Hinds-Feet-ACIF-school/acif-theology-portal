// src/pages/AboutUsPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
    BookOpen, Users, Target, ShieldCheck, HeartHandshake, GraduationCap, LucideIcon, UploadCloud
} from 'lucide-react';
import logoPlaceholder from "../assets/logo.jpg"; // Renamed for clarity, this is your fallback

import { AboutPageContentData, CoreValueItemData } from '../types/aboutPageContentTypes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const fetchPublicAboutUsPageContent = async (): Promise<AboutPageContentData> => {
  const response = await fetch(`${API_BASE_URL}/content/about`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to fetch About Us page content" }));
    throw new Error(errorData.message || "Failed to fetch About Us page content");
  }
  return response.json();
};

const accentColor = "#C5A467";
const accentHoverColor = "#B08F55"; // Not used after CTA removal
const primaryTextLight = "text-[#2A0F0F]";
const secondaryTextLight = "text-[#4A1F1F]";
const primaryTextDark = "dark:text-[#FFF8F0]";
const secondaryTextDark = "dark:text-[#E0D6C3]/90";
const sectionBgLight = "bg-[#FFF8F0]";
const sectionBgDark = "dark:bg-gray-950";
const altSectionBgLight = "bg-[#F4EDE4]";
const altSectionBgDark = "dark:bg-gray-900";
const goldBg = `bg-[${accentColor}]`; // Not used after CTA removal
const goldBgHover = `hover:bg-[${accentHoverColor}]`;
const goldAccentBgLight = `bg-[${accentColor}]/10 dark:bg-[${accentColor}]/20`;



const getCoreValueIcon = (title: string): LucideIcon => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("biblical fidelity")) return BookOpen;
    if (lowerTitle.includes("apostolic foundation")) return ShieldCheck;
    if (lowerTitle.includes("doctrinal clarity")) return Target;
    if (lowerTitle.includes("academic rigor")) return GraduationCap;
    if (lowerTitle.includes("community") || lowerTitle.includes("fellowship")) return Users;
    if (lowerTitle.includes("practical application")) return HeartHandshake;
    return BookOpen;
};

const AboutUsPage: React.FC = () => {
  const [content, setContent] = useState<AboutPageContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedContent = await fetchPublicAboutUsPageContent();
        setContent(fetchedContent);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error loading About Us page content:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, []);

  if (isLoading) {
    return <div className={`flex justify-center items-center min-h-screen ${sectionBgLight} ${sectionBgDark}`}>Loading About Us Page...</div>;
  }

  if (error || !content) {
    return (
      <div className={`flex flex-col justify-center items-center min-h-screen text-red-500 p-4 text-center ${sectionBgLight} ${sectionBgDark}`}>
        <p className="text-xl font-semibold">Error loading page content.</p>
        <p>{error || "About Us content could not be retrieved. Please try again later."}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  const heroEffectiveLogoUrl = content.hero.logoUrl || logoPlaceholder;

  return (
    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>
      <section className="w-full py-16 sm:py-20 md:py-28 lg:py-36 xl:py-40 bg-gradient-to-br from-[#2A0F0F] to-[#4A1F1F] dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            <img
              src={heroEffectiveLogoUrl}
              alt="Apostolic & Evangelical Theology Logo"
              className="h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 lg:h-24 lg:w-24 mx-auto rounded-full object-cover mb-4 shadow-md border-2 border-[#C5A467]/50"
              onError={(e) => { (e.target as HTMLImageElement).src = logoPlaceholder; }} // Fallback
            />
            <div className="space-y-2">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-serif tracking-tight text-white`}>
                {content.hero.title}
              </h1>
              <p className={`mx-auto max-w-[700px] text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl text-white`}>
                {content.hero.subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`w-full py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 ${sectionBgLight} ${sectionBgDark}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-4 text-center lg:text-left">
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>{content.missionVision.missionTitle}</h2>
              <p className={`text-base md:text-lg ${secondaryTextLight} ${secondaryTextDark}`}>
                {content.missionVision.missionDescription}
              </p>
            </div>
            <div className="space-y-4 text-center lg:text-left">
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>{content.missionVision.visionTitle}</h2>
              <p className={`text-base md:text-lg ${secondaryTextLight} ${secondaryTextDark}`}>
                {content.missionVision.visionDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

       <section className={`w-full py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 ${altSectionBgLight} ${altSectionBgDark}`}>
         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight text-center mb-10 md:mb-12 lg:mb-16 ${primaryTextLight} ${primaryTextDark}`}>{content.coreValues.title}</h2>
           <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
             {(content.coreValues.items || []).map((item: CoreValueItemData) => {
               const IconComponent = getCoreValueIcon(item.title);
               return (
                 <div key={item.id} className="flex flex-col items-center text-center p-4">
                   <div className={`mb-4 rounded-full ${goldAccentBgLight} p-3 sm:p-4`}>
                     <IconComponent className={`h-8 w-8 sm:h-10 sm:w-10 text-[${accentColor}]`} />
                   </div>
                   <h3 className={`text-lg sm:text-xl font-semibold mb-1 ${primaryTextLight} ${primaryTextDark}`}>{item.title}</h3>
                   <p className={`text-sm sm:text-base ${secondaryTextLight} ${secondaryTextDark}`}>{item.desc}</p>
                 </div>
               );
             })}
           </div>
         </div>
       </section>

       <section className={`w-full py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 ${sectionBgLight} ${sectionBgDark}`}>
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 sm:px-6 lg:px-8 text-center">
          <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>
            Ready to Learn More?
          </h3>
          <p className={`text-base sm:text-lg max-w-xl ${secondaryTextLight} ${secondaryTextDark}`}>
            Explore our detailed program structure and curriculum to see how our certificate can equip you.
          </p>
          <Link to="/program-overview">
             <Button size="lg" className={`${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold transition-colors text-base sm:text-lg`}>
               View Program Details
             </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;