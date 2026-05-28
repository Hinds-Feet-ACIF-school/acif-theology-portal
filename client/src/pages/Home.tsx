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

const CONTENT_CACHE_KEY = 'acif_home_content_v1';

const DEFAULT_CONTENT: HomePageContentData = {
  hero: {
    title: "Apostolic & Evangelical Theology",
    subtitle: "A comprehensive online certificate program grounded in Scripture and apostolic doctrine.",
  },
  programHighlights: {
    title: "Program Highlights",
    description: "Our program is designed to equip believers with deep theological knowledge and practical ministry skills.",
    items: [
      { id: "ph1", text: "6 courses covering core theological disciplines" },
      { id: "ph2", text: "Two intakes per year — January and July" },
      { id: "ph3", text: "Certificate of completion with ECTS credits" },
      { id: "ph4", text: "Mentorship and community support" },
    ],
  },
  learningOutcomes: {
    title: "What You Will Learn",
    description: "Graduate with a thorough understanding of biblical foundations and the ability to apply them in ministry.",
    items: [
      { id: "lo1", text: "Biblical hermeneutics and exegesis" },
      { id: "lo2", text: "Apostolic and evangelical theology" },
      { id: "lo3", text: "Church history and doctrinal development" },
      { id: "lo4", text: "Practical ministry and leadership" },
    ],
  },
  cta: {
    unauthenticated: {
      title: "Begin Your Theological Journey",
      description: "Join our next cohort and deepen your understanding of Scripture and apostolic faith.",
      investmentLabel: "Program Investment:",
      investmentNote: "Payment plans available. Contact us for details.",
    },
    authenticated: {
      title: "Continue Your Studies",
      description: "Access your courses and keep growing in knowledge and faith.",
    },
  },
};

