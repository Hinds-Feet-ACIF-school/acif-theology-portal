import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { ChevronRight, BookOpen, Calendar, Award, Users } from "lucide-react";
import logo from "../assets/logo.jpg";
export default function HomePage() {
    const courses = [
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
    return (_jsxs("div", { className: `flex flex-col min-h-screen ${lightBg} ${darkBg}`, children: [_jsxs("section", { className: "w-full py-16 md:py-28 lg:py-36 bg-gradient-to-br from-[#2A0F0F] to-[#4A1F1F] dark:from-gray-900 dark:to-gray-800 relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-[url('/path-to-subtle-cross-pattern.svg')] bg-repeat opacity-10 dark:opacity-5" }), _jsx("div", { className: "container relative px-4 md:px-6 z-10", children: _jsxs("div", { className: "flex flex-col items-center space-y-6 text-center", children: [_jsx("img", { src: logo, alt: "Apostolic & Evangelical Theology Logo", className: "h-16 w-16 md:h-20 md:w-20 mx-auto rounded-full object-cover mb-4 shadow-md border-2 border-[#C5A467]/50" }), _jsxs("div", { className: "space-y-3", children: [_jsx("h1", { className: "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#FFF8F0] drop-shadow-md animate-[fadeInDown_1s_ease-out] font-serif", children: "Apostolic & Evangelical Theology" }), _jsx("p", { className: "mx-auto max-w-[750px] text-[#E0D6C3] md:text-xl lg:text-lg animate-[fadeInUp_1.2s_ease-out]", children: "A six-month online certificate program exploring foundational Christian doctrines and practical ministry from an Apostolic perspective." })] }), _jsxs("div", { className: "space-x-4 pt-4 animate-[fadeInUp_1.5s_ease-out]", children: [_jsx(Link, { to: "/program-overview", children: _jsxs(Button, { size: "lg", className: `${goldBg} ${goldBgHover} text-[#2A0F0F] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg font-semibold group`, children: ["Explore Program", _jsx(ChevronRight, { className: "ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" })] }) }), _jsx(Link, { to: "/register", children: _jsx(Button, { size: "lg", variant: "outline", className: `text-[#FFF8F0] ${goldBorder} hover:bg-[#C5A467]/20 dark:text-[#C5A467] dark:border-[#C5A467] dark:hover:bg-[#C5A467]/10 dark:hover:text-[#E0D6C3] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md font-medium`, children: "Enroll Now" }) })] })] }) })] }), _jsx("section", { className: `w-full py-16 md:py-24 lg:py-32 ${lightBg} ${darkBg}`, children: _jsx("div", { className: "container px-4 md:px-6", children: _jsxs("div", { className: "grid gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20", children: [_jsxs("div", { className: "space-y-5 px-4 animate-[fadeInRight_1s_ease-out]", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: `h-1 w-12 ${goldBg}` }), _jsx("h2", { className: `text-3xl font-bold tracking-tight font-serif ${deepBrown}`, children: "Program Highlights" })] }), _jsx("p", { className: `${midBrown} text-lg`, children: "Our certificate program equips believers with a solid theological foundation and practical ministry skills for impactful service." }), _jsx("ul", { className: "space-y-3 pt-2", children: [
                                            { icon: BookOpen, text: "Six comprehensive courses over 6 months" },
                                            { icon: Calendar, text: "Biannual intakes in January & July" },
                                            { icon: Award, text: "Certificate awarded upon completion (39 ECTS)" },
                                            { icon: Users, text: "Mentoring, community forums, and support" },
                                        ].map((item, index) => (_jsxs("li", { className: "flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg shadow-sm", children: [_jsx(item.icon, { className: `h-6 w-6 ${goldAccent} flex-shrink-0` }), _jsx("span", { className: `text-[#4A1F1F] dark:text-gray-300`, children: item.text })] }, index))) })] }), _jsxs("div", { className: "space-y-5 animate-[fadeInLeft_1s_ease-out]", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: `h-1 w-12 ${goldBg}` }), _jsx("h2", { className: `text-3xl font-bold tracking-tight font-serif ${deepBrown}`, children: "Learning Outcomes" })] }), _jsx("p", { className: `${midBrown} text-lg`, children: "Upon successful completion, you will be able to:" }), _jsx("ul", { className: "space-y-3 pt-2", children: [
                                            "Explain foundational Christian doctrines with clarity and confidence",
                                            "Interpret Scripture using sound hermeneutical principles",
                                            "Articulate Apostolic distinctives (Oneness, baptism, Holy Spirit)",
                                            "Cultivate sustainable personal spiritual disciplines",
                                            "Share the Gospel effectively and engage in thoughtful evangelism",
                                            "Serve faithfully within the church community based on biblical models",
                                        ].map((objective, index) => (_jsxs("li", { className: "flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg shadow-sm", children: [_jsx("div", { className: `mt-1 flex-shrink-0 rounded-full ${goldBg} text-[#2A0F0F] h-6 w-6 flex items-center justify-center text-sm font-semibold`, children: index + 1 }), _jsx("span", { className: `text-[#4A1F1F] dark:text-gray-300`, children: objective })] }, index))) })] })] }) }) }), _jsxs("section", { className: "w-full py-16 md:py-24 lg:py-28 bg-[#2A0F0F] dark:bg-black relative text-[#FFF8F0]", children: [_jsx("div", { className: "absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-[#C5A467]/30 to-transparent" }), _jsx("div", { className: "absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-[#C5A467]/30 to-transparent" }), _jsx("div", { className: "container relative px-4 md:px-6 z-10", children: _jsxs("div", { className: "flex flex-col items-center space-y-6 text-center animate-[fadeInUp_1s_ease-out]", children: [_jsx("img", { src: logo, alt: "Apostolic & Evangelical Theology Logo", className: "h-16 w-16 md:h-20 md:w-20 mx-auto rounded-full object-cover mb-4 shadow-md border-2 border-[#C5A467]/50" }), _jsx("h2", { className: "text-3xl font-bold tracking-tight sm:text-4xl font-serif", children: "Begin Your Theological Journey" }), _jsx("p", { className: "mx-auto max-w-[700px] text-[#E0D6C3] md:text-xl lg:text-lg", children: "Join our community of seekers and scholars. Enroll today and deepen your understanding of God's Word." }), _jsxs("div", { className: "space-x-4 pt-4", children: [_jsx(Link, { to: "/register", children: _jsx(Button, { size: "lg", className: `${goldBg} ${goldBgHover} text-[#2A0F0F] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg font-semibold`, children: "Start Application" }) }), _jsx(Link, { to: "/contact", children: _jsx(Button, { size: "lg", variant: "outline", className: `border-[#C5A467] text-[#C5A467] hover:bg-[#C5A467]/10 hover:text-[#FFF8F0] transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md font-medium`, children: "Request Info" }) })] })] }) })] })] }));
}
