import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ChevronRight, BookOpen, Calendar, Award, Users, LayoutDashboard, DollarSign, Coins } from "lucide-react";
import logoPlaceholder from "../assets/logo.jpg";
import { useAuth } from '../context/AuthContext';
import { HomePageContentData } from './admin/content/AdminHomePageContentEditor'; // Ensure this path is correct

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Constants for currency localization
const ETHIOPIA_COUNTRY_CODE = 'ET';

const fetchPublicHomePageContent = async (): Promise<HomePageContentData> => {
  const response = await fetch(`${API_BASE_URL}/content/home`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to fetch home page content" }));
    throw new Error(errorData.message || "Failed to fetch home page content");
  }
  return response.json();
};


const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState<HomePageContentData | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [errorContent, setErrorContent] = useState<string | null>(null);

  const [userCountryCode, setUserCountryCode] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [displayInvestmentValue, setDisplayInvestmentValue] = useState<string | null>(null); // Renamed for clarity

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoadingContent(true);
        setErrorContent(null);
        const fetchedContent = await fetchPublicHomePageContent();
        setContent(fetchedContent);
      } catch (err) {
        setErrorContent(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error loading home page content:", err);
      } finally {
        setIsLoadingContent(false);
      }
    };
    loadContent();
  }, []);

  // Effect for fetching user location
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("HomePage: Attempting to fetch location because user is not authenticated.");
      setIsLoadingLocation(true);
      const fetchLocationAsync = async () => {
        console.log("HomePage: fetchLocationAsync started.");
        try {
          // Try multiple geolocation services in sequence
          let countryCode = null;
          
          // First try: ipapi.co (more reliable)
          try {
            const response = await fetch('https://ipapi.co/json/');
            if (response.ok) {
              const data = await response.json();
              if (data.country_code) {
                countryCode = data.country_code;
                console.log("HomePage: Successfully got country code from ipapi.co:", countryCode);
              }
            }
          } catch (err) {
            console.log("HomePage: ipapi.co failed, trying ip-api.com");
          }

          // Second try: ip-api.com (fallback)
          if (!countryCode) {
            try {
              const response = await fetch('https://ip-api.com/json/?fields=status,message,countryCode');
              if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.countryCode) {
                  countryCode = data.countryCode;
                  console.log("HomePage: Successfully got country code from ip-api.com:", countryCode);
                }
              }
            } catch (err) {
              console.log("HomePage: ip-api.com failed");
            }
          }

          // Set the country code if we got one
          if (countryCode) {
            console.log("HomePage: Setting country code:", countryCode);
            setUserCountryCode(countryCode);
          } else {
            console.warn("HomePage: Could not determine country code from any service");
            setUserCountryCode(null);
          }
        } catch (err) {
          console.error("HomePage: Error in location detection:", err);
          setUserCountryCode(null);
        } finally {
          setIsLoadingLocation(false);
          console.log("HomePage: Location detection completed");
        }
      };
      fetchLocationAsync();
    } else {
      console.log("HomePage: User is authenticated, skipping location fetch.");
      setIsLoadingLocation(false);
      setUserCountryCode(null);
    }
  }, [isAuthenticated]);

  // Effect for setting the display investment value based on location and content
  useEffect(() => {
    console.log("Content from API:", JSON.stringify(content?.cta?.unauthenticated));
  console.log("Detected User Country Code:", userCountryCode);
  console.log("Is Loading Location:", isLoadingLocation);
    if (isAuthenticated || !content?.cta?.unauthenticated) {
      setDisplayInvestmentValue(null);
      return;
    }

    const { investmentValueUSD, investmentValueETB } = content.cta.unauthenticated;

    // If location is still being fetched AND country code is not yet determined,
    // default to showing the USD price string if available.
    if (isLoadingLocation && userCountryCode === null) {
      setDisplayInvestmentValue(investmentValueUSD || null); // Show USD or nothing if not defined
      return;
    }
    
    // If user is in Ethiopia AND an ETB price is defined, use it.
    if (userCountryCode === ETHIOPIA_COUNTRY_CODE && investmentValueETB) {
      setDisplayInvestmentValue(investmentValueETB);
    } 
    // Otherwise (not in Ethiopia, location unknown, or ETB price not defined),
    // use the USD price if available.
    else if (investmentValueUSD) {
      setDisplayInvestmentValue(investmentValueUSD);
    }
    // As a last resort, if only ETB is defined (unlikely but good to cover)
    else if (investmentValueETB) {
        setDisplayInvestmentValue(investmentValueETB);
    }
    // If neither price is defined.
    else {
      setDisplayInvestmentValue(null); // Or a placeholder like "Contact for Price" if appropriate
    }
    

  }, [content, userCountryCode, isLoadingLocation, isAuthenticated]);


  const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
  const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
  const goldAccent = 'text-[#C5A467]';
  const goldBg = 'bg-[#C5A467]';
  const goldBgHover = 'hover:bg-[#B08F55]';
  const goldBorder = 'border-[#C5A467]';
  const lightBg = 'bg-[#FFF8F0]';
  const darkBg = 'dark:bg-gray-950';

  const highlightIconsMap: { [key: string]: React.ElementType } = {
    default: BookOpen,
    courses: BookOpen,
    intakes: Calendar,
    certificate: Award,
    support: Users,
  };

  const getHighlightIcon = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("course")) return highlightIconsMap.courses;
    if (lowerText.includes("intake") || lowerText.includes("january") || lowerText.includes("july")) return highlightIconsMap.intakes;
    if (lowerText.includes("certificate") || lowerText.includes("ects")) return highlightIconsMap.certificate;
    if (lowerText.includes("mentor") || lowerText.includes("community") || lowerText.includes("support")) return highlightIconsMap.support;
    return highlightIconsMap.default;
  };


  if (isLoadingContent) {
    return <div className={`flex justify-center items-center min-h-screen ${lightBg} ${darkBg}`}>Loading Home Page...</div>;
  }

  if (errorContent || !content) {
    return (
      <div className={`flex flex-col justify-center items-center min-h-screen text-red-500 p-4 text-center ${lightBg} ${darkBg}`}>
        <p className="text-xl font-semibold">Error loading page content.</p>
        <p>{errorContent || "Content could not be retrieved. Please try again later."}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  const heroLogoUrl = content.hero.logoUrl || logoPlaceholder;


  return (
    <div className={`flex flex-col min-h-screen ${lightBg} ${darkBg}`}>
      {/* Hero Section ... (no changes here) ... */}
      <section className="w-full py-16 md:py-28 lg:py-36 bg-gradient-to-br from-[#2A0F0F] to-[#4A1F1F] dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/path-to-subtle-cross-pattern.svg')] bg-repeat opacity-10 dark:opacity-5"></div>
        <div className="container relative px-4 md:px-6 z-10 mx-auto">
         <div className="flex flex-col items-center space-y-6 text-center">
                <img
                  src={heroLogoUrl}
                  alt="Apostolic & Evangelical Theology Logo"
                  className="h-16 w-16 md:h-20 md:w-20 mx-auto rounded-full object-cover mb-4 shadow-md border-2 border-[#C5A467]/50"
                  onError={(e) => { (e.target as HTMLImageElement).src = logoPlaceholder; }}
                />
          <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight text-[#FFF8F0] drop-shadow-md animate-[fadeInDown_1s_ease-out] font-serif">
                {content.hero.title}
              </h1>
              <p className="mx-auto max-w-[750px] text-[#E0D6C3] text-lg md:text-xl lg:text-2xl animate-[fadeInUp_1.2s_ease-out]">
                {content.hero.subtitle}
              </p>
            </div>
            <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-4 pt-4 animate-[fadeInUp_1.5s_ease-out]">
              <Link to="/program-overview">
                <Button
                  size="lg"
                  className={`${goldBg} ${goldBgHover} text-[#2A0F0F] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg font-semibold group text-base md:text-lg`}
                >
                  Explore Program
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className={`text-[#2A0F0F] ${goldBorder} hover:bg-[#C5A467]/20 dark:text-[#C5A467] dark:border-[#C5A467] dark:hover:bg-[#C5A467]/10 dark:hover:text-[#E0D6C3] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md font-medium group text-base md:text-lg`}
                  >
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className={`border-[#C5A467] text-[#C5A467] hover:bg-[#C5A467]/10 hover:text-[#FFF8F0] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md font-medium text-base md:text-lg`}
                  >
                    Enroll Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Program Highlights & Learning Outcomes Section ... (no changes here) ... */}
      <section className={`w-full py-16 md:py-24 lg:py-32 ${lightBg} ${darkBg}`}>
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            <div className="space-y-5 animate-[fadeInRight_1s_ease-out] text-center lg:text-left">
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                <div className={`h-1 w-12 ${goldBg}`}></div>
                <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight font-serif ${deepBrown}`}>
                  {content.programHighlights.title}
                </h2>
              </div>
              <p className={`${midBrown} text-lg md:text-xl`}>
                {content.programHighlights.description}
              </p>
              <ul className="space-y-3 pt-2">
                {content.programHighlights.items.map((item, index) => {
                  const IconComponent = getHighlightIcon(item.text);
                  return (
                    <li key={item.id || `ph-${index}`} className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg shadow-sm justify-center lg:justify-start">
                      <IconComponent className={`h-6 w-6 ${goldAccent} flex-shrink-0`} />
                      <span className={`text-[#4A1F1F] dark:text-gray-300 text-base md:text-lg`}>{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="space-y-5 animate-[fadeInLeft_1s_ease-out] text-center lg:text-left">
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                <div className={`h-1 w-12 ${goldBg}`}></div>
                <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight font-serif ${deepBrown}`}>
                  {content.learningOutcomes.title}
                </h2>
              </div>
              <p className={`${midBrown} text-lg md:text-xl`}>
                {content.learningOutcomes.description}
              </p>
              <ul className="space-y-3 pt-2">
                {content.learningOutcomes.items.map((item, index) => (
                   <li key={item.id || `lo-${index}`} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg shadow-sm text-left">
                    <div className={`mt-1 flex-shrink-0 rounded-full ${goldBg} text-[#2A0F0F] h-6 w-6 flex items-center justify-center text-sm font-semibold`}>
                      {index + 1}
                    </div>
                    <span className={`text-[#4A1F1F] dark:text-gray-300 text-base md:text-lg`}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full py-16 md:py-24 lg:py-28 bg-[#2A0F0F] dark:bg-black relative text-[#FFF8F0]">
        {/* ... decorative elements ... */}
        <div className="container relative px-4 md:px-6 z-10 mx-auto">
          <div className="flex flex-col items-center space-y-6 text-center animate-[fadeInUp_1s_ease-out]">
            {/* ... logo, title, description ... */}
             <img
              src={heroLogoUrl}
              alt="Apostolic & Evangelical Theology Logo"
              className="h-16 w-16 md:h-20 md:w-20 mx-auto rounded-full object-cover mb-4 shadow-md border-2 border-[#C5A467]/50"
              onError={(e) => { (e.target as HTMLImageElement).src = logoPlaceholder; }}
            />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-serif">
              {isAuthenticated ? content.cta.authenticated.title : content.cta.unauthenticated.title}
            </h2>
            <p className="mx-auto max-w-[700px] text-[#E0D6C3] text-lg md:text-xl lg:text-2xl">
              {isAuthenticated
                ? content.cta.authenticated.description
                : content.cta.unauthenticated.description}
            </p>

            {/* MODIFIED: Payment Info for Unauthenticated Users */}
            {!isAuthenticated && content?.cta?.unauthenticated && (content.cta.unauthenticated.investmentValueUSD || content.cta.unauthenticated.investmentValueETB) && displayInvestmentValue && (
              <div className="mt-4 p-4 bg-[#C5A467]/10 dark:bg-[#C5A467]/5 border border-[#C5A467]/30 rounded-lg shadow-inner max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2">
                  {userCountryCode === ETHIOPIA_COUNTRY_CODE ? (
                    <Coins className={`h-6 w-6 ${goldAccent} flex-shrink-0`} />
                  ) : (
                    <DollarSign className={`h-6 w-6 ${goldAccent} flex-shrink-0`} />
                  )}
                  <p className={`text-base md:text-lg font-semibold ${goldAccent}`}>
                    {content.cta.unauthenticated.investmentLabel}{' '}
                    <span className="text-[#FFF8F0]">
                      {userCountryCode === ETHIOPIA_COUNTRY_CODE ? 'ETB ' : '$ '}
                      {displayInvestmentValue}
                    </span>
                  </p>
                </div>
                {content.cta.unauthenticated.investmentNote && (
                  <p className="text-xs text-[#E0D6C3]/80 mt-1">
                    {content.cta.unauthenticated.investmentNote}
                  </p>
                )}
              </div>
            )}

            {/* ... buttons ... (no changes here) ... */}
            <div className="pt-4">
              {isAuthenticated ? (
                 <Link to="/dashboard">
                   <Button
                     size="lg"
                     className={`${goldBg} ${goldBgHover} text-[#2A0F0F] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg font-semibold group text-base md:text-lg`}
                   >
                     <LayoutDashboard className="mr-2 h-5 w-5" />
                     Go to My Dashboard
                   </Button>
                 </Link>
              ) : (
                <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-4 mt-2">
                   <Link to="/register">
                    <Button
                      size="lg"
                      className={`${goldBg} ${goldBgHover} text-[#2A0F0F] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg font-semibold text-base md:text-lg`}
                    >
                      Start Application
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button
                      size="lg"
                      variant="outline"
                      className={`border-[#C5A467] text-[#C5A467] hover:bg-[#C5A467]/10 hover:text-[#FFF8F0] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md font-medium text-base md:text-lg`}
                    >
                      Request Info
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;