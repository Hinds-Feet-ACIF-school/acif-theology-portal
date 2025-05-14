import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js';
import { BookOpen, Users, Target, ShieldCheck, HeartHandshake, GraduationCap } from 'lucide-react';
import logo from "../assets/logo.jpg";

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
const goldBg = `bg-[${accentColor}]`;
const goldBgHover = `hover:bg-[${accentHoverColor}]`;
const goldAccentBgLight = `bg-[${accentColor}]/10 dark:bg-[${accentColor}]/20`;

export default function AboutUsPage() {
  return (
    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>

      <section className="w-full py-16 sm:py-20 md:py-28 lg:py-36 xl:py-40 bg-gradient-to-br from-[#2A0F0F] to-[#4A1F1F] dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            <img src={logo} alt="Apostolic & Evangelical Theology Logo" className="h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 lg:h-24 lg:w-24 mx-auto rounded-full object-cover mb-4 shadow-md border-2 border-[#C5A467]/50" />
            <div className="space-y-2">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-serif tracking-tight text-white`}>
                About Our Program
              </h1>
              <p className={`mx-auto max-w-[700px] text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl text-white`}>
                Equipping believers for faithful understanding and service through theological education rooted in Apostolic and Evangelical traditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`w-full py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 ${sectionBgLight} ${sectionBgDark}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-4 text-center lg:text-left">
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Our Mission</h2>
              <p className={`text-base md:text-lg ${secondaryTextLight} ${secondaryTextDark}`}>
                To provide accessible, comprehensive, and spiritually enriching theological education that grounds students in the core doctrines of the Christian faith, emphasizes Apostolic distinctives, and equips them for effective ministry and personal growth within the context of the global Apostolic movement and the broader Evangelical world.
              </p>
            </div>
            <div className="space-y-4 text-center lg:text-left">
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Our Vision</h2>
              <p className={`text-base md:text-lg ${secondaryTextLight} ${secondaryTextDark}`}>
                To be a leading online resource for theological training, fostering a global community of knowledgeable, passionate, and servant-hearted believers who faithfully interpret Scripture, articulate sound doctrine, live transformed lives, and effectively share the Gospel of Jesus Christ.
              </p>
            </div>
          </div>
        </div>
      </section>

       <section className={`w-full py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 ${altSectionBgLight} ${altSectionBgDark}`}>
         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight text-center mb-10 md:mb-12 lg:mb-16 ${primaryTextLight} ${primaryTextDark}`}>Our Core Values</h2>
           <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
             {[
               { icon: BookOpen, title: "Biblical Fidelity", desc: "Upholding the Bible as the inspired, infallible Word of God." },
               { icon: ShieldCheck, title: "Apostolic Foundation", desc: "Emphasizing the doctrines and practices taught by the Apostles." },
               { icon: Target, title: "Doctrinal Clarity", desc: "Striving for accurate understanding and articulation of core Christian beliefs." },
               { icon: GraduationCap, title: "Academic Rigor", desc: "Commitment to sound scholarship and critical thinking within a faith context." },
               { icon: Users, title: "Community & Fellowship", desc: "Fostering interaction and support among students and instructors." },
               { icon: HeartHandshake, title: "Practical Application", desc: "Connecting theological knowledge to everyday life, ministry, and service." },
             ].map((item) => (
               <div key={item.title} className="flex flex-col items-center text-center p-4">
                 <div className={`mb-4 rounded-full ${goldAccentBgLight} p-3 sm:p-4`}>
                   <item.icon className={`h-8 w-8 sm:h-10 sm:w-10 text-[${accentColor}]`} />
                 </div>
                 <h3 className={`text-lg sm:text-xl font-semibold mb-1 ${primaryTextLight} ${primaryTextDark}`}>{item.title}</h3>
                 <p className={`text-sm sm:text-base ${secondaryTextLight} ${secondaryTextDark}`}>{item.desc}</p>
               </div>
             ))}
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
}