import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { BookOpen, Calendar, Clock, Award, CheckCircle2, FileText, Users, GraduationCap } from "lucide-react";


const accentColor = "#C5A467";
const accentHoverColor = "#B08F55";
const primaryTextLight = "text-[#2A0F0F]";
const secondaryTextLight = "text-[#4A1F1F]";
const primaryTextDark = "dark:text-[#FFF8F0]";
const secondaryTextDark = "dark:text-[#E0D6C3]/90";
const mutedTextLight = "text-gray-500";
const mutedTextDark = "dark:text-gray-400";
const inputBgLight = "bg-[#FFF8F0]";
const inputBgDark = "dark:bg-gray-800";
const contentBgLight = "bg-white";
const contentBgDark = "dark:bg-gray-900";
const inputBorderLight = "border-[#E0D6C3]";
const inputBorderDark = "dark:border-gray-700";
const focusRingAccent = `focus:ring-[${accentColor}]`;
const focusBorderAccent = `focus:border-[${accentColor}] dark:focus:border-[${accentColor}]`;
const cardBgLight = "bg-white";
const cardBgDark = "dark:bg-gray-900";
const cardBorder = `border border-[#C5A467]/20 dark:border-[#C5A467]/30`;
const sectionBgLight = "bg-[#FFF8F0]";
const sectionBgDark = "dark:bg-gray-950";
const altSectionBgLight = "bg-[#F4EDE4]";
const altSectionBgDark = "dark:bg-gray-900";

