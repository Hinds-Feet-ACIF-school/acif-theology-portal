import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { BookOpen, Calendar, Clock, Award, CheckCircle2, FileText, GraduationCap, } from "lucide-react";
import { useAuth } from '../context/AuthContext.js';
const accentColor = "#C5A467";
const accentHoverColor = "#B08F55";
const primaryTextLight = "text-[#2A0F0F]";
const secondaryTextLight = "text-[#4A1F1F]";
const primaryTextDark = "dark:text-[#FFF8F0]";
const secondaryTextDark = "dark:text-[#E0D6C3]/90";
const mutedTextLight = "text-gray-500";
const mutedTextDark = "dark:text-gray-400";
const contentBgLight = "bg-white";
const contentBgDark = "dark:bg-gray-900";
const cardBgLight = "bg-white";
const cardBgDark = "dark:bg-gray-900";
const cardBorder = `border border-[#C5A467]/20 dark:border-[#C5A467]/30`;
const sectionBgLight = "bg-[#FFF8F0]";
const sectionBgDark = "dark:bg-gray-950";
const altSectionBgLight = "bg-[#F4EDE4]";
const altSectionBgDark = "dark:bg-gray-900";
const headerBgLight = "bg-[#2A0F0F]";
const headerTextLight = "text-[#FFF8F0]";
const headerBgDark = "dark:bg-gray-800";
const headerTextDark = "dark:text-[#FFF8F0]";
const ctaBgLight = "bg-[#2A0F0F]";
const ctaBgDark = "dark:bg-black";
const ctaText = "text-[#FFF8F0]";
const ctaSubText = "text-[#E0D6C3]";
const ProgramOverviewPage = () => {
    const { isAuthenticated } = useAuth();
    const courses = [
        {
            id: "foundations",
            title: "Foundations of the Christian Faith",
            description: "Introduces the central tenets of Christianity—God's nature, Jesus Christ's identity, the Holy Spirit's work, and salvation by grace through faith. Emphasizes both biblical understanding and personal application.",
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
            description: "Explores the Bible's formation, authority, and interpretation. Equips students with methods to study and apply Scripture faithfully in personal life and ministry.",
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
            description: "Presents Oneness theology, baptism in Jesus' name, Holy Spirit baptism, and the call to holiness. Guides students in understanding and defending these Apostolic doctrines biblically and practically.",
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
            description: "Builds practical habits of prayer, fasting, Bible reading, and fellowship. Encourages holistic Christian ethics and personal sanctification.",
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
            description: "Equips students with biblical frameworks for evangelism and outreach, including personal testimony, apologetics, and cross-cultural communication of the Gospel.",
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
            description: "Covers the role of the Church, spiritual gifts, and biblical models of service. Encourages unity, humility, and accountability in ministry.",
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
    const programStructureItems = [
        { icon: Calendar, title: "Duration", desc: "6 months total (6 courses, 4 weeks each)" },
        { icon: Clock, title: "Study Time", desc: "Approx. 10-12 hours per week" },
        { icon: Award, title: "Credits", desc: "39 ECTS total (6.5 ECTS per course)" },
        { icon: BookOpen, title: "Delivery", desc: "100% online with video lectures, readings, and assignments" },
    ];
    const learningApproachPoints = [
        "Courses must be taken in sequence.",
        "Weekly content unlocks progressively.",
        "Must complete current week's materials before accessing next week.",
        "Biannual intakes (January and July start dates).",
        "Cohort-based learning with peer interaction forums.",
        "Mid-cohort entry: Complete the current cohort's remaining lessons. Finish any missed lessons during the next cohort intake (free of charge) to receive your certificate."
    ];
    const weeklyComponents = [
        "Video Lectures", "Reading Materials", "Quizzes & Assignments", "Discussion Forums"
    ];
    const certificationDetails = [
        "Digital certificate suitable for printing (with unique ID)",
        "Official transcript detailing courses and grades",
        "Recognition of completion from the Apostolic Church International",
        "Solid foundation for ministry roles or further theological studies",
    ];
    return (_jsxs("div", { className: `flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`, children: [_jsxs("section", { className: "w-full py-16 md:py-28 lg:py-36 bg-gradient-to-br from-[#2A0F0F] to-[#4A1F1F] dark:from-gray-900 dark:to-gray-800 relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-[url('/path-to-subtle-cross-pattern.svg')] bg-repeat opacity-10 dark:opacity-5" }), _jsx("div", { className: "container relative px-4 md:px-6 z-10", children: _jsx("div", { className: "flex flex-col items-center space-y-4 text-center", children: _jsxs("div", { className: "space-y-3", children: [_jsx("h1", { className: `text-4xl ${headerTextLight} ${headerTextDark} font-bold font-serif tracking-tight sm:text-5xl md:text-6xl lg:text-7xl/none`, children: "Program Overview" }), _jsx("p", { className: `mx-auto max-w-[750px] ${ctaSubText} md:text-xl lg:text-lg`, children: "A comprehensive guide to our Certificate in Apostolic & Evangelical Theology." })] }) }) })] }), _jsx("section", { className: `w-full py-16 md:py-24 lg:py-32 ${sectionBgLight} ${sectionBgDark}`, children: _jsx("div", { className: "container px-4 md:px-6", children: _jsxs("div", { className: "grid gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20", children: [_jsxs("div", { className: "space-y-6 pl-4", children: [_jsx("h2", { className: `text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`, children: "Program Structure" }), _jsx("p", { className: `${secondaryTextLight} ${secondaryTextDark} text-lg`, children: "Our certificate program is structured to provide a comprehensive understanding of Apostolic and Evangelical theology through six sequential courses." }), _jsx("div", { className: "grid gap-4", children: programStructureItems.map((item, index) => (_jsxs("div", { className: `flex items-start gap-4 p-4 rounded-lg ${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`, children: [_jsx(item.icon, { className: `h-6 w-6 text-[${accentColor}] mt-1 flex-shrink-0` }), _jsxs("div", { children: [_jsx("h3", { className: `font-semibold ${primaryTextLight} ${primaryTextDark}`, children: item.title }), _jsx("p", { className: `text-sm ${mutedTextLight} ${mutedTextDark}`, children: item.desc })] })] }, index))) })] }), _jsxs("div", { className: "space-y-6 pr-4", children: [_jsx("h2", { className: `text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`, children: "Learning Approach" }), _jsx("p", { className: `${secondaryTextLight} ${secondaryTextDark} text-lg`, children: "Our program follows a structured, sequential learning approach to ensure you build a solid foundation." }), _jsx("ul", { className: "space-y-3", children: learningApproachPoints.map((item, index) => (_jsxs("li", { className: "flex items-start gap-3", children: [_jsx(CheckCircle2, { className: `h-5 w-5 text-[${accentColor}] mt-0.5 flex-shrink-0` }), _jsx("span", { className: `${secondaryTextLight} ${secondaryTextDark}`, children: item })] }, index))) }), _jsxs("div", { className: "pt-4", children: [_jsx("h3", { className: `font-semibold mb-3 ${primaryTextLight} ${primaryTextDark}`, children: "Weekly Learning Components" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm", children: weeklyComponents.map((item, index) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `h-2.5 w-2.5 rounded-full bg-[${accentColor}]` }), _jsx("span", { className: `${secondaryTextLight} ${secondaryTextDark}`, children: item })] }, index))) })] })] })] }) }) }), _jsx("section", { className: `w-full py-16 md:py-24 lg:py-32 ${altSectionBgLight} ${altSectionBgDark}`, children: _jsxs("div", { className: "container px-4 md:px-6", children: [_jsx("div", { className: "flex flex-col items-center space-y-4 text-center mb-12", children: _jsxs("div", { className: "space-y-2", children: [_jsx("h2", { className: `text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`, children: "Course Curriculum" }), _jsx("p", { className: `mx-auto max-w-[700px] md:text-xl ${secondaryTextLight} ${secondaryTextDark}`, children: "Detailed breakdown of the six courses included in the certificate program." })] }) }), _jsx("div", { className: "space-y-12", children: courses.map((course) => (_jsxs("div", { className: `${cardBgLight} ${cardBgDark} ${cardBorder} rounded-lg overflow-hidden shadow-lg`, children: [_jsx("div", { className: `${headerBgLight} ${headerBgDark} ${headerTextLight} ${headerTextDark} p-6`, children: _jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2", children: [_jsx("h3", { className: "text-2xl font-semibold font-serif flex-1", children: course.title }), _jsxs("div", { className: `flex items-center gap-2 text-sm font-medium bg-[${accentColor}]/10 dark:bg-[${accentColor}]/20 text-[${accentColor}] px-3 py-1 rounded-full`, children: [_jsx(Clock, { className: "h-4 w-4" }), _jsxs("span", { children: [course.ects, " ECTS"] })] })] }) }), _jsxs("div", { className: "p-6", children: [_jsx("p", { className: `${secondaryTextLight} ${secondaryTextDark} mb-6 text-base`, children: course.description }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6", children: [_jsxs("div", { children: [_jsxs("h4", { className: `text-lg font-semibold mb-3 flex items-center gap-2 ${primaryTextLight} ${primaryTextDark}`, children: [_jsx(Calendar, { className: `h-5 w-5 text-[${accentColor}]` }), "Weekly Breakdown"] }), _jsx("ul", { className: "space-y-2 text-sm", children: course.weeks.map((week, i) => (_jsxs("li", { className: `flex items-start gap-2 ${secondaryTextLight} ${secondaryTextDark}`, children: [_jsx(CheckCircle2, { className: `h-4 w-4 text-[${accentColor}] mt-1 flex-shrink-0` }), _jsx("span", { children: week })] }, i))) })] }), _jsxs("div", { children: [_jsxs("h4", { className: `text-lg font-semibold mb-3 flex items-center gap-2 ${primaryTextLight} ${primaryTextDark}`, children: [_jsx(FileText, { className: `h-5 w-5 text-[${accentColor}]` }), "Assessments"] }), _jsx("ul", { className: "space-y-2 text-sm", children: course.assessments.map((assessment, i) => (_jsxs("li", { className: `flex items-start gap-2 ${secondaryTextLight} ${secondaryTextDark}`, children: [_jsx(CheckCircle2, { className: `h-4 w-4 text-[${accentColor}] mt-1 flex-shrink-0` }), _jsx("span", { children: assessment })] }, i))) })] })] })] })] }, course.id))) })] }) }), _jsx("section", { className: `w-full py-16 md:py-24 lg:py-32 ${sectionBgLight} ${sectionBgDark}`, children: _jsxs("div", { className: "container px-4 md:px-6", children: [_jsx("div", { className: "flex flex-col items-center space-y-4 text-center mb-12", children: _jsxs("div", { className: "space-y-2", children: [_jsx("h2", { className: `text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`, children: "Certification" }), _jsx("p", { className: `mx-auto max-w-[700px] md:text-xl ${secondaryTextLight} ${secondaryTextDark}`, children: "Upon successful completion of all program requirements." })] }) }), _jsxs("div", { className: "flex flex-col md:flex-row gap-8 lg:gap-12 items-center justify-center", children: [_jsx("div", { className: "flex-1 max-w-md w-full", children: _jsx("div", { className: `aspect-[4/3] relative ${altSectionBgLight} ${altSectionBgDark} rounded-lg shadow-lg flex items-center justify-center p-4 border-4 border-double border-[${accentColor}] dark:border-[${accentHoverColor}]`, children: _jsxs("div", { className: `border border-dashed border-[${accentColor}]/50 dark:border-[${accentHoverColor}]/50 p-6 w-full h-full flex flex-col items-center justify-center text-center`, children: [_jsx(GraduationCap, { className: `h-12 w-12 text-[${accentColor}] mb-4` }), _jsx("h3", { className: `text-lg font-semibold font-serif ${primaryTextLight} ${primaryTextDark}`, children: "Certificate in" }), _jsx("h3", { className: `text-xl font-bold font-serif mb-2 ${primaryTextLight} ${primaryTextDark}`, children: "Apostolic & Evangelical Theology" }), _jsx("p", { className: `text-xs mt-3 ${secondaryTextLight} ${secondaryTextDark}`, children: "Awarded by the International Apostolic Church" }), _jsx("p", { className: `text-sm font-semibold mt-1 ${primaryTextLight} ${primaryTextDark}`, children: "39 ECTS Credits" })] }) }) }), _jsxs("div", { className: "flex-1 max-w-md space-y-4", children: [_jsx("h3", { className: `text-xl font-semibold ${primaryTextLight} ${primaryTextDark}`, children: "What You'll Receive" }), _jsx("ul", { className: "space-y-3", children: certificationDetails.map((item, index) => (_jsxs("li", { className: "flex items-start gap-3", children: [_jsx(CheckCircle2, { className: `h-5 w-5 text-[${accentColor}] mt-0.5 flex-shrink-0` }), _jsx("span", { className: `${secondaryTextLight} ${secondaryTextDark}`, children: item })] }, index))) }), _jsx("div", { className: "pt-4", children: _jsx("p", { className: `italic ${mutedTextLight} ${mutedTextDark}`, children: "\"Study to show yourself approved unto God...\" \u2013 2 Timothy 2:15" }) })] })] })] }) }), !isAuthenticated && (_jsxs("section", { className: `w-full py-16 md:py-24 lg:py-28 ${ctaBgLight} ${ctaBgDark} relative ${ctaText}`, children: [_jsx("div", { className: "absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-[#C5A467]/30 to-transparent" }), _jsx("div", { className: "absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-[#C5A467]/30 to-transparent" }), _jsx("div", { className: "container relative px-4 md:px-6 z-10", children: _jsxs("div", { className: "flex flex-col items-center space-y-6 text-center", children: [_jsx(GraduationCap, { className: `h-10 w-10 text-[${accentColor}] mb-2` }), _jsx("h2", { className: "text-3xl font-bold tracking-tight sm:text-4xl font-serif", children: "Ready to Begin Your Theological Journey?" }), _jsx("p", { className: `mx-auto max-w-[700px] ${ctaSubText} md:text-xl lg:text-lg`, children: "Join our next cohort and deepen your understanding of Apostolic and Evangelical theology." }), _jsx("div", { className: "space-x-4 pt-4", children: _jsx(Link, { to: "/register", children: _jsx(Button, { size: "lg", className: `bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors`, children: "Apply Now" }) }) })] }) })] }))] }));
};
export default ProgramOverviewPage;
