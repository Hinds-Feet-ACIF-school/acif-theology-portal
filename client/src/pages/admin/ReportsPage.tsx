
import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../../components/ui/button.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card.js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.js"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select.js"
import { Progress } from "../../components/ui/progress.js"
import {
  ArrowLeft,
  Download,
  BarChart,
  PieChart,
  LineChart,
  Users,
  BookOpen,
  CheckCircle2,
  FileText,
  Clock,
  MessageSquare,
} from "lucide-react"


const lightBg = 'bg-[#FFF8F0]';
const darkBg = 'dark:bg-gray-950';
const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const goldAccent = 'text-[#C5A467]';
const goldBg = 'bg-[#C5A467]';
const goldBgHover = 'hover:bg-[#B08F55]';
const goldBorder = 'border-[#C5A467]';
const lightCardBg = 'bg-[#FFFDFB]';
const darkCardBg = 'dark:bg-gray-900';
const goldAccentBgLight = 'bg-[#C5A467]/10 dark:bg-[#C5A467]/15';
const progressIndicator = '[&>div]:bg-[#C5A467]';
const mutedText = 'text-gray-600 dark:text-gray-400';

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (

    <div className={`flex flex-col min-h-screen ${lightBg} ${darkBg}`}>
      <div className="container px-4 py-8 md:px-6">
        <div className="flex items-center gap-2 mb-6">

          <Link to="/admin" className={`flex items-center ${goldAccent} hover:underline`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>

            <h1 className={`text-3xl font-bold tracking-tight ${deepBrown}`}>Reports & Analytics</h1>
            <p className={`${midBrown}`}>View program statistics, student performance, and generate reports</p>
          </div>
          <div className="flex gap-2">

            <Button
              variant="outline"
              className={`${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>

            <Button
              className={`${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`}
            >
              <BarChart className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8" onValueChange={setActiveTab}>

          <TabsList className="bg-gray-100/50 dark:bg-gray-800/50 rounded-md">
            <TabsTrigger
              value="overview"
              className={`${midBrown} data-[state=active]:${deepBrown} data-[state=active]:bg-[#FFF8F0] dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm`}
            >
              Program Overview
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className={`${midBrown} data-[state=active]:${deepBrown} data-[state=active]:bg-[#FFF8F0] dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm`}
            >
              Student Performance
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className={`${midBrown} data-[state=active]:${deepBrown} data-[state=active]:bg-[#FFF8F0] dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm`}
            >
              Course Analytics
            </TabsTrigger>
            <TabsTrigger
              value="engagement"
              className={`${midBrown} data-[state=active]:${deepBrown} data-[state=active]:bg-[#FFF8F0] dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm`}
            >
              Engagement Metrics
            </TabsTrigger>
          </TabsList>


          <TabsContent value="overview" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex gap-2 w-full md:w-auto">

                <Select defaultValue="current">
                  <SelectTrigger className={`w-[250px] ${lightCardBg} ${darkCardBg} border-gray-300 dark:border-gray-700 ${deepBrown} focus:ring-1 focus:ring-offset-0 focus:ring-[#C5A467]`}>
                    <SelectValue placeholder="Select cohort" />
                  </SelectTrigger>
                  <SelectContent className={`${lightBg} ${darkBg} border-gray-300 dark:border-gray-700 ${deepBrown}`}>
                    <SelectItem value="current">Current Cohort (Jan 2025)</SelectItem>
                    <SelectItem value="previous">Previous Cohort (Jul 2024)</SelectItem>
                    <SelectItem value="all">All Cohorts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${midBrown}`}>Total Students</p>
                      <h3 className={`text-2xl font-bold mt-1 ${deepBrown}`}>124</h3>
                      <p className={`text-xs mt-1 ${midBrown} opacity-80`}>+12% from last cohort</p>
                    </div>
                    <div className={`rounded-full ${goldAccentBgLight} p-3`}>
                      <Users className={`h-6 w-6 ${goldAccent}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${midBrown}`}>Active Courses</p>
                      <h3 className={`text-2xl font-bold mt-1 ${deepBrown}`}>6</h3>
                      <p className={`text-xs mt-1 ${midBrown} opacity-80`}>No change</p>
                    </div>
                    <div className={`rounded-full ${goldAccentBgLight} p-3`}>
                      <BookOpen className={`h-6 w-6 ${goldAccent}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${midBrown}`}>Completion Rate</p>
                      <h3 className={`text-2xl font-bold mt-1 ${deepBrown}`}>78%</h3>
                      <p className={`text-xs mt-1 ${midBrown} opacity-80`}>+5% from last cohort</p>
                    </div>
                    <div className={`rounded-full ${goldAccentBgLight} p-3`}>
                      <CheckCircle2 className={`h-6 w-6 ${goldAccent}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${midBrown}`}>Average Grade</p>
                      <h3 className={`text-2xl font-bold mt-1 ${deepBrown}`}>82%</h3>
                      <p className={`text-xs mt-1 ${midBrown} opacity-80`}>+2% from last cohort</p>
                    </div>
                    <div className={`rounded-full ${goldAccentBgLight} p-3`}>
                      <FileText className={`h-6 w-6 ${goldAccent}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


            <div className="grid md:grid-cols-2 gap-6">
              <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
                <CardHeader>
                  <CardTitle className={`${deepBrown}`}>Enrollment Trends</CardTitle>
                  <CardDescription className={`${midBrown}`}>Student enrollment over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-64">
                    <LineChart className={`h-16 w-16 ${mutedText}`} />
                    <p className={`text-sm ml-4 ${mutedText}`}>Enrollment chart would be displayed here</p>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
                <CardHeader>
                  <CardTitle className={`${deepBrown}`}>Geographic Distribution</CardTitle>
                  <CardDescription className={`${midBrown}`}>Student locations by country</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-64">
                    <PieChart className={`h-16 w-16 ${mutedText}`} />
                    <div className="ml-4">
                      <p className={`text-sm mb-2 ${mutedText}`}>Distribution chart would be displayed here</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={`text-sm ${deepBrown}`}>United States</span>
                          <span className={`text-sm font-medium ${midBrown}`}>32%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${deepBrown}`}>Nigeria</span>
                          <span className={`text-sm font-medium ${midBrown}`}>18%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${deepBrown}`}>United Kingdom</span>
                          <span className={`text-sm font-medium ${midBrown}`}>12%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${deepBrown}`}>Other</span>
                          <span className={`text-sm font-medium ${midBrown}`}>38%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


            <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
              <CardHeader>
                <CardTitle className={`${deepBrown}`}>Program Completion</CardTitle>
                <CardDescription className={`${midBrown}`}>Course completion rates across the program</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">

                  {[
                    { name: "Foundations of the Christian Faith", value: 85 },
                    { name: "The Bible: God's Word", value: 78 },
                    { name: "Apostolic Doctrine", value: 72 },
                    { name: "Spiritual Growth & Christian Living", value: 68 },
                    { name: "Introduction to Evangelism", value: 65 },
                    { name: "Church Life & Service", value: 60 },
                  ].map(course => (
                    <div key={course.name}>
                      <div className="flex justify-between mb-1">
                        <span className={`text-sm font-medium ${deepBrown}`}>{course.name}</span>
                        <span className={`text-sm font-medium ${midBrown}`}>{course.value}%</span>
                      </div>
                      <Progress value={course.value} className={`h-2 bg-gray-200 dark:bg-gray-700 ${progressIndicator}`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="students" className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex gap-2 w-full md:w-auto">

                 <Select defaultValue="current">
                  <SelectTrigger className={`w-[250px] ${lightCardBg} ${darkCardBg} border-gray-300 dark:border-gray-700 ${deepBrown} focus:ring-1 focus:ring-offset-0 focus:ring-[#C5A467]`}>
                    <SelectValue placeholder="Select cohort" />
                  </SelectTrigger>
                  <SelectContent className={`${lightBg} ${darkBg} border-gray-300 dark:border-gray-700 ${deepBrown}`}>
                    <SelectItem value="current">Current Cohort (Jan 2025)</SelectItem>
                    <SelectItem value="previous">Previous Cohort (Jul 2024)</SelectItem>
                    <SelectItem value="all">All Cohorts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
                <CardHeader>
                  <CardTitle className={`${deepBrown}`}>Grade Distribution</CardTitle>
                  <CardDescription className={`${midBrown}`}>Student grades across all courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-64">
                     <BarChart className={`h-16 w-16 ${mutedText}`} />
                    <div className="ml-4">
                      <p className={`text-sm mb-2 ${mutedText}`}>Grade distribution chart would be displayed here</p>
                       <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={`text-sm ${deepBrown}`}>A (90-100%)</span>
                          <span className={`text-sm font-medium ${midBrown}`}>25%</span>
                        </div>
                         <div className="flex justify-between">
                          <span className={`text-sm ${deepBrown}`}>B (80-89%)</span>
                          <span className={`text-sm font-medium ${midBrown}`}>42%</span>
                        </div>
                         <div className="flex justify-between">
                          <span className={`text-sm ${deepBrown}`}>C (70-79%)</span>
                          <span className={`text-sm font-medium ${midBrown}`}>20%</span>
                        </div>
                         <div className="flex justify-between">
                          <span className={`text-sm ${deepBrown}`}>D (60-69%)</span>
                          <span className={`text-sm font-medium ${midBrown}`}>10%</span>
                        </div>
                         <div className="flex justify-between">
                          <span className={`text-sm ${deepBrown}`}>F (Below 60%)</span>
                          <span className={`text-sm font-medium ${midBrown}`}>3%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>


              <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
                <CardHeader>
                  <CardTitle className={`${deepBrown}`}>Student Progress</CardTitle>
                  <CardDescription className={`${midBrown}`}>Overall student progress in the program</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                     {[
                       { name: "Completed (All Courses)", value: 15 },
                       { name: "In Progress (4+ Courses)", value: 25 },
                       { name: "In Progress (2-3 Courses)", value: 35 },
                       { name: "Just Started (1 Course)", value: 25 },
                     ].map(item => (
                       <div key={item.name}>
                         <div className="flex justify-between mb-1">
                           <span className={`text-sm font-medium ${deepBrown}`}>{item.name}</span>
                           <span className={`text-sm font-medium ${midBrown}`}>{item.value}%</span>
                         </div>
                         <Progress value={item.value} className={`h-2 bg-gray-200 dark:bg-gray-700 ${progressIndicator}`} />
                       </div>
                     ))}
                  </div>
                </CardContent>
              </Card>
            </div>


            <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
              <CardHeader>
                <CardTitle className={`${deepBrown}`}>At-Risk Students</CardTitle>
                <CardDescription className={`${midBrown}`}>Students who may need additional support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">

                    <div className={`${goldAccentBgLight} rounded-lg p-4`}>
                      <h3 className={`text-sm font-medium ${midBrown}`}>Total At-Risk Students</h3>
                      <p className={`text-3xl font-bold ${deepBrown}`}>15</p>
                      <p className={`text-xs mt-1 ${midBrown} opacity-80`}>12% of total students</p>
                    </div>
                     <div className={`${goldAccentBgLight} rounded-lg p-4`}>
                      <h3 className={`text-sm font-medium ${midBrown}`}>Intervention Success Rate</h3>
                      <p className={`text-3xl font-bold ${deepBrown}`}>68%</p>
                      <p className={`text-xs mt-1 ${midBrown} opacity-80`}>+8% from last cohort</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className={`text-sm font-medium mb-2 ${deepBrown}`}>Risk Factors</h3>
                    <div className="space-y-2">

                      <div className="flex justify-between">
                        <span className={`text-sm ${deepBrown}`}>Low Assignment Completion</span>
                        <span className={`text-sm font-medium ${midBrown}`}>45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${deepBrown}`}>Low Login Frequency</span>
                        <span className={`text-sm font-medium ${midBrown}`}>30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${deepBrown}`}>Poor Quiz Performance</span>
                        <span className={`text-sm font-medium ${midBrown}`}>15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${deepBrown}`}>Low Discussion Participation</span>
                        <span className={`text-sm font-medium ${midBrown}`}>10%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="courses" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex gap-2 w-full md:w-auto">

                 <Select defaultValue="all">
                  <SelectTrigger className={`w-[250px] ${lightCardBg} ${darkCardBg} border-gray-300 dark:border-gray-700 ${deepBrown} focus:ring-1 focus:ring-offset-0 focus:ring-[#C5A467]`}>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent className={`${lightBg} ${darkBg} border-gray-300 dark:border-gray-700 ${deepBrown}`}>
                    <SelectItem value="all">All Courses</SelectItem>
                    <SelectItem value="foundations">Foundations of the Christian Faith</SelectItem>
                    <SelectItem value="bible">The Bible: God's Word</SelectItem>
                    <SelectItem value="apostolic">Apostolic Doctrine</SelectItem>
                    <SelectItem value="spiritual">Spiritual Growth & Christian Living</SelectItem>
                    <SelectItem value="evangelism">Introduction to Evangelism</SelectItem>
                    <SelectItem value="church">Church Life & Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
                <CardHeader>
                  <CardTitle className={`${deepBrown}`}>Course Completion Rates</CardTitle>
                  <CardDescription className={`${midBrown}`}>Percentage of students completing each course</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                      {[
                          { name: "Foundations of the Christian Faith", value: 85 },
                          { name: "The Bible: God's Word", value: 78 },
                          { name: "Apostolic Doctrine", value: 72 },
                          { name: "Spiritual Growth & Christian Living", value: 68 },
                          { name: "Introduction to Evangelism", value: 65 },
                          { name: "Church Life & Service", value: 60 },
                      ].map(course => (
                          <div key={course.name}>
                          <div className="flex justify-between mb-1">
                              <span className={`text-sm font-medium ${deepBrown}`}>{course.name}</span>
                              <span className={`text-sm font-medium ${midBrown}`}>{course.value}%</span>
                          </div>
                          <Progress value={course.value} className={`h-2 bg-gray-200 dark:bg-gray-700 ${progressIndicator}`} />
                          </div>
                      ))}
                  </div>
                </CardContent>
              </Card>


              <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
                <CardHeader>
                  <CardTitle className={`${deepBrown}`}>Average Course Grades</CardTitle>
                  <CardDescription className={`${midBrown}`}>Average student grades by course</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                      {[
                          { name: "Foundations of the Christian Faith", value: 84 },
                          { name: "The Bible: God's Word", value: 82 },
                          { name: "Apostolic Doctrine", value: 80 },
                          { name: "Spiritual Growth & Christian Living", value: 85 },
                          { name: "Introduction to Evangelism", value: 79 },
                          { name: "Church Life & Service", value: 83 },
                      ].map(course => (
                          <div key={course.name}>
                          <div className="flex justify-between mb-1">
                              <span className={`text-sm font-medium ${deepBrown}`}>{course.name}</span>
                              <span className={`text-sm font-medium ${midBrown}`}>{course.value}%</span>
                          </div>
                          <Progress value={course.value} className={`h-2 bg-gray-200 dark:bg-gray-700 ${progressIndicator}`} />
                          </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>


            <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
              <CardHeader>
                <CardTitle className={`${deepBrown}`}>Module Completion Analysis</CardTitle>
                <CardDescription className={`${midBrown}`}>Completion rates for individual course modules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-sm font-medium mb-2 ${deepBrown}`}>Foundations of the Christian Faith</h3>
                     <div className="space-y-2">
                       {[
                         { name: "Week 1: The Nature & Attributes of God", value: 95 },
                         { name: "Week 2: The Person & Work of Jesus Christ", value: 90 },
                         { name: "Week 3: The Holy Spirit & Spiritual Birth", value: 85 },
                         { name: "Week 4: Salvation & the New Life", value: 80 },
                       ].map(module => (
                         <div key={module.name}>
                           <div className="flex justify-between mb-1">
                             <span className={`text-sm ${deepBrown}`}>{module.name}</span>
                             <span className={`text-sm font-medium ${midBrown}`}>{module.value}%</span>
                           </div>
                           <Progress value={module.value} className={`h-2 bg-gray-200 dark:bg-gray-700 ${progressIndicator}`} />
                         </div>
                       ))}
                     </div>
                  </div>

                  <div>
                    <h3 className={`text-sm font-medium mb-2 ${deepBrown}`}>The Bible: God's Word</h3>
                    <div className="space-y-2">
                      {[
                        { name: "Week 1: Canon & Inspiration", value: 92 },
                        { name: "Week 2: Old & New Testament Overview", value: 85 },
                        { name: "Week 3: Hermeneutics", value: 75 },
                        { name: "Week 4: Applying Scripture Today", value: 70 },
                      ].map(module => (
                        <div key={module.name}>
                          <div className="flex justify-between mb-1">
                            <span className={`text-sm ${deepBrown}`}>{module.name}</span>
                            <span className={`text-sm font-medium ${midBrown}`}>{module.value}%</span>
                          </div>
                          <Progress value={module.value} className={`h-2 bg-gray-200 dark:bg-gray-700 ${progressIndicator}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="engagement" className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex gap-2 w-full md:w-auto">

                <Select defaultValue="current">
                  <SelectTrigger className={`w-[250px] ${lightCardBg} ${darkCardBg} border-gray-300 dark:border-gray-700 ${deepBrown} focus:ring-1 focus:ring-offset-0 focus:ring-[#C5A467]`}>
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent className={`${lightBg} ${darkBg} border-gray-300 dark:border-gray-700 ${deepBrown}`}>
                    <SelectItem value="current">Current Month</SelectItem>
                    <SelectItem value="last3">Last 3 Months</SelectItem>
                    <SelectItem value="last6">Last 6 Months</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${midBrown}`}>Avg. Weekly Logins</p>
                      <h3 className={`text-2xl font-bold mt-1 ${deepBrown}`}>4.2</h3>
                      <p className={`text-xs mt-1 ${midBrown} opacity-80`}>+0.3 from last month</p>
                    </div>
                    <div className={`rounded-full ${goldAccentBgLight} p-3`}>
                      <Users className={`h-6 w-6 ${goldAccent}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${midBrown}`}>Avg. Time Spent</p>
                      <h3 className={`text-2xl font-bold mt-1 ${deepBrown}`}>5.8h</h3>
                      <p className={`text-xs mt-1 ${midBrown} opacity-80`}>per week</p>
                    </div>
                    <div className={`rounded-full ${goldAccentBgLight} p-3`}>
                      <Clock className={`h-6 w-6 ${goldAccent}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${midBrown}`}>Discussion Posts</p>
                      <h3 className={`text-2xl font-bold mt-1 ${deepBrown}`}>3.5</h3>
                      <p className={`text-xs mt-1 ${midBrown} opacity-80`}>per student/week</p>
                    </div>
                    <div className={`rounded-full ${goldAccentBgLight} p-3`}>
                      <MessageSquare className={`h-6 w-6 ${goldAccent}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${midBrown}`}>Resource Downloads</p>
                      <h3 className={`text-2xl font-bold mt-1 ${deepBrown}`}>12.3</h3>
                      <p className={`text-xs mt-1 ${midBrown} opacity-80`}>per student/month</p>
                    </div>
                    <div className={`rounded-full ${goldAccentBgLight} p-3`}>
                      <Download className={`h-6 w-6 ${goldAccent}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
                 <CardHeader>
                  <CardTitle className={`${deepBrown}`}>Login Frequency</CardTitle>
                  <CardDescription className={`${midBrown}`}>Student login patterns over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-64">
                    <LineChart className={`h-16 w-16 ${mutedText}`} />
                    <p className={`text-sm ml-4 ${mutedText}`}>Login frequency chart would be displayed here</p>
                  </div>
                </CardContent>
              </Card>


              <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
                <CardHeader>
                  <CardTitle className={`${deepBrown}`}>Content Engagement</CardTitle>
                  <CardDescription className={`${midBrown}`}>Most accessed learning materials</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                     {[
                       { name: "Video Lectures", value: 45 },
                       { name: "Reading Materials", value: 30 },
                       { name: "Discussion Forums", value: 15 },
                       { name: "Quizzes & Assessments", value: 10 },
                     ].map(item => (
                       <div key={item.name}>
                         <div className="flex justify-between mb-1">
                           <span className={`text-sm font-medium ${deepBrown}`}>{item.name}</span>
                           <span className={`text-sm font-medium ${midBrown}`}>{item.value}%</span>
                         </div>
                         <Progress value={item.value} className={`h-2 bg-gray-200 dark:bg-gray-700 ${progressIndicator}`} />
                       </div>
                     ))}
                  </div>
                </CardContent>
              </Card>
            </div>


            <Card className={`${lightCardBg} ${darkCardBg} border border-gray-200 dark:border-gray-700/50`}>
              <CardHeader>
                <CardTitle className={`${deepBrown}`}>Peak Activity Times</CardTitle>
                <CardDescription className={`${midBrown}`}>When students are most active on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-sm font-medium mb-2 ${deepBrown}`}>Day of Week</h3>
                    <div className="space-y-2">
                       {[
                         { name: "Monday", value: 18 }, { name: "Tuesday", value: 15 }, { name: "Wednesday", value: 14 },
                         { name: "Thursday", value: 12 }, { name: "Friday", value: 10 }, { name: "Saturday", value: 12 },
                         { name: "Sunday", value: 19 },
                       ].map(day => (
                         <div key={day.name}>
                           <div className="flex justify-between mb-1">
                             <span className={`text-sm ${deepBrown}`}>{day.name}</span>
                             <span className={`text-sm font-medium ${midBrown}`}>{day.value}%</span>
                           </div>
                           <Progress value={day.value} className={`h-2 bg-gray-200 dark:bg-gray-700 ${progressIndicator}`} />
                         </div>
                       ))}
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-sm font-medium mb-2 ${deepBrown}`}>Time of Day</h3>
                     <div className="space-y-2">
                       {[
                         { name: "Morning (6am-12pm)", value: 25 },
                         { name: "Afternoon (12pm-6pm)", value: 30 },
                         { name: "Evening (6pm-12am)", value: 40 },
                         { name: "Night (12am-6am)", value: 5 },
                       ].map(time => (
                         <div key={time.name}>
                           <div className="flex justify-between mb-1">
                             <span className={`text-sm ${deepBrown}`}>{time.name}</span>
                             <span className={`text-sm font-medium ${midBrown}`}>{time.value}%</span>
                           </div>
                           <Progress value={time.value} className={`h-2 bg-gray-200 dark:bg-gray-700 ${progressIndicator}`} />
                         </div>
                       ))}
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}