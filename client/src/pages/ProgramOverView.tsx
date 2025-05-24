// src/pages/ProgramOverviewPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import {
  BookOpen,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  FileText,
  GraduationCap,
  LucideIcon,
  DollarSign, // Added DollarSign
} from "lucide-react";
import { useAuth } from '../context/AuthContext.js';

interface Course {
  id: string;
  title: string;
  description: string;
  weeks: string[];
  assessments: string[];
  ects: number;
}

interface ProgramStructureItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

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
const headerTextDark = "dark:text-[#FFF8F0]"; // Corrected, was primaryTextDark
const ctaBgLight = "bg-[#2A0F0F]";
const ctaBgDark = "dark:bg-black";
const ctaText = "text-[#FFF8F0]";
const ctaSubText = "text-[#E0D6C3]";
const goldAccent = 'text-[#C5A467]'; // Added for consistency

const ProgramOverviewPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const courses: Course[] = [
        {
      id: "foundations",
      title: "Foundations of the Christian Faith",
      description:
        "Introduces the central tenets of Christianity—God's nature, Jesus Christ's identity, the Holy Spirit's work, and salvation by grace through faith. Emphasizes both biblical understanding and personal application.",
      weeks: [
        "Week 1: The Nature & Attributes of God (Gen 1–2, Ps 139)",
        "Week 2: The Person & Work of Jesus Christ (John 1, Col 1)",
        "Week 3: The Holy Spirit & Spiritual Birth (John 3, Acts 2)",
        "Week 4: Salvation & the New Life (Romans 5–6, Ephesians 2)",
      ],
      assessments: ["Short Quizzes (Weeks 1–3)", "Reflection Essay (Week 4)"],
      ects: 6.5,
    },
    {
      id: "bible",
      title: "The Bible: God's Word",
      description:
        "Explores the Bible's formation, authority, and interpretation. Equips students with methods to study and apply Scripture faithfully in personal life and ministry.",
      weeks: [
        "Week 1: Canon & Inspiration (2 Tim 3:16, 2 Pet 1:19–21)",
        "Week 2: Old & New Testament Overview",
        "Week 3: Hermeneutics (Context, Culture)",
        "Week 4: Applying Scripture Today (Devotional exercise & final quiz)",
      ],
      assessments: ["Weekly Reading Summaries", "Exegesis Project", "Final Quiz"],
      ects: 6.5,
    },
    {
      id: "apostolic",
      title: "Apostolic Doctrine",
      description:
        "Presents Oneness theology, baptism in Jesus' name, Holy Spirit baptism, and the call to holiness. Guides students in understanding and defending these Apostolic doctrines biblically and practically.",
      weeks: [
        "Week 1: The Oneness of God (Deut 6:4, Isa 9:6)",
        "Week 2: Baptism in Jesus' Name (Acts 2, Acts 10, Acts 19)",
        "Week 3: Holy Spirit Baptism & Tongues (Acts 8, 1 Cor 14)",
        "Week 4: Holiness & Apostolic Identity",
      ],
      assessments: ["Doctrinal Discussion Forum", "Essay: Defense of One Apostolic Doctrine", "Weekly Quizzes"],
      ects: 6.5,
    },
    {
      id: "spiritual",
      title: "Spiritual Growth & Christian Living",
      description:
        "Builds practical habits of prayer, fasting, Bible reading, and fellowship. Encourages holistic Christian ethics and personal sanctification.",
      weeks: [
        "Week 1: Prayer & Fasting (practice: 1-day group fast, journaling)",
        "Week 2: Overcoming Temptation & Sin (Gal 5, Eph 6)",
        "Week 3: The Fruit of the Spirit (Daily Spiritual Inventory)",
        "Week 4: Building a Devotional Lifestyle (Final Self-assessment)",
      ],
      assessments: ["Personal Devotion Log", "Weekly Quizzes", "Final Reflection Paper"],
      ects: 6.5,
    },
    {
      id: "evangelism",
      title: "Introduction to Evangelism",
      description:
        "Equips students with biblical frameworks for evangelism and outreach, including personal testimony, apologetics, and cross-cultural communication of the Gospel.",
      weeks: [
        "Week 1: The Great Commission (Matt 28, Mark 16)",
        "Week 2: Personal Testimony & Witnessing (Record your testimony)",
        "Week 3: Basic Apologetics (Common objections & responses)",
        "Week 4: Evangelism Project (Submit outreach plan)",
      ],
      assessments: ["Weekly Quizzes", "Personal Testimony Video/Essay", "Outreach/Apologetics Plan"],
      ects: 6.5,
    },
    {
      id: "church",
      title: "Church Life & Service",
      description:
        "Covers the role of the Church, spiritual gifts, and biblical models of service. Encourages unity, humility, and accountability in ministry.",
      weeks: [
        "Week 1: The Church in Scripture (Acts 2, Eph 4)",
        "Week 2: Spiritual Gifts & Ministry Roles (gift assessment test)",
        "Week 3: Servant Leadership & Unity (John 13, 1 Cor 12)",
        "Week 4: Practical Service Project",
      ],
      assessments: ["Spiritual Gift Survey", "Leadership Case Study", 'Final "Service Plan" Project'],
      ects: 6.5,
    },
  ];

  const programStructureItems: ProgramStructureItem[] = [
    { icon: Calendar, title: "Duration", desc: "6 months total (6 courses, 4 weeks each)" },
    { icon: Clock, title: "Study Time", desc: "Approx. 10-12 hours per week" },
    { icon: Award, title: "Credits", desc: "39 ECTS total (6.5 ECTS per course)" },
    { icon: BookOpen, title: "Delivery", desc: "100% online with video lectures, readings, and assignments" },
  ];

  const learningApproachPoints: string[] = [
    "Courses must be taken in sequence.",
    "Weekly content unlocks progressively.",
    "Must complete current week's materials before accessing next week.",
    "Biannual intakes (January and July start dates).",
    "Cohort-based learning with peer interaction forums.",
    "Mid-cohort entry: Complete the current cohort's remaining lessons. Finish any missed lessons during the next cohort intake (free of charge) to receive your certificate."
  ];

  const weeklyComponents: string[] = [
    "Video Lectures", "Reading Materials", "Quizzes & Assignments", "Discussion Forums"
  ];

  const certificationDetails: string[] = [
    "Digital certificate suitable for printing (with unique ID)",
    "Official transcript detailing courses and grades",
    "Recognition of completion from the Apostolic Church International",
    "Solid foundation for ministry roles or further theological studies",
  ];

  return (
    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>
      <section className="w-full py-16 md:py-28 lg:py-36 bg-gradient-to-br from-[#2A0F0F] to-[#4A1F1F] dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/path-to-subtle-cross-pattern.svg')] bg-repeat opacity-10 dark:opacity-5"></div>
        <div className="container mx-auto relative px-4 md:px-6 z-10">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-3">
              <h1 className={`text-4xl ${headerTextLight} ${headerTextDark} font-bold font-serif tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl/none`}>
                Program Overview
              </h1>
              <p className={`mx-auto max-w-[750px] ${ctaSubText} text-lg md:text-xl lg:text-xl xl:text-2xl`}>
                A comprehensive guide to our Certificate in Apostolic & Evangelical Theology.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`w-full py-16 md:py-24 lg:py-32 ${sectionBgLight} ${sectionBgDark}`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            <div className="space-y-6 pl-4 text-center lg:text-left">
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Program Structure</h2>
              <p className={`${secondaryTextLight} ${secondaryTextDark} text-base md:text-lg xl:text-xl`}>
                Our certificate program is structured to provide a comprehensive understanding of Apostolic and
                Evangelical theology through six sequential courses.
              </p>
              <div className="grid gap-4">
                {programStructureItems.map((item, index) => (
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
            <div className="space-y-6 pr-4 text-center lg:text-left">
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Learning Approach</h2>
              <p className={`${secondaryTextLight} ${secondaryTextDark} text-base md:text-lg xl:text-xl`}>
                Our program follows a structured, sequential learning approach to ensure you build a solid foundation.
              </p>
              <ul className="space-y-3">
                {learningApproachPoints.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                       <CheckCircle2 className="h-5 w-5 text-[#C5A467] mt-0.5 flex-shrink-0" />
                       <span className={`${secondaryTextLight} ${secondaryTextDark}`}>{item}</span>
                    </li>
                ))}
              </ul>
              <div className="pt-4">
                <h3 className={`font-semibold mb-3 ${primaryTextLight} ${primaryTextDark}`}>Weekly Learning Components</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                   {weeklyComponents.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 justify-center sm:justify-start">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#C5A467]"></div>
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
        <div className="container mx-auto px-4 md:px-6">
           <div className="flex flex-col items-center space-y-4 text-center mb-12 md:mb-16 lg:mb-20">
            <div className="space-y-2">
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Course Curriculum</h2>
              <p className={`mx-auto max-w-[700px] text-base md:text-lg xl:text-xl ${secondaryTextLight} ${secondaryTextDark}`}>
                Detailed breakdown of the six courses included in the certificate program.
              </p>
            </div>
          </div>

          <div className="space-y-12 md:space-y-16 lg:space-y-20">
            {courses.map((course) => (
              <div
                key={course.id}
                className={`${cardBgLight} ${cardBgDark} ${cardBorder} rounded-lg overflow-hidden shadow-lg`}
              >
                <div className={`p-6 bg-[#2A0F0F] dark:bg-gray-800`}> {/* Removed redundant text color classes */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <h3 className={`text-xl sm:text-2xl lg:text-3xl font-semibold font-serif flex-1 ${headerTextLight}`}>{course.title}</h3> {/* Removed primaryTextDark */}
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
                        {course.weeks.map((week, i) => (
                          <li key={i} className={`flex items-start gap-2 ${secondaryTextLight} ${secondaryTextDark}`}>
                            <CheckCircle2 className="h-4 w-4 text-[#C5A467] mt-1 flex-shrink-0" />
                            <span>{week}</span>
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
                        {course.assessments.map((assessment, i) => (
                          <li key={i} className={`flex items-start gap-2 ${secondaryTextLight} ${secondaryTextDark}`}>
                            <CheckCircle2 className="h-4 w-4 text-[#C5A467] mt-1 flex-shrink-0" />
                            <span>{assessment}</span>
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

      <section className={`w-full py-16 md:py-24 lg:py-32 ${sectionBgLight} ${sectionBgDark}`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12 md:mb-16 lg:mb-20">
            <div className="space-y-2">
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Certification</h2>
              <p className={`mx-auto max-w-[700px] text-base md:text-lg xl:text-xl ${secondaryTextLight} ${secondaryTextDark}`}>
                Upon successful completion of all program requirements.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start justify-center">
            <div className="flex-1 max-w-md w-full flex flex-col items-center text-center">
              <div className={`aspect-[4/3] relative w-full ${altSectionBgLight} ${altSectionBgDark} rounded-lg shadow-lg flex items-center justify-center p-4 border-4 border-double border-[#C5A467] dark:border-[#B08F55]`}>
                 <div className="border border-dashed border-[#C5A467]/50 dark:border-[#B08F55]/50 p-6 w-full h-full flex flex-col items-center justify-center text-center">
                  <GraduationCap className="h-12 w-12 text-[#C5A467] mb-4" />
                  <h3 className={`text-lg font-semibold font-serif ${primaryTextLight} ${primaryTextDark}`}>Certificate in</h3>
                   <h3 className={`text-xl font-bold font-serif mb-2 ${primaryTextLight} ${primaryTextDark}`}>Apostolic & Evangelical Theology</h3>
                  <p className={`text-xs mt-3 ${secondaryTextLight} ${secondaryTextDark}`}>Awarded by the International Apostolic Church</p>
                  <p className={`text-sm font-semibold mt-1 ${primaryTextLight} ${primaryTextDark}`}>39 ECTS Credits</p>
                </div>
              </div>
            </div>
            <div className="flex-1 max-w-md space-y-4 text-center md:text-left">
               <h3 className={`text-xl font-semibold ${primaryTextLight} ${primaryTextDark}`}>What You'll Receive</h3>
              <ul className="space-y-3">
                 {certificationDetails.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#C5A467] mt-0.5 flex-shrink-0" />
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

      {!isAuthenticated && (
        <section className={`w-full py-16 md:py-24 lg:py-28 ${ctaBgLight} ${ctaBgDark} relative ${ctaText}`}>
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-[#C5A467]/30 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-[#C5A467]/30 to-transparent"></div>

          <div className="container mx-auto relative px-4 md:px-6 z-10">
            <div className="flex flex-col items-center space-y-6 text-center">
              <GraduationCap className="h-10 w-10 text-[#C5A467] mb-2" />
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-serif ${ctaText}`}>
                Ready to Begin Your Theological Journey?
              </h2>
              <p className={`mx-auto max-w-[700px] text-lg md:text-xl lg:text-xl xl:text-2xl ${ctaSubText}`}>
                Join our next cohort and deepen your understanding of Apostolic and Evangelical theology.
              </p>
              
              {/* Added Enrollment Fee Information Block */}
              <div className="mt-4 p-4 bg-[#C5A467]/10 dark:bg-[#C5A467]/5 border border-[#C5A467]/30 rounded-lg shadow-inner max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className={`h-6 w-6 ${goldAccent} flex-shrink-0`} />
                  <p className={`text-base md:text-lg font-semibold ${goldAccent}`}>
                    Investment: <span className={`${ctaText} opacity-90`}>$100 Enrollment Fee</span>
                  </p>
                </div>
                <p className="text-xs text-[#E0D6C3]/80 mt-1">
                  A one-time fee to secure your place and begin this transformative program.
                </p>
              </div>

              <div className="space-x-4 pt-4"> {/* Consider adjusting pt-4 if spacing looks off with new block */}
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