import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  BookOpen, Calendar, Clock, Award, CheckCircle2, FileText,
  GraduationCap, LucideIcon, DollarSign, Coins, LayoutDashboard,
} from "lucide-react";
import { useAuth } from '../context/AuthContext';
import {
  ProgramOverviewPageContentData,
  CourseContentData as PageCourseData,
  ProgramStructureItemData,
  ContentListItem
} from '../types/programOverviewContentTypes'; 

interface ProgramStructureItemDisplay {
    icon: LucideIcon;
    title: string;
    desc: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const ETHIOPIA_COUNTRY_CODE = 'ET'; // Define for currency localization

const fetchPublicProgramOverviewContent = async (): Promise<ProgramOverviewPageContentData> => {
  const response = await fetch(`${API_BASE_URL}/content/program-overview`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to fetch program overview content" }));
    throw new Error(errorData.message || "Failed to fetch program overview content");
  }
  return response.json();
};

// Style constants
const primaryTextLight = "text-[#2A0F0F]";
const secondaryTextLight = "text-[#4A1F1F]";
const primaryTextDark = "dark:text-[#FFF8F0]";
const secondaryTextDark = "dark:text-[#E0D6C3]/90";
const mutedTextLight = "text-gray-500";
const mutedTextDark = "dark:text-gray-400";
const cardBgLight = "bg-white";
const cardBgDark = "dark:bg-gray-900";
const cardBorder = `border border-[#C5A467]/20 dark:border-[#C5A467]/30`;
const sectionBgLight = "bg-[#FFF8F0]";
const sectionBgDark = "dark:bg-gray-950";
const altSectionBgLight = "bg-[#F4EDE4]";
const altSectionBgDark = "dark:bg-gray-900";
const headerTextLight = "text-[#FFF8F0]";
const headerTextDark = "dark:text-[#FFF8F0]";
const ctaBgLight = "bg-[#2A0F0F]";
const ctaBgDark = "dark:bg-black";
const ctaText = "text-[#FFF8F0]";
const ctaSubText = "text-[#E0D6C3]";
const goldAccent = 'text-[#C5A467]';


const ProgramOverviewPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState<ProgramOverviewPageContentData | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true); // Renamed
  const [errorContent, setErrorContent] = useState<string | null>(null); // Renamed

  // State for currency localization
  const [userCountryCode, setUserCountryCode] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [displayInvestmentValue, setDisplayInvestmentValue] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoadingContent(true);
        setErrorContent(null);
        const fetchedContent = await fetchPublicProgramOverviewContent();
        setContent(fetchedContent);
      } catch (err) {
        setErrorContent(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error loading program overview content:", err);
      } finally {
        setIsLoadingContent(false);
      }
    };
    loadContent();
  }, []);

  // Effect for fetching user location
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("ProgramOverviewPage: Attempting to fetch location because user is not authenticated.");
      setIsLoadingLocation(true);
      const fetchLocationAsync = async () => {
        console.log("ProgramOverviewPage: fetchLocationAsync started.");
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
                console.log("ProgramOverviewPage: Successfully got country code from ipapi.co:", countryCode);
              }
            }
          } catch (err) {
            console.log("ProgramOverviewPage: ipapi.co failed, trying ip-api.com");
          }

          // Second try: ip-api.com (fallback)
          if (!countryCode) {
            try {
              const response = await fetch('https://ip-api.com/json/?fields=status,message,countryCode');
              if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.countryCode) {
                  countryCode = data.countryCode;
                  console.log("ProgramOverviewPage: Successfully got country code from ip-api.com:", countryCode);
                }
              }
            } catch (err) {
              console.log("ProgramOverviewPage: ip-api.com failed");
            }
          }

          // Set the country code if we got one
          if (countryCode) {
            console.log("ProgramOverviewPage: Setting country code:", countryCode);
            setUserCountryCode(countryCode);
          } else {
            console.warn("ProgramOverviewPage: Could not determine country code from any service");
            setUserCountryCode(null);
          }
        } catch (err) {
          console.error("ProgramOverviewPage: Error in location detection:", err);
          setUserCountryCode(null);
        } finally {
          setIsLoadingLocation(false);
          console.log("ProgramOverviewPage: Location detection completed");
        }
      };
      fetchLocationAsync();
    } else {
      console.log("ProgramOverviewPage: User is authenticated, skipping location fetch.");
      setIsLoadingLocation(false);
      setUserCountryCode(null);
    }
  }, [isAuthenticated]);

  // Effect for setting the display investment value
  useEffect(() => {
    if (isAuthenticated || !content?.cta) {
      setDisplayInvestmentValue(null);
      return;
    }

    const { investmentValueUSD, investmentValueETB } = content.cta;

    // For debugging:
    // console.log("ProgramOverviewPage CTA - investmentValueUSD:", investmentValueUSD);
    // console.log("ProgramOverviewPage CTA - investmentValueETB:", investmentValueETB);
    // console.log("ProgramOverviewPage CTA - userCountryCode:", userCountryCode);
    // console.log("ProgramOverviewPage CTA - isLoadingLocation:", isLoadingLocation);


    if (isLoadingLocation && userCountryCode === null) {
      setDisplayInvestmentValue(investmentValueUSD || null);
      return;
    }
    
    if (userCountryCode === ETHIOPIA_COUNTRY_CODE && investmentValueETB) {
      setDisplayInvestmentValue(investmentValueETB);
    } 
    else if (investmentValueUSD) {
      setDisplayInvestmentValue(investmentValueUSD);
    }
    else if (investmentValueETB) { // Fallback if only ETB is defined
        setDisplayInvestmentValue(investmentValueETB);
    }
    else {
      setDisplayInvestmentValue(null);
    }

  }, [content, userCountryCode, isLoadingLocation, isAuthenticated]);


  const getProgramStructureIcon = (title: string): LucideIcon => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("duration")) return Calendar;
    if (lowerTitle.includes("study time")) return Clock;
    if (lowerTitle.includes("credits")) return Award;
    if (lowerTitle.includes("delivery")) return BookOpen;
    return BookOpen;
  };

  if (isLoadingContent) {
    return <div className={`flex justify-center items-center min-h-screen ${sectionBgLight} ${sectionBgDark}`}>Loading Program Overview...</div>;
  }

  if (errorContent || !content) {
    return (
      <div className={`flex flex-col justify-center items-center min-h-screen text-red-500 p-4 text-center ${sectionBgLight} ${sectionBgDark}`}>
        <p className="text-xl font-semibold">Error loading page content.</p>
        <p>{errorContent || "Program overview content could not be retrieved. Please try again later."}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  const programStructureItemsDisplay: ProgramStructureItemDisplay[] = (content.programStructure?.items || []).map((item: ProgramStructureItemData) => ({
    icon: getProgramStructureIcon(item.title),
    title: item.title,
    desc: item.desc,
  }));

  return (
    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>
      {/* Hero Section */}
      <section className="w-full py-16 md:py-28 lg:py-36 bg-gradient-to-br from-[#2A0F0F] to-[#4A1F1F] dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/path-to-subtle-cross-pattern.svg')] bg-repeat opacity-10 dark:opacity-5"></div>
        <div className="container mx-auto relative px-4 md:px-6 z-10">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-3">
              <h1 className={`text-4xl ${headerTextLight} ${headerTextDark} font-bold font-serif tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl/none`}>
                {content.hero?.title}
              </h1>
              <p className={`mx-auto max-w-[750px] ${ctaSubText} text-lg md:text-xl lg:text-xl xl:text-2xl`}>
                {content.hero?.subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Program Structure & Learning Approach Section */}
      {content.programStructure && content.learningApproach && (
        <section className={`w-full py-16 md:py-24 lg:py-32 ${sectionBgLight} ${sectionBgDark}`}>
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
              {/* Program Structure */}
              <div className="space-y-6 pl-4 text-center lg:text-left">
                <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>{content.programStructure.title}</h2>
                <p className={`${secondaryTextLight} ${secondaryTextDark} text-base md:text-lg xl:text-xl`}>
                  {content.programStructure.description}
                </p>
                <div className="grid gap-4">
                  {programStructureItemsDisplay.map((item, index) => (
                    <div key={index} className={`flex items-start gap-4 p-4 rounded-lg ${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
                      <item.icon className="h-6 w-6 text-[#C5A467] mt-1 flex-shrink-0" />
                      <div>
                        <h3 className={`font-semibold ${primaryTextLight} ${primaryTextDark}`}>{item.title}</h3>
                        <p className={`text-sm ${mutedTextLight} ${mutedTextDark}`}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Learning Approach */}
              <div className="space-y-6 pr-4 text-center lg:text-left">
                <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>{content.learningApproach.title}</h2>
                <p className={`${secondaryTextLight} ${secondaryTextDark} text-base md:text-lg xl:text-xl`}>
                  {content.learningApproach.description}
                </p>
                <ul className="space-y-3">
                  {(content.learningApproach.points || []).map((item: ContentListItem) => (
                      <li key={item.id} className="flex items-start gap-3">
                         <CheckCircle2 className="h-5 w-5 text-[#C5A467] mt-0.5 flex-shrink-0" />
                         <span className={`${secondaryTextLight} ${secondaryTextDark}`}>{item.text}</span>
                      </li>
                  ))}
                </ul>
                <div className="pt-4">
                  <h3 className={`font-semibold mb-3 ${primaryTextLight} ${primaryTextDark}`}>{content.learningApproach.weeklyComponentsTitle}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                     {(content.learningApproach.weeklyComponents || []).map((item: ContentListItem) => (
                        <div key={item.id} className="flex items-center gap-2 justify-center sm:justify-start">
                          <div className="h-2.5 w-2.5 rounded-full bg-[#C5A467]"></div>
                          <span className={`${secondaryTextLight} ${secondaryTextDark}`}>{item.text}</span>
                        </div>
                     ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Course Curriculum Section */}
      {content.courseCurriculum && (
        <section className={`w-full py-16 md:py-24 lg:py-32 ${altSectionBgLight} ${altSectionBgDark}`}>
          <div className="container mx-auto px-4 md:px-6">
             <div className="flex flex-col items-center space-y-4 text-center mb-12 md:mb-16 lg:mb-20">
              <div className="space-y-2">
                <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>{content.courseCurriculum.title}</h2>
                <p className={`mx-auto max-w-[700px] text-base md:text-lg xl:text-xl ${secondaryTextLight} ${secondaryTextDark}`}>
                  {content.courseCurriculum.description}
                </p>
              </div>
            </div>

            <div className="space-y-12 md:space-y-16 lg:space-y-20">
              {(content.courseCurriculum.courses || []).map((course: PageCourseData) => (
                <div
                  key={course.id}
                  className={`${cardBgLight} ${cardBgDark} ${cardBorder} rounded-lg overflow-hidden shadow-lg`}
                >
                  <div className={`p-6 bg-[#2A0F0F] dark:bg-gray-800`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <h3 className={`text-xl sm:text-2xl lg:text-3xl font-semibold font-serif flex-1 ${headerTextLight}`}>{course.title}</h3>
                      <div className="flex items-center gap-2 text-sm font-medium bg-[#C5A467]/10 dark:bg-[#C5A467]/20 text-[#C5A467] px-3 py-1 rounded-full">
                        <Clock className="h-4 w-4" />
                        <span>{course.ects} ECTS</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className={`${secondaryTextLight} ${secondaryTextDark} mb-6 text-base md:text-lg`}>{course.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <div>
                        <h4 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${primaryTextLight} ${primaryTextDark}`}>
                          <Calendar className="h-5 w-5 text-[#C5A467]" />
                          Weekly Breakdown
                        </h4>
                        <ul className="space-y-2 text-sm">
                          {(course.weeks || []).map((week) => (
                            <li key={week.id} className={`flex items-start gap-2 ${secondaryTextLight} ${secondaryTextDark}`}>
                              <CheckCircle2 className="h-4 w-4 text-[#C5A467] mt-1 flex-shrink-0" />
                              <span>{week.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${primaryTextLight} ${primaryTextDark}`}>
                          <FileText className="h-5 w-5 text-[#C5A467]" />
                          Assessments
                        </h4>
                        <ul className="space-y-2 text-sm">
                          {(course.assessments || []).map((assessment) => (
                            <li key={assessment.id} className={`flex items-start gap-2 ${secondaryTextLight} ${secondaryTextDark}`}>
                              <CheckCircle2 className="h-4 w-4 text-[#C5A467] mt-1 flex-shrink-0" />
                              <span>{assessment.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certification Section */}
      {content.certification && (
        <section className={`w-full py-16 md:py-24 lg:py-32 ${sectionBgLight} ${sectionBgDark}`}>
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center mb-12 md:mb-16 lg:mb-20">
              <div className="space-y-2">
                <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>{content.certification.title}</h2>
                <p className={`mx-auto max-w-[700px] text-base md:text-lg xl:text-xl ${secondaryTextLight} ${secondaryTextDark}`}>
                  {content.certification.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start justify-center">
              <div className="flex-1 max-w-md w-full flex flex-col items-center text-center">
                <div className={`aspect-[4/3] relative w-full ${altSectionBgLight} ${altSectionBgDark} rounded-lg shadow-lg flex items-center justify-center p-4 border-4 border-double border-[#C5A467] dark:border-[#B08F55]`}>
                   <div className="border border-dashed border-[#C5A467]/50 dark:border-[#B08F55]/50 p-6 w-full h-full flex flex-col items-center justify-center text-center">
                    <GraduationCap className="h-12 w-12 text-[#C5A467] mb-4" />
                    <h3 className={`text-lg font-semibold font-serif ${primaryTextLight} ${primaryTextDark}`}>{content.certification.mockup.titlePrefix}</h3>
                     <h3 className={`text-xl font-bold font-serif mb-2 ${primaryTextLight} ${primaryTextDark}`}>{content.certification.mockup.mainTitle}</h3>
                    <p className={`text-xs mt-3 ${secondaryTextLight} ${secondaryTextDark}`}>{content.certification.mockup.awardedBy}</p>
                    <p className={`text-sm font-semibold mt-1 ${primaryTextLight} ${primaryTextDark}`}>{content.certification.mockup.credits}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 max-w-md space-y-4 text-center md:text-left">
                 <h3 className={`text-xl font-semibold ${primaryTextLight} ${primaryTextDark}`}>{content.certification.whatYoullReceiveTitle}</h3>
                <ul className="space-y-3">
                   {(content.certification.details || []).map((item: ContentListItem) => (
                      <li key={item.id} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#C5A467] mt-0.5 flex-shrink-0" />
                        <span className={`${secondaryTextLight} ${secondaryTextDark}`}>{item.text}</span>
                      </li>
                   ))}
                </ul>
                <div className="pt-4">
                  <p className={`italic ${mutedTextLight} ${mutedTextDark}`}>{content.certification.quote}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className={`w-full py-16 md:py-24 lg:py-28 ${ctaBgLight} ${ctaBgDark} relative text-[#FFF8F0]`}>
        <div className="container relative px-4 md:px-6 z-10 mx-auto">
          <div className="flex flex-col items-center space-y-6 text-center animate-[fadeInUp_1s_ease-out]">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-serif">
              {content.cta.title}
            </h2>
            <p className="mx-auto max-w-[700px] text-[#E0D6C3] text-lg md:text-xl lg:text-2xl">
              {content.cta.description}
            </p>

            {/* Payment Info */}
            {!isAuthenticated && content?.cta && (content.cta.investmentValueUSD || content.cta.investmentValueETB) && displayInvestmentValue && (
              <div className="mt-4 p-4 bg-[#C5A467]/10 dark:bg-[#C5A467]/5 border border-[#C5A467]/30 rounded-lg shadow-inner max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2">
                  {userCountryCode === ETHIOPIA_COUNTRY_CODE ? (
                    <Coins className={`h-6 w-6 ${goldAccent} flex-shrink-0`} />
                  ) : (
                    <DollarSign className={`h-6 w-6 ${goldAccent} flex-shrink-0`} />
                  )}
                  <p className={`text-base md:text-lg font-semibold ${goldAccent}`}>
                    {content.cta.investmentLabel}{' '}
                    <span className="text-[#FFF8F0]">
                      {userCountryCode === ETHIOPIA_COUNTRY_CODE ? 'ETB ' : '$ '}
                      {displayInvestmentValue}
                    </span>
                  </p>
                </div>
                {content.cta.investmentNote && (
                  <p className="text-xs text-[#E0D6C3]/80 mt-1">
                    {content.cta.investmentNote}
                  </p>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="pt-4">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className={`bg-[#C5A467] hover:bg-[#B08F55] text-[#2A0F0F] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg font-semibold group text-base md:text-lg`}
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
                      className={`bg-[#C5A467] hover:bg-[#B08F55] text-[#2A0F0F] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg font-semibold text-base md:text-lg`}
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

export default ProgramOverviewPage;