const fetchPublicHomePageContent = async (): Promise<HomePageContentData> => {
  const cached = sessionStorage.getItem(CONTENT_CACHE_KEY);
  if (cached) {
    return JSON.parse(cached);
  }
  const response = await fetch(`${API_BASE_URL}/content/home`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to fetch home page content" }));
    throw new Error(errorData.message || "Failed to fetch home page content");
  }
  const data = await response.json();
  sessionStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(data));
  return data;
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
      setIsLoadingLocation(true);
      const fetchWithTimeout = (url: string, ms: number) =>
        Promise.race([
          fetch(url),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), ms)
          ),
        ]);

      const fetchLocationAsync = async () => {
        try {
          let countryCode: string | null = null;

          try {
            const response = await fetchWithTimeout('https://ipapi.co/json/', 3000);
            if (response.ok) {
              const data = await response.json();
              if (data.country_code) countryCode = data.country_code;
            }
          } catch {
            // ipapi.co timed out or failed — try fallback
          }

          if (!countryCode) {
            try {
              const response = await fetchWithTimeout('https://ip-api.com/json/?fields=status,message,countryCode', 3000);
              if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.countryCode) countryCode = data.countryCode;
              }
            } catch {
              // fallback also failed
            }
          }

          setUserCountryCode(countryCode);
        } catch {
          setUserCountryCode(null);
        } finally {
          setIsLoadingLocation(false);
        }
      };
      fetchLocationAsync();
    } else {
      setIsLoadingLocation(false);
      setUserCountryCode(null);
    }
  }, [isAuthenticated]);

  // Effect for setting the display investment value based on location and content
  useEffect(() => {
    if (isAuthenticated || !content?.cta?.unauthenticated) {
      setDisplayInvestmentValue(null);
      return;
    }

    const { investmentValueUSD, investmentValueETB } = content!.cta.unauthenticated;

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


  const displayContent = content ?? (!isLoadingContent ? DEFAULT_CONTENT : null);

  const heroLogoUrl = displayContent?.hero.logoUrl || logoPlaceholder;

  const SkeletonLine = ({ w = 'w-64', h = 'h-6' }: { w?: string; h?: string }) => (
    <div className={`${h} ${w} bg-white/20 animate-pulse rounded`} />
  );
  const SkeletonText = ({ w = 'w-48', h = 'h-5' }: { w?: string; h?: string }) => (
    <div className={`${h} ${w} bg-gray-200 dark:bg-gray-700 animate-pulse rounded`} />
  );


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
          <div className="space-y-3 flex flex-col items-center">
              {isLoadingContent ? (
                <>
                  <SkeletonLine w="w-[480px] max-w-full" h="h-12 md:h-16" />
                  <SkeletonLine w="w-80 max-w-full" h="h-7" />
                </>
              ) : (
                <>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight text-[#FFF8F0] drop-shadow-md animate-[fadeInDown_1s_ease-out] font-serif">
                    {displayContent!.hero.title}
                  </h1>
                  <p className="mx-auto max-w-[750px] text-[#E0D6C3] text-lg md:text-xl lg:text-2xl animate-[fadeInUp_1.2s_ease-out]">
                    {displayContent!.hero.subtitle}
                  </p>
                </>
              )}
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
                {isLoadingContent ? (
                  <SkeletonText w="w-48" h="h-9" />
                ) : (
                  <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight font-serif ${deepBrown}`}>
                    {displayContent!.programHighlights.title}
                  </h2>
                )}
              </div>
              {isLoadingContent ? (
                <div className="space-y-2">
                  <SkeletonText w="w-full" h="h-5" />
                  <SkeletonText w="w-4/5" h="h-5" />
                </div>
              ) : (
                <p className={`${midBrown} text-lg md:text-xl`}>
                  {displayContent!.programHighlights.description}
                </p>
              )}
              <ul className="space-y-3 pt-2">
                {isLoadingContent ? (
                  [1, 2, 3].map(i => (
                    <li key={i} className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg shadow-sm">
                      <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full flex-shrink-0" />
                      <SkeletonText w="w-48" h="h-5" />
                    </li>
                  ))
                ) : (
                  displayContent!.programHighlights.items.map((item, index) => {
                    const IconComponent = getHighlightIcon(item.text);
                    return (
                      <li key={item.id || `ph-${index}`} className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg shadow-sm justify-center lg:justify-start">
                        <IconComponent className={`h-6 w-6 ${goldAccent} flex-shrink-0`} />
                        <span className={`text-[#4A1F1F] dark:text-gray-300 text-base md:text-lg`}>{item.text}</span>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
            <div className="space-y-5 animate-[fadeInLeft_1s_ease-out] text-center lg:text-left">
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                <div className={`h-1 w-12 ${goldBg}`}></div>
                {isLoadingContent ? (
                  <SkeletonText w="w-48" h="h-9" />
                ) : (
                  <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight font-serif ${deepBrown}`}>
                    {displayContent!.learningOutcomes.title}
                  </h2>
                )}
              </div>
              {isLoadingContent ? (
                <div className="space-y-2">
                  <SkeletonText w="w-full" h="h-5" />
                  <SkeletonText w="w-3/4" h="h-5" />
                </div>
              ) : (
                <p className={`${midBrown} text-lg md:text-xl`}>
                  {displayContent!.learningOutcomes.description}
                </p>
              )}
              <ul className="space-y-3 pt-2">
                {isLoadingContent ? (
                  [1, 2, 3].map(i => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg shadow-sm">
                      <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full flex-shrink-0 mt-1" />
                      <SkeletonText w="w-48" h="h-5" />
                    </li>
                  ))
                ) : (
                  displayContent!.learningOutcomes.items.map((item, index) => (
                    <li key={item.id || `lo-${index}`} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg shadow-sm text-left">
                      <div className={`mt-1 flex-shrink-0 rounded-full ${goldBg} text-[#2A0F0F] h-6 w-6 flex items-center justify-center text-sm font-semibold`}>
                        {index + 1}
                      </div>
                      <span className={`text-[#4A1F1F] dark:text-gray-300 text-base md:text-lg`}>{item.text}</span>
                    </li>
                  ))
                )}
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
            {isLoadingContent ? (
              <>
                <SkeletonLine w="w-96 max-w-full" h="h-10 md:h-12" />
                <SkeletonLine w="w-72 max-w-full" h="h-6" />
              </>
            ) : (
              <>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-serif">
                  {isAuthenticated ? displayContent!.cta.authenticated.title : displayContent!.cta.unauthenticated.title}
                </h2>
                <p className="mx-auto max-w-[700px] text-[#E0D6C3] text-lg md:text-xl lg:text-2xl">
                  {isAuthenticated
                    ? displayContent!.cta.authenticated.description
                    : displayContent!.cta.unauthenticated.description}
                </p>
              </>
            )}

            {/* Payment Info for Unauthenticated Users */}
            {!isLoadingContent && !isAuthenticated && displayContent?.cta?.unauthenticated && (displayContent.cta.unauthenticated.investmentValueUSD || displayContent.cta.unauthenticated.investmentValueETB) && displayInvestmentValue && (
              <div className="mt-4 p-4 bg-[#C5A467]/10 dark:bg-[#C5A467]/5 border border-[#C5A467]/30 rounded-lg shadow-inner max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2">
                  {userCountryCode === ETHIOPIA_COUNTRY_CODE ? (
                    <Coins className={`h-6 w-6 ${goldAccent} flex-shrink-0`} />
                  ) : (
                    <DollarSign className={`h-6 w-6 ${goldAccent} flex-shrink-0`} />
                  )}
                  <p className={`text-base md:text-lg font-semibold ${goldAccent}`}>
                    {displayContent.cta.unauthenticated.investmentLabel}{' '}
                    <span className="text-[#FFF8F0]">
                      {userCountryCode === ETHIOPIA_COUNTRY_CODE ? 'ETB ' : '$ '}
                      {displayInvestmentValue}
                    </span>
                  </p>
                </div>
                {displayContent.cta.unauthenticated.investmentNote && (
                  <p className="text-xs text-[#E0D6C3]/80 mt-1">
                    {displayContent.cta.unauthenticated.investmentNote}
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