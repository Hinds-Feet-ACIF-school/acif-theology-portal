import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { ChevronRight, BookOpen, Calendar, Award, Users, Cross } from "lucide-react";
import logo from "../assets/logo.jpg";

interface Course {
  title: string;
  description: string;
  weeks: number;
  ects: number;
}

export default function HomePage() {
  const courses: Course[] = [
    {
      title: "Foundations of the Christian Faith",
      description: "Introduces the central tenets of Christianity—God's nature, Jesus Christ's identity, the Holy Spirit's work, and salvation by grace through faith.",
      weeks: 4,
      ects: 6.5,
    },
    {
      title: "The Bible: God's Word",
      description: "Explores the Bible's formation, authority, and interpretation. Equips students with methods to study and apply Scripture faithfully.",
      weeks: 4,
      ects: 6.5,
    },
    {
      title: "Apostolic Doctrine",
      description: "Presents Oneness theology, baptism in Jesus' name, Holy Spirit baptism, and the call to holiness.",
      weeks: 4,
      ects: 6.5,
    },
    {
      title: "Spiritual Growth & Christian Living",
      description: "Builds practical habits of prayer, fasting, Bible reading, and fellowship. Encourages holistic Christian ethics.",
      weeks: 4,
      ects: 6.5,
    },
    {
      title: "Introduction to Evangelism",
      description: "Equips students with biblical frameworks for evangelism and outreach, including personal testimony and apologetics.",
      weeks: 4,
      ects: 6.5,
    },
    {
      title: "Church Life & Service",
      description: "Covers the role of the Church, spiritual gifts, and biblical models of service. Encourages unity and humility.",
      weeks: 4,
      ects: 6.5,
    },
  ];

  const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
  const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
  const goldAccent = 'text-[#C5A467]';
  const goldBg = 'bg-[#C5A467]';
  const goldBgHover = 'hover:bg-[#B08F55]';
  const goldBorder = 'border-[#C5A467]';
  const lightBg = 'bg-[#FFF8F0]';
  const darkBg = 'dark:bg-gray-950';
  const lightCardBg = 'bg-[#FFF8F0]';
  const darkCardBg = 'dark:bg-gray-900';
  const lightSectionBg = 'bg-[#F4EDE4]';
  const darkSectionBg = 'dark:bg-gray-800';

  return (
    <div className={`flex flex-col min-h-screen ${lightBg} ${darkBg}`}>


      <section className="w-full py-16 md:py-28 lg:py-36 bg-gradient-to-br from-[#2A0F0F] to-[#4A1F1F] dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/path-to-subtle-cross-pattern.svg')] bg-repeat opacity-10 dark:opacity-5"></div>
        <div className="container relative px-4 md:px-6 z-10">
          <div className="flex flex-col items-center space-y-6 text-center">
            <img src={logo} alt="Apostolic & Evangelical Theology Logo" className="h-16 w-16 md:h-20 md:w-20 mx-auto rounded-full object-cover mb-4 shadow-md border-2 border-[#C5A467]/50" />
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#FFF8F0] drop-shadow-md animate-[fadeInDown_1s_ease-out] font-serif">
                Apostolic & Evangelical Theology
              </h1>
              <p className="mx-auto max-w-[750px] text-[#E0D6C3] md:text-xl lg:text-lg animate-[fadeInUp_1.2s_ease-out]">
                A six-month online certificate program exploring foundational Christian doctrines and practical ministry from an Apostolic perspective.
              </p>
            </div>
            <div className="space-x-4 pt-4 animate-[fadeInUp_1.5s_ease-out]">
              <Link to="/program-overview">
                <Button
                  size="lg"
                  className={`${goldBg} ${goldBgHover} text-[#2A0F0F] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg font-semibold group`}
                >
                  Explore Program
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className={`text-[#FFF8F0] ${goldBorder} hover:bg-[#C5A467]/20 dark:text-[#C5A467] dark:border-[#C5A467] dark:hover:bg-[#C5A467]/10 dark:hover:text-[#E0D6C3] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md font-medium`}
                >
                  Enroll Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`w-full py-16 md:py-24 lg:py-32 ${lightBg} ${darkBg}`}>
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            <div className="space-y-5 px-4 animate-[fadeInRight_1s_ease-out]">
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-1 w-12 ${goldBg}`}></div>
                <h2 className={`text-3xl font-bold tracking-tight font-serif ${deepBrown}`}>
                  Program Highlights
                </h2>
              </div>
              <p className={`${midBrown} text-lg`}>
                Our certificate program equips believers with a solid theological foundation and practical ministry skills for impactful service.
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  { icon: BookOpen, text: "Six comprehensive courses over 6 months" },
                  { icon: Calendar, text: "Biannual intakes in January & July" },
                  { icon: Award, text: "Certificate awarded upon completion (39 ECTS)" },
                  { icon: Users, text: "Mentoring, community forums, and support" },
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg shadow-sm">
                    <item.icon className={`h-6 w-6 ${goldAccent} flex-shrink-0`} />
                    <span className={`text-[#4A1F1F] dark:text-gray-300`}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5 animate-[fadeInLeft_1s_ease-out]">
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-1 w-12 ${goldBg}`}></div>
                <h2 className={`text-3xl font-bold tracking-tight font-serif ${deepBrown}`}>
                  Learning Outcomes
                </h2>
              </div>
              <p className={`${midBrown} text-lg`}>
                Upon successful completion, you will be able to:
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  "Explain foundational Christian doctrines with clarity and confidence",
                  "Interpret Scripture using sound hermeneutical principles",
                  "Articulate Apostolic distinctives (Oneness, baptism, Holy Spirit)",
                  "Cultivate sustainable personal spiritual disciplines",
                  "Share the Gospel effectively and engage in thoughtful evangelism",
                  "Serve faithfully within the church community based on biblical models",
                ].map((objective, index) => (
                   <li key={index} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg shadow-sm">
                    <div className={`mt-1 flex-shrink-0 rounded-full ${goldBg} text-[#2A0F0F] h-6 w-6 flex items-center justify-center text-sm font-semibold`}>
                      {index + 1}
                    </div>
                    <span className={`text-[#4A1F1F] dark:text-gray-300`}>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>




      <section className="w-full py-16 md:py-24 lg:py-28 bg-[#2A0F0F] dark:bg-black relative text-[#FFF8F0]">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-[#C5A467]/30 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-[#C5A467]/30 to-transparent"></div>

        <div className="container relative px-4 md:px-6 z-10">
          <div className="flex flex-col items-center space-y-6 text-center animate-[fadeInUp_1s_ease-out]">
          <img src={logo} alt="Apostolic & Evangelical Theology Logo" className="h-16 w-16 md:h-20 md:w-20 mx-auto rounded-full object-cover mb-4 shadow-md border-2 border-[#C5A467]/50" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-serif">
              Begin Your Theological Journey
            </h2>
            <p className="mx-auto max-w-[700px] text-[#E0D6C3] md:text-xl lg:text-lg">
              Join our community of seekers and scholars. Enroll today and deepen your understanding of God's Word.
            </p>
            <div className="space-x-4 pt-4">
              <Link to="/register">
                <Button
                  size="lg"
                  className={`${goldBg} ${goldBgHover} text-[#2A0F0F] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg font-semibold`}
                >
                  Start Application
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="outline"
                   className={`border-[#C5A467] text-[#C5A467] hover:bg-[#C5A467]/10 hover:text-[#FFF8F0] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md font-medium`}
                >
                  Request Info
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}