export default function ProgramOverviewPage() {
  return (
    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>
      <section className="w-full py-16 md:py-28 lg:py-36 bg-gradient-to-br from-[#2A0F0F] to-[#4A1F1F] dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/path-to-subtle-cross-pattern.svg')] bg-repeat opacity-10 dark:opacity-5"></div>
        <div className="container relative px-4 md:px-6 z-10">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-3">

              <h1 className="text-4xl text-[#FFF8F0] font-bold font-serif tracking-tight sm:text-5xl md:text-6xl lg:text-7xl/none">
                Program Overview
              </h1>
              <p className="mx-auto max-w-[750px] text-[#E0D6C3] md:text-xl lg:text-lg">
                A comprehensive guide to our Certificate in Apostolic & Evangelical Theology.
              </p>
            </div>


          </div>
        </div>
      </section>

      <section className={`w-full py-16 md:py-24 lg:py-32 ${sectionBgLight} ${sectionBgDark}`}>
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            <div className="space-y-6 pl-4">
              <h2 className={`text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Program Structure</h2>
              <p className={`${secondaryTextLight} ${secondaryTextDark} text-lg`}>
                Our certificate program is structured to provide a comprehensive understanding of Apostolic and
                Evangelical theology through six sequential courses.
              </p>
              <div className="grid gap-4">
                {[
                  { icon: Calendar, title: "Duration", desc: "6 months total (6 courses, 4 weeks each)" },
                  { icon: Clock, title: "Study Time", desc: "Approx. 10-12 hours per week" },
                  { icon: Award, title: "Credits", desc: "39 ECTS total (6.5 ECTS per course)" },
                  { icon: BookOpen, title: "Delivery", desc: "100% online with video lectures, readings, and assignments" },
                ].map((item, index) => (
                  <div key={index} className={`flex items-start gap-4 p-4 rounded-lg ${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
                    <item.icon className={`h-6 w-6 text-[${accentColor}] mt-1 flex-shrink-0`} />
                    <div>
                      <h3 className={`font-semibold ${primaryTextLight} ${primaryTextDark}`}>{item.title}</h3>
                      <p className={`text-sm ${mutedTextLight} ${mutedTextDark}`}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6 pr-4">
              <h2 className={`text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Learning Approach</h2>
              <p className={`${secondaryTextLight} ${secondaryTextDark} text-lg`}>
                Our program follows a structured, sequential learning approach to ensure you build a solid foundation.
              </p>
              <ul className="space-y-3">
                {[
                    "Courses must be taken in sequence.",
                    "Weekly content unlocks progressively.",
                    "Must complete current week's materials before accessing next week.",
                    "Biannual intakes (January and July start dates).",
                    "Cohort-based learning with peer interaction forums.",
                     "Mid-cohort entry: Complete the current cohort's remaining lessons. Finish any missed lessons during the next cohort intake (free of charge) to receive your certificate."
                ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                       <CheckCircle2 className={`h-5 w-5 text-[${accentColor}] mt-0.5 flex-shrink-0`} />
                       <span className={`${secondaryTextLight} ${secondaryTextDark}`}>{item}</span>
                    </li>
                ))}
              </ul>
              <div className="pt-4">
                <h3 className={`font-semibold mb-3 ${primaryTextLight} ${primaryTextDark}`}>Weekly Learning Components</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                   {[
                    "Video Lectures", "Reading Materials", "Quizzes & Assignments", "Discussion Forums"
                   ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full bg-[${accentColor}]`}></div>
                        <span className={`${secondaryTextLight} ${secondaryTextDark}`}>{item}</span>
                      </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>





      <section className={`w-full py-16 md:py-24 lg:py-32 ${altSectionBgLight} ${altSectionBgDark}`}>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h2 className={`text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Certification</h2>
              <p className={`mx-auto max-w-[700px] md:text-xl ${secondaryTextLight} ${secondaryTextDark}`}>
                Upon successful completion of all program requirements.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center justify-center">
            <div className="flex-1 max-w-md w-full">
              <div className={`aspect-[4/3] relative ${sectionBgLight} ${sectionBgDark} rounded-lg shadow-lg flex items-center justify-center p-4 border-4 border-double border-[${accentColor}] dark:border-[${accentHoverColor}]`}>
                 <div className={`border border-dashed border-[${accentColor}]/50 dark:border-[${accentHoverColor}]/50 p-6 w-full h-full flex flex-col items-center justify-center text-center`}>
                  <GraduationCap className={`h-12 w-12 text-[${accentColor}] mb-4`} />
                  <h3 className={`text-lg font-semibold font-serif ${primaryTextLight} ${primaryTextDark}`}>Certificate in</h3>
                   <h3 className={`text-xl font-bold font-serif mb-2 ${primaryTextLight} ${primaryTextDark}`}>Apostolic & Evangelical Theology</h3>
                  <p className={`text-xs mt-3 ${secondaryTextLight} ${secondaryTextDark}`}>Awarded by the International Apostolic Church</p>
                  <p className={`text-sm font-semibold mt-1 ${primaryTextLight} ${primaryTextDark}`}>39 ECTS Credits</p>
                </div>
              </div>
            </div>
            <div className="flex-1 max-w-md space-y-4">
              <h3 className={`text-xl font-semibold ${primaryTextLight} ${primaryTextDark}`}>What You'll Receive</h3>
              <ul className="space-y-3">
                 {[
                    "Digital certificate suitable for printing (with unique ID)",
                    "Official transcript detailing courses and grades",
                    "Recognition of completion from the Apostolic Church International",
                    "Solid foundation for ministry roles or further theological studies",
                 ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className={`h-5 w-5 text-[${accentColor}] mt-0.5 flex-shrink-0`} />
                      <span className={`${secondaryTextLight} ${secondaryTextDark}`}>{item}</span>
                    </li>
                 ))}
              </ul>
              <div className="pt-4">
                <p className={`italic ${mutedTextLight} ${mutedTextDark}`}>"Study to show yourself approved unto God..." – 2 Timothy 2:15</p>
              </div>
            </div>
          </div>
        </div>
      </section>

       <section className="w-full py-16 md:py-24 lg:py-28 bg-[#2A0F0F] dark:bg-black relative text-[#FFF8F0]">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-[#C5A467]/30 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-[#C5A467]/30 to-transparent"></div>

        <div className="container relative px-4 md:px-6 z-10">
          <div className="flex flex-col items-center space-y-6 text-center">
            <GraduationCap className={`h-10 w-10 text-[${accentColor}] mb-2`} />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-serif">
              Ready to Begin Your Theological Journey?
            </h2>
            <p className="mx-auto max-w-[700px] text-[#E0D6C3] md:text-xl lg:text-lg">
              Join our next cohort and deepen your understanding of Apostolic and Evangelical theology.
            </p>
            <div className="space-x-4 pt-4">
              <Link to="/register">
                <Button
                  size="lg"
                  className={`bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors`}
                >
                  Apply Now
                </Button>
              </Link>
              <Link to="/courses">

              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}