// src/pages/ProgramOverviewPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  BookOpen, Calendar, Clock, Award, CheckCircle2, FileText,
  GraduationCap, LucideIcon, DollarSign,
} from "lucide-react";
import { useAuth } from '../context/AuthContext';
// Import the data type from your types file
import {
  ProgramOverviewPageContentData,
  CourseContentData as PageCourseData, // Renaming for clarity if needed within this file
  ProgramStructureItemData, // Import if you want to type 'item' in map directly
  ContentListItem // For learning approach points, weekly components, cert details
} from '../types/programOverviewContentTypes';

interface ProgramStructureItemDisplay {
    icon: LucideIcon;
    title: string;
    desc: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const fetchPublicProgramOverviewContent = async (): Promise<ProgramOverviewPageContentData> => {
  const response = await fetch(`${API_BASE_URL}/content/program-overview`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to fetch program overview content" }));
    throw new Error(errorData.message || "Failed to fetch program overview content");
  }
  return response.json();
};

// ... (your style constants remain the same)
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedContent = await fetchPublicProgramOverviewContent();
        setContent(fetchedContent);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error loading program overview content:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, []);

  const getProgramStructureIcon = (title: string): LucideIcon => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("duration")) return Calendar;
    if (lowerTitle.includes("study time")) return Clock;
    if (lowerTitle.includes("credits")) return Award;
    if (lowerTitle.includes("delivery")) return BookOpen;
    return BookOpen;
  };

  if (isLoading) {
    return <div className={`flex justify-center items-center min-h-screen ${sectionBgLight} ${sectionBgDark}`}>Loading Program Overview...</div>;
  }

  if (error || !content) {
    return (
      <div className={`flex flex-col justify-center items-center min-h-screen text-red-500 p-4 text-center ${sectionBgLight} ${sectionBgDark}`}>
        <p className="text-xl font-semibold">Error loading page content.</p>
        <p>{error || "Program overview content could not be retrieved. Please try again later."}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  // Ensure items exist before mapping
  const programStructureItemsDisplay: ProgramStructureItemDisplay[] = (content.programStructure.items || []).map((item: ProgramStructureItemData) => ({
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
                {content.hero.title}
              </h1>
              <p className={`mx-auto max-w-[750px] ${ctaSubText} text-lg md:text-xl lg:text-xl xl:text-2xl`}>
                {content.hero.subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Program Structure & Learning Approach Section */}
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

      {/* Course Curriculum Section */}
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
                key={course.id} // Use course.id from your data
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
                        {(course.weeks || []).map((week) => ( // Use item.id for key
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
                        {(course.assessments || []).map((assessment) => ( // Use item.id for key
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

      {/* Certification Section */}
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
                 {(content.certification.details || []).map((item: ContentListItem) => ( // Use item.id for key
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

      {/* CTA Section (Unauthenticated) */}
      {!isAuthenticated && content.cta && (
        <section className={`w-full py-16 md:py-24 lg:py-28 ${ctaBgLight} ${ctaBgDark} relative ${ctaText}`}>
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-[#C5A467]/30 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-[#C5A467]/30 to-transparent"></div>
          <div className="container mx-auto relative px-4 md:px-6 z-10">
            <div className="flex flex-col items-center space-y-6 text-center">
              <GraduationCap className="h-10 w-10 text-[#C5A467] mb-2" />
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-serif ${ctaText}`}>
                {content.cta.title}
              </h2>
              <p className={`mx-auto max-w-[700px] text-lg md:text-xl lg:text-xl xl:text-2xl ${ctaSubText}`}>
                {content.cta.description}
              </p>
              <div className="mt-4 p-4 bg-[#C5A467]/10 dark:bg-[#C5A467]/5 border border-[#C5A467]/30 rounded-lg shadow-inner max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className={`h-6 w-6 ${goldAccent} flex-shrink-0`} />
                  <p className={`text-base md:text-lg font-semibold ${goldAccent}`}>
                    {content.cta.investmentLabel} <span className={`${ctaText} opacity-90`}>{content.cta.investmentValue}</span>
                  </p>
                </div>
                <p className="text-xs text-[#E0D6C3]/80 mt-1">
                  {content.cta.investmentNote}
                </p>
              </div>
              <div className="space-x-4 pt-4">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-[#C5A467] hover:bg-[#B08F55] text-[#2A0F0F] font-semibold transition-colors text-base md:text-lg"
                  >
                    Apply Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProgramOverviewPage;