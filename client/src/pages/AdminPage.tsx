import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import {
  BookOpen, Users, FileText, Settings, PlusCircle, Search, Calendar, CheckCircle2, Clock, Edit, Eye, Trash2, ArrowUpRight, UserCircle, HelpCircle
} from "lucide-react";

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
const tableHeaderBgLight = "bg-gray-50";
const tableHeaderBgDark = "dark:bg-gray-800/50";
const tableRowBgLight = "bg-white";
const tableRowBgDark = "dark:bg-gray-900";
const tableBorderLight = "border-gray-200";
const tableBorderDark = "dark:border-gray-700";
const tabsListBgLight = "bg-[#F4EDE4]";
const tabsListBgDark = "dark:bg-gray-800";
const tabsTriggerTextLight = "text-[#4A1F1F]";
const tabsTriggerTextDark = "dark:text-[#E0D6C3]/80";
const tabsTriggerActiveTextLight = "text-[#2A0F0F]";
const tabsTriggerActiveTextDark = "dark:text-white";
const tabsTriggerActiveBgLight = "bg-white";
const tabsTriggerActiveBgDark = "dark:bg-gray-950";
const tabsTriggerHoverBgLight = "hover:bg-white/60";
const tabsTriggerHoverBgDark = "dark:hover:bg-white/10";
const tabsTriggerHoverTextLight = "hover:text-[#2A0F0F]";
const tabsTriggerHoverTextDark = "dark:hover:text-white";
const inputBgLight = "bg-[#FFF8F0]";
const inputBgDark = "dark:bg-gray-800";
const inputBorderLight = "border-[#E0D6C3]";
const inputBorderDark = "dark:border-gray-700";
const focusRingAccent = `focus:ring-[${accentColor}]`;
const focusBorderAccent = `focus:border-[${accentColor}] dark:focus:border-[${accentColor}]`;
const positiveColor = "text-green-600 dark:text-green-400";
const positiveBg = "bg-green-100 dark:bg-green-900/30";
const warningColor = "text-yellow-700 dark:text-yellow-400";
const warningBg = "bg-yellow-100 dark:bg-yellow-900/30";
const inactiveColor = "text-gray-500 dark:text-gray-400";
const inactiveBg = "bg-gray-100 dark:bg-gray-700/30";
const upcomingColor = inactiveColor;
const upcomingBg = inactiveBg;

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("all");
  const [courseSearch, setCourseSearch] = useState("");
  const [courseStatusFilter, setCourseStatusFilter] = useState("all");
  const [quizSearch, setQuizSearch] = useState("");
  const [quizCourseFilter, setQuizCourseFilter] = useState("all");

  const stats = [
    { id: 1, title: "Total Students", value: 124, icon: Users, change: "+12% from last month" },
    { id: 2, title: "Active Courses", value: 6, icon: BookOpen, change: "No change" },
    { id: 3, title: "Completion Rate", value: "78%", icon: CheckCircle2, change: "+5% from last cohort" },
    { id: 4, title: "Avg. Grade", value: "82%", icon: FileText, change: "+2% from last cohort" },
  ];

  const students = [
    { id: 1, name: "John Doe", email: "john.doe@example.com", course: "Foundations", progress: 65, status: "active" },
    { id: 2, name: "Jane Smith", email: "jane.smith@example.com", course: "Foundations", progress: 80, status: "active" },
    { id: 3, name: "Michael Johnson", email: "michael.j@example.com", course: "Foundations", progress: 45, status: "active" },
    { id: 4, name: "Sarah Williams", email: "sarah.w@example.com", course: "Foundations", progress: 90, status: "active" },
    { id: 5, name: "Robert Brown", email: "robert.b@example.com", course: "Foundations", progress: 30, status: "at risk" },
     { id: 6, name: "Emily Davis", email: "emily.d@example.com", course: "Bible", progress: 0, status: "inactive" },
  ];

  const courses = [
    { id: 1, title: "Foundations of the Christian Faith", students: 45, status: "active", startDate: "Jan 15, 2025", endDate: "Feb 12, 2025", courseId: "foundations" },
    { id: 2, title: "The Bible: God's Word", students: 42, status: "upcoming", startDate: "Feb 15, 2025", endDate: "Mar 14, 2025", courseId: "bible" },
    { id: 3, title: "Apostolic Doctrine", students: 40, status: "upcoming", startDate: "Mar 17, 2025", endDate: "Apr 14, 2025", courseId: "doctrine" },
    { id: 4, title: "Spiritual Growth & Christian Living", students: 0, status: "upcoming", startDate: "Apr 17, 2025", endDate: "May 14, 2025", courseId: "growth" },
    { id: 5, title: "Introduction to Evangelism", students: 0, status: "upcoming", startDate: "May 17, 2025", endDate: "Jun 14, 2025", courseId: "evangelism" },
    { id: 6, title: "Church Life & Service", students: 0, status: "upcoming", startDate: "Jun 17, 2025", endDate: "Jul 14, 2025", courseId: "church" },
     { id: 7, title: "Old Testament Survey", students: 35, status: "completed", startDate: "Dec 1, 2024", endDate: "Dec 28, 2024", courseId: "ot_survey" },
  ];

  const quizzes = [
    { id: 1, title: "Week 1 Checkpoint", course: "Foundations", submitted: 32, total: 45, dueDate: "Jan 22, 2025", courseId: "foundations" },
    { id: 2, title: "Quiz: The Person of Jesus Christ", course: "Foundations", submitted: 40, total: 45, dueDate: "Jan 29, 2025", courseId: "foundations" },
    { id: 3, title: "Quiz: Old Testament Overview", course: "Bible", submitted: 0, total: 42, dueDate: "Feb 22, 2025", courseId: "bible" },
  ];

  const filteredStudents = students.filter(s =>
      (s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase())) &&
      (studentStatusFilter === 'all' || s.status === studentStatusFilter)
  );
  const filteredCourses = courses.filter(c =>
      c.title.toLowerCase().includes(courseSearch.toLowerCase()) &&
      (courseStatusFilter === 'all' || c.status === courseStatusFilter)
  );
  const filteredQuizzes = quizzes.filter(q =>
      q.title.toLowerCase().includes(quizSearch.toLowerCase()) &&
      (quizCourseFilter === 'all' || q.courseId === quizCourseFilter)
  );

  const getStatusBadgeClasses = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return `${positiveBg} ${positiveColor}`;
      case 'at risk': return `${warningBg} ${warningColor}`;
      case 'upcoming': return `${upcomingBg} ${upcomingColor}`;
      case 'completed': return `${inactiveBg} ${inactiveColor}`;
      case 'inactive': return `${inactiveBg} ${inactiveColor}`;
      default: return `${inactiveBg} ${inactiveColor}`;
    }
  };

  const inputClasses = `h-9 rounded-md px-3 text-sm ${inputBgLight} ${inputBgDark} ${inputBorderLight} ${inputBorderDark} ${focusBorderAccent} ${focusRingAccent} ${primaryTextLight} ${primaryTextDark}`;
  const selectTriggerClasses = `h-9 rounded-md px-3 text-sm w-full md:w-[180px] ${inputBgLight} ${inputBgDark} ${inputBorderLight} ${inputBorderDark} ${focusBorderAccent} ${focusRingAccent} ${primaryTextLight} ${primaryTextDark}`;
  const selectContentClasses = `border ${inputBorderLight} ${inputBorderDark} ${cardBgLight} ${cardBgDark} ${primaryTextLight} ${primaryTextDark}`;
  const outlineButtonClasses = `border-[#4A1F1F]/50 dark:border-[#E0D6C3]/50 ${secondaryTextLight} ${secondaryTextDark} hover:text-[#2A0F0F] hover:border-[#2A0F0F] dark:hover:text-white dark:hover:border-white hover:bg-transparent dark:hover:bg-transparent transition-colors`;
  const primaryButtonClasses = `bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors`;
  const tableHeaderClasses = `h-12 px-4 text-left align-middle font-medium text-xs uppercase ${mutedTextLight} ${mutedTextDark}`;
  const tableCellClasses = `p-4 align-middle ${secondaryTextLight} ${secondaryTextDark}`;
  const ghostButtonClasses = `${secondaryTextLight} ${secondaryTextDark} hover:bg-gray-100 dark:hover:bg-gray-800 hover:${tabsTriggerHoverTextLight} dark:hover:${tabsTriggerHoverTextDark}`;
  const tagBgLight = `bg-[${accentColor}]/10`;
  const tagBgDark = `dark:bg-[${accentColor}]/20`;
  const tagText = `text-[${accentColor}]`;


  return (
    <div className="container px-4 py-8 md:px-6 lg:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 lg:mb-12 gap-4">
        <div>
          <h1 className={`text-3xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Admin Dashboard</h1>
          <p className={`${secondaryTextLight} ${secondaryTextDark} mt-1`}>Manage courses, students, and program content</p>
        </div>
        <div className="flex gap-2">
            <Link to="/admin/settings">
                 <Button variant="outline" size="sm" className={outlineButtonClasses}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </Button>
            </Link>
        </div>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full grid-cols-2 md:grid-cols-4 mb-8 rounded-lg p-1 ${tabsListBgLight} ${tabsListBgDark}`}>
          <TabsTrigger value="dashboard" className={`flex-1 sm:flex-auto ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200`}>Dashboard</TabsTrigger>
          <TabsTrigger value="students" className={`flex-1 sm:flex-auto ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200`}>Students</TabsTrigger>
          <TabsTrigger value="courses" className={`flex-1 sm:flex-auto ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200`}>Courses</TabsTrigger>
          <TabsTrigger value="quizzes" className={`flex-1 sm:flex-auto ${tabsTriggerTextLight} ${tabsTriggerTextDark} ${tabsTriggerHoverBgLight} ${tabsTriggerHoverBgDark} ${tabsTriggerHoverTextLight} ${tabsTriggerHoverTextDark} data-[state=active]:${tabsTriggerActiveBgLight} dark:data-[state=active]:${tabsTriggerActiveBgDark} data-[state=active]:${tabsTriggerActiveTextLight} dark:data-[state=active]:${tabsTriggerActiveTextDark} data-[state=active]:shadow-sm transition-colors duration-200`}>Quizzes</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.id} className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
                <CardHeader>
                  <CardTitle className={`text-sm font-medium ${mutedTextLight} ${mutedTextDark}`}>{stat.title}</CardTitle>
                   <div className={`rounded-full p-2 inline-block bg-gray-100 dark:bg-gray-700`}>
                     <stat.icon className={`h-5 w-5 ${secondaryTextLight} ${secondaryTextDark}`} />
                   </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${primaryTextLight} ${primaryTextDark}`}>{stat.value}</div>
                  <p className={`text-xs ${mutedTextLight} ${mutedTextDark}`}>
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className={`lg:col-span-1 ${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
                    <CardHeader>
                      <CardTitle className={`${primaryTextLight} ${primaryTextDark} font-serif`}>Recent Students</CardTitle>
                      <CardDescription className={`${secondaryTextLight} ${secondaryTextDark}`}>Overview of student activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {students.slice(0, 4).map((student) => (
                          <div key={student.id} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <UserCircle className={`h-8 w-8 ${mutedTextLight} ${mutedTextDark} flex-shrink-0`} />
                              <div>
                                <p className={`text-sm font-medium ${primaryTextLight} ${primaryTextDark}`}>{student.name}</p>
                                <p className={`text-xs ${mutedTextLight} ${mutedTextDark}`}>{student.course}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                               <Progress value={student.progress} className="h-2 w-16 sm:w-20 [&>div]:bg-[#C5A467]" />
                               <span className={`text-xs font-medium ${secondaryTextLight} ${secondaryTextDark}`}>{student.progress}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className={`w-full ${outlineButtonClasses}`} onClick={() => setActiveTab('students')}>
                        Manage Students <ArrowUpRight className="ml-1 h-4 w-4"/>
                      </Button>
                    </CardFooter>
                </Card>

                 <Card className={`lg:col-span-2 ${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
                    <CardHeader>
                        <CardTitle className={`${primaryTextLight} ${primaryTextDark} font-serif`}>Course Status</CardTitle>
                        <CardDescription className={`${secondaryTextLight} ${secondaryTextDark}`}>Overview of program courses</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-3">
                        {courses.slice(0, 4).map((course) => (
                        <div key={course.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border ${tableBorderLight} ${tableBorderDark} gap-3`}>
                            <div className="flex items-center gap-3 flex-1">
                            <BookOpen className={`h-5 w-5 text-[${accentColor}] flex-shrink-0`} />
                            <div>
                                <p className={`font-medium ${primaryTextLight} ${primaryTextDark}`}>{course.title}</p>
                                <p className={`text-xs ${mutedTextLight} ${mutedTextDark}`}>
                                {course.startDate} - {course.endDate}
                                </p>
                            </div>
                            </div>
                            <div className="flex items-center gap-4 mt-2 sm:mt-0 flex-shrink-0">
                            <div className={`flex items-center gap-1 text-sm ${secondaryTextLight} ${secondaryTextDark}`}>
                                <Users className="h-4 w-4" />
                                <span>{course.students}</span>
                            </div>
                            <div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(course.status)}`}>
                                    {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                                </span>
                            </div>
                             <Button variant="ghost" size="sm" className={`${ghostButtonClasses} text-xs px-2 py-1 h-auto`} onClick={() => setActiveTab('courses')}>
                                View
                             </Button>
                            </div>
                        </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className={`w-full ${outlineButtonClasses}`} onClick={() => setActiveTab('courses')}>
                        Manage Courses <ArrowUpRight className="ml-1 h-4 w-4"/>
                      </Button>
                    </CardFooter>
                </Card>
            </div>

            <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
                <CardHeader>
                  <CardTitle className={`${primaryTextLight} ${primaryTextDark} font-serif`}>Quizzes Overview</CardTitle>
                  <CardDescription className={`${secondaryTextLight} ${secondaryTextDark}`}>Recent and upcoming quiz status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                     {quizzes.slice(0, 4).map((quiz) => (
                      <div key={quiz.id} className="flex items-center justify-between gap-4 border-b pb-2 last:border-b-0 last:pb-0">
                        <div>
                          <p className={`text-sm font-medium ${primaryTextLight} ${primaryTextDark}`}>{quiz.title}</p>
                          <p className={`text-xs ${mutedTextLight} ${mutedTextDark}`}>{quiz.course}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`text-sm ${secondaryTextLight} ${secondaryTextDark}`}>{quiz.submitted}/{quiz.total} Submitted</span>
                            <div className={`flex items-center gap-2 text-xs flex-shrink-0 ${mutedTextLight} ${mutedTextDark}`}>
                            <Clock className="h-3.5 w-3.5" />
                            <span>Due: {quiz.dueDate}</span>
                            </div>
                        </div>
                      </div>
                    ))}
                     {quizzes.length === 0 && (
                         <p className={`text-sm text-center py-4 ${mutedTextLight} ${mutedTextDark}`}>No quizzes found.</p>
                     )}
                  </div>
                </CardContent>
                 <CardFooter>
                  <Button variant="outline" size="sm" className={`w-full ${outlineButtonClasses}`} onClick={() => setActiveTab('quizzes')}>
                    Manage Quizzes <ArrowUpRight className="ml-1 h-4 w-4"/>
                  </Button>
                </CardFooter>
            </Card>

        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${mutedTextLight} ${mutedTextDark}`} />
                <Input placeholder="Search students..." className={`pl-8 ${inputClasses}`} value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
              </div>
                <Select value={studentStatusFilter} onValueChange={setStudentStatusFilter}>
                <SelectTrigger className={selectTriggerClasses}>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className={selectContentClasses}>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="at risk">At Risk</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <Link to="/admin/students">
                 <Button className={primaryButtonClasses}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage All Students
                 </Button>
             </Link>
          </div>

          <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
            <CardContent className="p-0">
              <div className="relative w-full overflow-x-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className={`${tableHeaderBgLight} ${tableHeaderBgDark}`}>
                    <tr>
                      <th className={tableHeaderClasses}>Name</th>
                      <th className={tableHeaderClasses}>Email</th>
                      <th className={tableHeaderClasses}>Current Course</th>
                      <th className={tableHeaderClasses}>Progress</th>
                      <th className={tableHeaderClasses}>Status</th>
                      <th className={`${tableHeaderClasses} text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tableBorderLight} ${tableBorderDark}`}>
                    {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                      <tr key={student.id} className={`${tableRowBgLight} ${tableRowBgDark}`}>
                        <td className={`p-4 align-middle font-medium ${primaryTextLight} ${primaryTextDark}`}>{student.name}</td>
                        <td className={tableCellClasses}>{student.email}</td>
                        <td className={tableCellClasses}>{student.course}</td>
                        <td className={tableCellClasses}>
                          <div className="flex items-center gap-2">
                            <Progress value={student.progress} className={`h-1.5 w-20 sm:w-24 [&>div]:${student.status === 'at risk' ? 'bg-yellow-500' : `bg-[${accentColor}]` }`} />
                            <span className="text-xs font-medium">{student.progress}%</span>
                          </div>
                        </td>
                        <td className={tableCellClasses}>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(student.status)}`}>
                              {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                            </span>
                        </td>
                          <td className={`${tableCellClasses} text-right`}>
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`}>
                              <span className="sr-only">View Student</span>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`}>
                                <span className="sr-only">Edit Student</span>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className={`p-6 text-center ${mutedTextLight} ${mutedTextDark}`}>No students found matching your criteria.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${mutedTextLight} ${mutedTextDark}`} />
                <Input placeholder="Search courses..." className={`pl-8 ${inputClasses}`} value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} />
              </div>
                <Select value={courseStatusFilter} onValueChange={setCourseStatusFilter}>
                <SelectTrigger className={selectTriggerClasses}>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className={selectContentClasses}>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <Link to="/admin/courses">
                 <Button className={primaryButtonClasses}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Manage Course Structure
                 </Button>
             </Link>
          </div>

          <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
            <CardContent className="p-0">
              <div className="relative w-full overflow-x-auto">
                  <table className="w-full caption-bottom text-sm">
                  <thead className={`${tableHeaderBgLight} ${tableHeaderBgDark}`}>
                    <tr>
                      <th className={tableHeaderClasses}>Course Title</th>
                      <th className={tableHeaderClasses}>Students</th>
                      <th className={tableHeaderClasses}>Start Date</th>
                      <th className={tableHeaderClasses}>End Date</th>
                      <th className={tableHeaderClasses}>Status</th>
                      <th className={`${tableHeaderClasses} text-right`}>Actions</th>
                    </tr>
                  </thead>
                    <tbody className={`divide-y ${tableBorderLight} ${tableBorderDark}`}>
                      {filteredCourses.length > 0 ? filteredCourses.map((course) => (
                      <tr key={course.id} className={`${tableRowBgLight} ${tableRowBgDark}`}>
                        <td className={`p-4 align-middle font-medium ${primaryTextLight} ${primaryTextDark}`}>{course.title}</td>
                        <td className={tableCellClasses}>{course.students}</td>
                        <td className={tableCellClasses}>{course.startDate}</td>
                        <td className={tableCellClasses}>{course.endDate}</td>
                          <td className={tableCellClasses}>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(course.status)}`}>
                              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                            </span>
                        </td>
                          <td className={`${tableCellClasses} text-right`}>
                            <div className="flex items-center justify-end gap-1">
                              <Link to={`/admin/courses?courseId=${course.id}`}>
                                  <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`}>
                                      <span className="sr-only">Manage Course</span>
                                      <Edit className="h-4 w-4" />
                                  </Button>
                              </Link>
                          </div>
                        </td>
                      </tr>
                    )) : (
                        <tr><td colSpan={6} className={`p-6 text-center ${mutedTextLight} ${mutedTextDark}`}>No courses found matching your criteria.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${mutedTextLight} ${mutedTextDark}`} />
                <Input placeholder="Search quizzes..." className={`pl-8 ${inputClasses}`} value={quizSearch} onChange={(e) => setQuizSearch(e.target.value)} />
              </div>
                <Select value={quizCourseFilter} onValueChange={setQuizCourseFilter}>
                <SelectTrigger className={selectTriggerClasses}>
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent className={selectContentClasses}>
                  <SelectItem value="all">All Courses</SelectItem>
                  {[...new Map(quizzes.map(q => [q.courseId, q])).values()].map(quiz => (
                    <SelectItem key={quiz.courseId} value={quiz.courseId}>
                      {quiz.course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             {/* Updated Link */}
             <Link to="/admin/quizzes">
                 <Button className={primaryButtonClasses}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Manage All Quizzes
                 </Button>
             </Link>
          </div>

            <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm`}>
            <CardContent className="p-0">
                <div className="relative w-full overflow-x-auto">
                  <table className="w-full caption-bottom text-sm">
                  <thead className={`${tableHeaderBgLight} ${tableHeaderBgDark}`}>
                    <tr>
                      {/* Updated Headers */}
                      <th className={tableHeaderClasses}>Quiz Title</th>
                      <th className={tableHeaderClasses}>Course</th>
                      <th className={tableHeaderClasses}>Due Date</th>
                      <th className={tableHeaderClasses}>Submissions</th>
                      <th className={`${tableHeaderClasses} text-right`}>Actions</th>
                    </tr>
                  </thead>
                    <tbody className={`divide-y ${tableBorderLight} ${tableBorderDark}`}>
                    {filteredQuizzes.length > 0 ? filteredQuizzes.map((quiz) => (
                      <tr key={quiz.id} className={`${tableRowBgLight} ${tableRowBgDark}`}>
                        <td className={`p-4 align-middle font-medium ${primaryTextLight} ${primaryTextDark}`}>{quiz.title}</td>
                        <td className={tableCellClasses}>{quiz.course}</td>
                        <td className={tableCellClasses}>{quiz.dueDate}</td>
                        <td className={tableCellClasses}>
                          {quiz.submitted}/{quiz.total}
                        </td>
                        <td className={`${tableCellClasses} text-right`}>
                          <div className="flex items-center justify-end gap-1">
                              {/* Updated Link */}
                              <Link to={`/admin/quizzes/${quiz.id}/submissions`}>
                                 <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`}>
                                  <span className="sr-only">View Submissions</span>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              {/* Optional: Link to edit quiz directly */}
                               <Link to={`/admin/quizzes/${quiz.id}/edit`}> {/* Example edit route */}
                                  <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`}>
                                      <span className="sr-only">Edit Quiz</span>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                               </Link>
                          </div>
                        </td>
                      </tr>
                    )) : (
                        <tr><td colSpan={5} className={`p-6 text-center ${mutedTextLight} ${mutedTextDark}`}>No quizzes found matching your criteria.</td></tr>
                    )}
                  </tbody>
                </table>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}