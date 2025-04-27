import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { FileText, Users, CheckCircle2, BookOpen, Calendar, Clock, Award, User, LayoutDashboard } from 'lucide-react';


const accentColor = "#C5A467";
const accentHoverColor = "#B08F55";
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
const ctaBgLight = "bg-[#2A0F0F]";
const ctaBgDark = "dark:bg-black";
const ctaText = "text-[#FFF8F0]";
const ctaSubText = "text-[#E0D6C3]";

export default function CourseIntroductionPage() {

  const isProfileComplete = false;

  return (

    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>

      <section className="w-full py-16 md:py-28 lg:py-36 bg-gradient-to-br from-[#2A0F0F] to-[#4A1F1F] dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/path-to-subtle-cross-pattern.svg')] bg-repeat opacity-10 dark:opacity-5"></div>
        <div className="container relative px-4 md:px-6 z-10">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-3">
              <h1 className="text-4xl text-[#FFF8F0] font-bold font-serif tracking-tight sm:text-5xl md:text-6xl lg:text-7xl/none">
                Welcome to Your Course
              </h1>
              <p className="mx-auto max-w-[750px] text-[#E0D6C3] md:text-xl lg:text-lg">
                An introduction to navigating your studies in the Certificate Program.
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className={`w-full py-16 md:py-24 px-4 lg:py-32 ${sectionBgLight} ${sectionBgDark}`}>
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">

            <div className="space-y-6">
              <h2 className={`text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>How Your Course Works</h2>
              <p className={`${secondaryTextLight} ${secondaryTextDark} text-lg`}>
                Our certificate program follows a structured online format to guide your learning.
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

            <div className="space-y-6">
              <h2 className={`text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Weekly Structure</h2>
              <p className={`${secondaryTextLight} ${secondaryTextDark} text-lg`}>
                Each week follows a consistent pattern to help you manage your learning effectively.
              </p>
              <div className="grid gap-4">
                 {[
                    { icon: BookOpen, title: "Learning Materials", desc: "Video lectures and assigned readings" },
                    { icon: FileText, title: "Assessments", desc: "Quizzes, assignments, and discussion participation" },
                    { icon: Users, title: "Community", desc: "Discussion forums and peer interaction" },
                    { icon: CheckCircle2, title: "Progress Tracking", desc: "Weekly completion requirements to unlock next modules" },
                 ].map((item, index) => (
                    <div key={index} className={`flex items-start gap-4 p-4 rounded-lg ${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
                        <div className={`rounded-full bg-[${accentColor}]/10 dark:bg-[${accentColor}]/20 p-2 flex-shrink-0`}>
                          <item.icon className={`h-5 w-5 text-[${accentColor}]`} />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${primaryTextLight} ${primaryTextDark}`}>{item.title}</h3>
                          <p className={`text-sm ${mutedTextLight} ${mutedTextDark}`}>{item.desc}</p>
                        </div>
                    </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className={`w-full py-16 md:py-24 lg:py-32 ${altSectionBgLight} ${altSectionBgDark}`}>
         <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h2 className={`text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Assessment & Grading</h2>
              <p className={`mx-auto max-w-[700px] md:text-xl ${secondaryTextLight} ${secondaryTextDark}`}>
                How your performance will be evaluated throughout the program.
              </p>
            </div>
          </div>


          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {[
              { icon: FileText, title: "Quizzes", weight: "20%" },
              { icon: FileText, title: "Assignments", weight: "30%" },
              { icon: FileText, title: "Final Projects", weight: "30%" },
              { icon: Users, title: "Participation", weight: "20%" },
            ].map((item, index) => (
              <div key={index} className={`flex flex-col items-center p-6 ${cardBgLight} ${cardBgDark} ${cardBorder} rounded-lg shadow-md text-center`}>
                <div className={`rounded-full bg-[${accentColor}]/10 dark:bg-[${accentColor}]/20 p-3 mb-4`}>
                  <item.icon className={`h-6 w-6 text-[${accentColor}]`} />
                </div>
                <h3 className={`text-lg font-semibold mb-1 ${primaryTextLight} ${primaryTextDark}`}>{item.title}</h3>
                <p className={`${secondaryTextLight} ${secondaryTextDark}`}>{item.weight} of final grade</p>
              </div>
            ))}
          </div>


          <div>
            <h3 className={`text-xl font-semibold font-serif mb-6 text-center ${primaryTextLight} ${primaryTextDark}`}>Grading Scale</h3>
            <div className="max-w-xl mx-auto overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-[auto_1fr] text-sm">
                 {[
                    { range: "90-100%", grade: "A (Excellent)" },
                    { range: "80-89%", grade: "B (Very Good)" },
                    { range: "70-79%", grade: "C (Good)" },
                    { range: "60-69%", grade: "D (Satisfactory)" },
                    { range: "Below 60%", grade: "F (Fail / Requires Repeat)" },
                 ].map((item, index, arr) => (
                    <React.Fragment key={item.range}>
                      <div className={`p-3 font-medium ${primaryTextLight} ${primaryTextDark} ${index === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''} ${index < arr.length -1 ? 'border-b border-r border-gray-200 dark:border-gray-700' : 'border-r border-gray-200 dark:border-gray-700'}`}>
                        {item.range}
                      </div>
                      <div className={`p-3 ${secondaryTextLight} ${secondaryTextDark} ${index === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''} ${index < arr.length -1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
                        {item.grade}
                      </div>
                    </React.Fragment>
                 ))}
              </div>
            </div>
             <p className={`text-center text-xs mt-4 ${mutedTextLight} ${mutedTextDark}`}>
                A minimum grade of 'D' (60%) is required to pass each course and the overall program.
             </p>
          </div>
        </div>
      </section>


      <section className={`w-full py-16 md:py-24 lg:py-32 ${sectionBgLight} ${sectionBgDark}`}>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h2 className={`text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Getting Started</h2>
              <p className={`mx-auto max-w-[700px] md:text-xl ${secondaryTextLight} ${secondaryTextDark}`}>
                Follow these steps to begin your learning journey.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">

            <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-md flex flex-col`}>
              <CardHeader className="flex-grow">
                <div className="flex items-center justify-center mb-4">
                  <div className={`rounded-full bg-[${accentColor}]/10 dark:bg-[${accentColor}]/20 p-3`}>
                    <div className={`rounded-full bg-[${accentColor}] text-[#2A0F0F] h-8 w-8 flex items-center justify-center font-bold text-lg`}>
                      1
                    </div>
                  </div>
                </div>
                <CardTitle className={`text-center font-serif ${primaryTextLight} ${primaryTextDark}`}>Complete Your Profile</CardTitle>
                <CardDescription className={`text-center ${secondaryTextLight} ${secondaryTextDark}`}>
                  {isProfileComplete ? "Your profile is up to date!" : "Update your personal information and preferences."}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center pt-0 pb-6">

                 {isProfileComplete ? (
                    <div className={`flex items-center gap-2 text-sm ${mutedTextLight} ${mutedTextDark}`}>
                        <CheckCircle2 className="h-4 w-4 text-green-500" /> Profile Complete
                    </div>
                 ) : (
                    <Link to="/profile">
                        <Button variant="outline" size="sm" className={`border-[#4A1F1F]/50 dark:border-[#E0D6C3]/50 ${secondaryTextLight} ${secondaryTextDark} hover:text-[#2A0F0F] hover:border-[#2A0F0F] dark:hover:text-white dark:hover:border-white hover:bg-transparent dark:hover:bg-transparent transition-colors`}>
                        <User className="mr-2 h-4 w-4" /> Go to Profile
                        </Button>
                    </Link>
                 )}
              </CardFooter>
            </Card>

            <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-md flex flex-col`}>
              <CardHeader className="flex-grow">
                <div className="flex items-center justify-center mb-4">
                   <div className={`rounded-full bg-[${accentColor}]/10 dark:bg-[${accentColor}]/20 p-3`}>
                    <div className={`rounded-full bg-[${accentColor}] text-[#2A0F0F] h-8 w-8 flex items-center justify-center font-bold text-lg`}>
                      2
                    </div>
                  </div>
                </div>
                <CardTitle className={`text-center font-serif ${primaryTextLight} ${primaryTextDark}`}>Explore Dashboard</CardTitle>
                <CardDescription className={`text-center ${secondaryTextLight} ${secondaryTextDark}`}>
                  Familiarize yourself with courses, assignments, and progress tracking.
                </CardDescription>
              </CardHeader>
               <CardFooter className="flex justify-center pt-0 pb-6">
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className={`border-[#4A1F1F]/50 dark:border-[#E0D6C3]/50 ${secondaryTextLight} ${secondaryTextDark} hover:text-[#2A0F0F] hover:border-[#2A0F0F] dark:hover:text-white dark:hover:border-white hover:bg-transparent dark:hover:bg-transparent transition-colors`}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Go to Dashboard
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-md flex flex-col`}>
              <CardHeader className="flex-grow">
                <div className="flex items-center justify-center mb-4">
                  <div className={`rounded-full bg-[${accentColor}]/10 dark:bg-[${accentColor}]/20 p-3`}>
                    <div className={`rounded-full bg-[${accentColor}] text-[#2A0F0F] h-8 w-8 flex items-center justify-center font-bold text-lg`}>
                      3
                    </div>
                  </div>
                </div>
                <CardTitle className={`text-center font-serif ${primaryTextLight} ${primaryTextDark}`}>Start Your First Course</CardTitle>
                <CardDescription className={`text-center ${secondaryTextLight} ${secondaryTextDark}`}>
                  Begin with 'Foundations of the Christian Faith'.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center pt-0 pb-6">

                <Link to="/courses">
                  <Button size="sm" className={`bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors`}>
                    <BookOpen className="mr-2 h-4 w-4" /> Go to Course
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>


      <section className={`w-full py-16 md:py-24 lg:py-28 ${ctaBgLight} ${ctaBgDark} relative ${ctaText}`}>
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-[#C5A467]/30 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-[#C5A467]/30 to-transparent"></div>

        <div className="container relative px-4 md:px-6 z-10">
          <div className="flex flex-col items-center space-y-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-serif">
              Begin Your Studies
            </h2>
            <p className={`mx-auto max-w-[700px] ${ctaSubText} md:text-xl lg:text-lg`}>
              Your first course module is ready. Access your dashboard to start learning.
            </p>
            <div className="space-x-4 pt-4">
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className={`bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors`}
                >
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/courses/foundations">
                 <Button
                  size="lg"
                  variant="outline"
                   className={`border-[${accentColor}] text-[${accentColor}] hover:bg-[${accentColor}]/10 hover:text-[#FFF8F0] transition-all duration-300 ease-in-out`}
                >
                  Start First Course
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}