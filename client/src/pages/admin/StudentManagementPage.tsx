import React, { useState } from "react"; 
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Progress } from "../../components/ui/progress";
import { Users, PlusCircle, Search, Edit, Eye, Trash2, ArrowLeft, Mail, Save, ChevronLeft, UserCircle, FileText, BarChart, UserPlus, Download, HelpCircle // Changed icon
 } from 'lucide-react';

// Theme Constants
const accentColor = "#C5A467";
const accentHoverColor = "#B08F55";
const lightBg = 'bg-[#FFF8F0]';
const darkBg = 'dark:bg-gray-950';
const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const goldAccent = 'text-[#C5A467]';
const goldBg = 'bg-[#C5A467]';
const goldBgHover = 'hover:bg-[#B08F55]';
const goldBorder = 'border-[#C5A467]';
const lightCardBg = 'bg-white';
const darkCardBg = 'dark:bg-gray-900';
const goldAccentBgLight = 'bg-[#C5A467]/10 dark:bg-[#C5A467]/15';
const mutedText = 'text-gray-600 dark:text-gray-400';
const inputBorder = 'border-gray-300 dark:border-gray-700';
const focusRing = 'focus:ring-1 focus:ring-offset-0 focus:ring-[#C5A467]';
const tableHeaderBg = 'bg-gray-50 dark:bg-gray-800/50';
const tableRowBorder = 'border-b border-gray-200 dark:border-gray-700';
const tableHeaderClasses = `h-12 px-4 text-left align-middle font-medium text-xs uppercase ${mutedText}`;
const tableCellClasses = `p-4 align-middle ${midBrown}`;
const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
const ghostButtonClasses = `${midBrown} hover:bg-gray-100 dark:hover:bg-gray-700/50`;
const linkClasses = `${goldAccent} hover:underline`;
const tabsListBg = 'bg-gray-100/50 dark:bg-gray-800/50';
const tabsTriggerClasses = `${midBrown} data-[state=active]:${deepBrown} data-[state=active]:${lightCardBg} dark:data-[state=active]:${darkCardBg} data-[state=active]:shadow-sm`;
const positiveColor = "text-green-600 dark:text-green-400";
const positiveBg = "bg-green-100 dark:bg-green-900/30";
const warningColor = "text-yellow-700 dark:text-yellow-400";
const warningBg = "bg-yellow-100 dark:bg-yellow-900/30";
const inactiveColor = mutedText;
const inactiveBg = "bg-gray-100 dark:bg-gray-700/30";

export default function AdminStudentManagementPage() {
  const [activeTab, setActiveTab] = useState("students");
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("all");

  // Mock data - Replace with actual API calls in useEffect
  const students = [
    { id: 1, name: "John Doe", email: "john.doe@example.com", country: "United States", church: "First Apostolic Church", course: "Foundations of the Christian Faith", progress: 65, status: "active", enrollmentDate: "Jan 15, 2025", lastActive: "May 2, 2025" },
    { id: 2, name: "Jane Smith", email: "jane.smith@example.com", country: "United Kingdom", church: "London Apostolic Fellowship", course: "Foundations of the Christian Faith", progress: 80, status: "active", enrollmentDate: "Jan 15, 2025", lastActive: "May 3, 2025" },
    { id: 3, name: "Michael Johnson", email: "michael.j@example.com", country: "Canada", church: "Toronto Apostolic Center", course: "Foundations of the Christian Faith", progress: 45, status: "active", enrollmentDate: "Jan 15, 2025", lastActive: "Apr 28, 2025" },
    { id: 4, name: "Sarah Williams", email: "sarah.w@example.com", country: "Australia", church: "Sydney Apostolic Church", course: "Foundations of the Christian Faith", progress: 90, status: "active", enrollmentDate: "Jan 15, 2025", lastActive: "May 4, 2025" },
    { id: 5, name: "Robert Brown", email: "robert.b@example.com", country: "Nigeria", church: "Lagos Apostolic Ministry", course: "Foundations of the Christian Faith", progress: 30, status: "at risk", enrollmentDate: "Jan 15, 2025", lastActive: "Apr 20, 2025" },
    { id: 6, name: "Emily Davis", email: "emily.d@example.com", country: "USA", church: "N/A", course: "The Bible: God's Word", progress: 0, status: "inactive", enrollmentDate: "Feb 15, 2025", lastActive: "Feb 15, 2025"},
  ];

  const studentGrades = [ // Renamed -> quizzes? Or kept generic? Assuming quizzes for now
    { id: 1, assignment: "Quiz: God's Attributes", type: "Quiz", grade: 90, maxGrade: 100, date: "Jan 22, 2025" },
    { id: 3, assignment: "Quiz: The Person of Christ", type: "Quiz", grade: 88, maxGrade: 100, date: "Jan 29, 2025" },
    // Removed non-quiz items for consistency based on previous change
  ];

  const filteredStudents = students.filter(s =>
      (s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase())) &&
      (studentStatusFilter === 'all' || s.status === studentStatusFilter)
  );

  const getStatusBadgeClasses = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return `${positiveBg} ${positiveColor}`;
      case 'at risk': return `${warningBg} ${warningColor}`;
      case 'inactive': return `${inactiveBg} ${inactiveColor}`;
      case 'completed': return `${inactiveBg} ${inactiveColor}`;
      default: return `${inactiveBg} ${inactiveColor}`;
    }
  };

  const inputClasses = `h-9 rounded-md px-3 text-sm ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing} placeholder:text-gray-400 dark:placeholder:text-gray-500`;
  const selectTriggerClasses = `h-9 rounded-md px-3 text-sm w-full md:w-[180px] ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`;
  const selectContentClasses = `border ${inputBorder} ${lightCardBg} ${darkCardBg} ${deepBrown}`;

  return (
    <div className={`flex flex-col min-h-screen ${lightBg} ${darkBg}`}>
      <div className="container px-4 py-8 md:px-6">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/admin" className={`flex items-center ${linkClasses}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${deepBrown}`}>Student Management</h1>
            <p className={midBrown}>Manage students, track progress, and view performance</p>
          </div>
          <Button className={primaryButtonClasses}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Student
          </Button>
        </div>

        <Tabs defaultValue="students" className="space-y-8" onValueChange={setActiveTab}>
          <TabsList className={`rounded-md p-1 ${tabsListBg}`}>
            <TabsTrigger value="students" className={tabsTriggerClasses}>All Students</TabsTrigger>
            <TabsTrigger value="progress" className={tabsTriggerClasses}>Progress Tracking</TabsTrigger>
            <TabsTrigger value="grades" className={tabsTriggerClasses}>Grades & Assessment</TabsTrigger>
            <TabsTrigger value="reports" className={tabsTriggerClasses}>Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${mutedText}`} />
                  <Input placeholder="Search students..." className={`pl-8 ${inputClasses}`} value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
                </div>
                <Select value={studentStatusFilter} onValueChange={setStudentStatusFilter}>
                  <SelectTrigger className={selectTriggerClasses}>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className={selectContentClasses}>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                     <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className={outlineButtonClasses}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
              <CardContent className="p-0">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className={tableHeaderBg}>
                      <tr className={tableRowBorder}>
                        <th className={tableHeaderClasses}>Name</th>
                        <th className={tableHeaderClasses}>Email</th>
                        <th className={tableHeaderClasses}>Current Course</th>
                        <th className={tableHeaderClasses}>Progress</th>
                        <th className={tableHeaderClasses}>Status</th>
                        <th className={tableHeaderClasses}>Last Active</th>
                        <th className={`${tableHeaderClasses} text-right`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${tableRowBorder}`}>
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className={`hover:${lightCardBg} dark:hover:${darkCardBg}`}>
                          <td className={`p-4 align-middle font-medium ${deepBrown}`}>{student.name}</td>
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
                          <td className={tableCellClasses}>{student.lastActive}</td>
                          <td className={`${tableCellClasses} text-right`}>
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`} onClick={() => setSelectedStudent(student.id)}>
                                <span className="sr-only">View Student</span>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`} onClick={() => { setSelectedStudent(student.id); setIsEditing(true); }}>
                                <span className="sr-only">Edit Student</span>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className={`${ghostButtonClasses} hover:text-red-600 h-8 w-8`}>
                                <span className="sr-only">Delete Student</span>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                       {filteredStudents.length === 0 && (
                         <tr><td colSpan={7} className={`p-6 text-center ${mutedText}`}>No students found matching your criteria.</td></tr>
                       )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {selectedStudent && (
              <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className={deepBrown}>{isEditing ? "Edit Student" : "Student Details"}</CardTitle>
                    <CardDescription className={midBrown}>
                      {isEditing ? "Modify student information" : "View detailed student information"}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className={ghostButtonClasses} onClick={() => { setSelectedStudent(null); setIsEditing(false); }}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className={deepBrown}>Full Name</Label>
                          <Input id="name" defaultValue={students.find(s => s.id === selectedStudent)?.name} className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className={deepBrown}>Email</Label>
                          <Input id="email" type="email" defaultValue={students.find(s => s.id === selectedStudent)?.email} className={inputClasses} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="country" className={deepBrown}>Country</Label>
                          <Input id="country" defaultValue={students.find(s => s.id === selectedStudent)?.country} className={inputClasses}/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="church" className={deepBrown}>Church Affiliation</Label>
                          <Input id="church" defaultValue={students.find(s => s.id === selectedStudent)?.church} className={inputClasses}/>
                        </div>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="status" className={deepBrown}>Status</Label>
                            <Select defaultValue={students.find(s => s.id === selectedStudent)?.status}>
                              <SelectTrigger className={selectTriggerClasses}>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent className={selectContentClasses}>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="at-risk">At Risk</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="course" className={deepBrown}>Current Course</Label>
                            <Select defaultValue={students.find(s => s.id === selectedStudent)?.course}>
                              <SelectTrigger className={selectTriggerClasses}>
                                <SelectValue placeholder="Select course" />
                              </SelectTrigger>
                              <SelectContent className={selectContentClasses}>
                                  <SelectItem value="Foundations of the Christian Faith">Foundations of the Christian Faith</SelectItem>
                                  <SelectItem value="The Bible: God's Word">The Bible: God's Word</SelectItem>
                              </SelectContent>
                            </Select>
                         </div>
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className={`font-medium ${deepBrown}`}>Full Name</h3>
                          <p className={`text-sm ${midBrown}`}>{students.find(s => s.id === selectedStudent)?.name}</p>
                        </div>
                        <div>
                          <h3 className={`font-medium ${deepBrown}`}>Email</h3>
                          <p className={`text-sm ${midBrown}`}>{students.find(s => s.id === selectedStudent)?.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className={`font-medium ${deepBrown}`}>Country</h3>
                          <p className={`text-sm ${midBrown}`}>{students.find(s => s.id === selectedStudent)?.country}</p>
                        </div>
                         <div>
                          <h3 className={`font-medium ${deepBrown}`}>Church Affiliation</h3>
                          <p className={`text-sm ${midBrown}`}>{students.find(s => s.id === selectedStudent)?.church}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className={`font-medium ${deepBrown}`}>Current Course</h3>
                          <p className={`text-sm ${midBrown}`}>{students.find(s => s.id === selectedStudent)?.course}</p>
                        </div>
                        <div>
                          <h3 className={`font-medium ${deepBrown}`}>Enrollment Date</h3>
                          <p className={`text-sm ${midBrown}`}>{students.find(s => s.id === selectedStudent)?.enrollmentDate}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className={`font-medium ${deepBrown}`}>Progress</h3>
                          <div className="flex items-center gap-2 mt-1">
                              <Progress value={students.find(s => s.id === selectedStudent)?.progress} className={`h-1.5 w-24 [&>div]:bg-[${accentColor}]`} />
                            <span className={`text-xs font-medium ${midBrown}`}>{students.find(s => s.id === selectedStudent)?.progress}%</span>
                          </div>
                        </div>
                        <div>
                          <h3 className={`font-medium ${deepBrown}`}>Status</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusBadgeClasses(students.find(s => s.id === selectedStudent)?.status ?? '')}`}>
                                {(students.find(s => s.id === selectedStudent)?.status ?? '').charAt(0).toUpperCase() + (students.find(s => s.id === selectedStudent)?.status ?? '').slice(1)}
                           </span>
                        </div>
                      </div>
                      <div>
                        <h3 className={`font-medium ${deepBrown}`}>Last Active</h3>
                        <p className={`text-sm ${midBrown}`}>{students.find(s => s.id === selectedStudent)?.lastActive}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" className={outlineButtonClasses} onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button className={primaryButtonClasses}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button className={primaryButtonClasses} onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Student
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex gap-2 w-full md:w-auto">
                <Select defaultValue="all">
                  <SelectTrigger className={`w-[250px] ${selectTriggerClasses}`}>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent className={selectContentClasses}>
                    <SelectItem value="all">All Courses</SelectItem>
                    <SelectItem value="foundations">Foundations of the Christian Faith</SelectItem>
                    <SelectItem value="bible">The Bible: God's Word</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className={outlineButtonClasses}>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>

            <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
              <CardHeader>
                <CardTitle className={deepBrown}>Student Progress Overview</CardTitle>
                <CardDescription className={midBrown}>Track student progress across selected courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {students.map((student) => (
                    <div key={student.id} className={`flex flex-col space-y-2 border-b pb-4 last:border-b-0 ${tableRowBorder}`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${goldAccentBgLight}`}>
                            <UserCircle className={`h-5 w-5 ${goldAccent}`} />
                          </div>
                          <div>
                            <p className={`font-medium ${deepBrown}`}>{student.name}</p>
                            <p className={`text-xs ${mutedText}`}>{student.course}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`text-sm ${midBrown}`}>
                            {student.progress}% Complete
                          </div>
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(student.status)}`}>
                                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                           </span>
                        </div>
                      </div>
                      <Progress value={student.progress} className={`h-2 [&>div]:bg-[${accentColor}]`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
                <CardHeader>
                  <CardTitle className={deepBrown}>Course Completion Rate</CardTitle>
                  <CardDescription className={midBrown}>Percentage of students completing each module</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className={`text-sm font-medium ${deepBrown}`}>Week 1: The Nature & Attributes of God</span>
                        <span className={`text-sm font-medium ${midBrown}`}>100%</span>
                      </div>
                      <Progress value={100} className={`h-2 [&>div]:bg-[${accentColor}]`} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className={`text-sm font-medium ${deepBrown}`}>Week 2: The Person & Work of Jesus Christ</span>
                        <span className={`text-sm font-medium ${midBrown}`}>95%</span>
                      </div>
                      <Progress value={95} className={`h-2 [&>div]:bg-[${accentColor}]`} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className={`text-sm font-medium ${deepBrown}`}>Week 3: The Holy Spirit & Spiritual Birth</span>
                        <span className={`text-sm font-medium ${midBrown}`}>80%</span>
                      </div>
                      <Progress value={80} className={`h-2 [&>div]:bg-[${accentColor}]`} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className={`text-sm font-medium ${deepBrown}`}>Week 4: Salvation & the New Life</span>
                        <span className={`text-sm font-medium ${midBrown}`}>65%</span>
                      </div>
                      <Progress value={65} className={`h-2 [&>div]:bg-[${accentColor}]`} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
                <CardHeader>
                  <CardTitle className={deepBrown}>At-Risk Students</CardTitle>
                  <CardDescription className={midBrown}>Students who may need additional support</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {students.filter(s => s.status === "at-risk").map((student) => (
                      <div key={student.id} className={`flex items-center justify-between p-3 rounded-lg border ${inputBorder}`}>
                        <div className="flex items-center gap-3">
                           <div className={`rounded-full h-8 w-8 flex items-center justify-center ${goldAccentBgLight}`}>
                             <UserCircle className={`h-5 w-5 ${goldAccent}`} />
                           </div>
                          <div>
                            <p className={`font-medium ${deepBrown}`}>{student.name}</p>
                            <p className={`text-xs ${mutedText}`}>Last active: {student.lastActive}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`text-sm font-medium ${warningColor}`}>{student.progress}%</div>
                          <Button variant="outline" size="sm" className={outlineButtonClasses}>
                            Contact
                          </Button>
                        </div>
                      </div>
                    ))}
                    {students.filter(s => s.status === "at-risk").length === 0 && (
                        <p className={`text-sm text-center py-4 ${mutedText}`}>No students currently marked as at-risk.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="grades" className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex gap-2 w-full md:w-auto">
                <Select defaultValue="1">
                  <SelectTrigger className={`w-[250px] ${selectTriggerClasses}`}>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent className={selectContentClasses}>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id.toString()}>{student.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue="foundations">
                  <SelectTrigger className={`w-[250px] ${selectTriggerClasses}`}>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent className={selectContentClasses}>
                    <SelectItem value="foundations">Foundations of the Christian Faith</SelectItem>
                    <SelectItem value="bible">The Bible: God's Word</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className={outlineButtonClasses}>
                <Download className="mr-2 h-4 w-4" />
                Export Grades
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className={`md:col-span-2 ${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
                <CardHeader>
                  <CardTitle className={deepBrown}>Grade Book</CardTitle>
                  <CardDescription className={midBrown}>John Doe - Foundations of the Christian Faith</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className={tableHeaderBg}>
                        <tr className={tableRowBorder}>
                          <th className={tableHeaderClasses}>Assignment/Quiz</th>
                          <th className={tableHeaderClasses}>Type</th>
                          <th className={tableHeaderClasses}>Grade</th>
                          <th className={tableHeaderClasses}>Date</th>
                          <th className={`${tableHeaderClasses} text-right`}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${tableRowBorder}`}>
                        {studentGrades.map((grade) => (
                          <tr key={grade.id}>
                            <td className={`p-4 align-middle ${deepBrown}`}>{grade.assignment}</td>
                            <td className={tableCellClasses}>{grade.type}</td>
                            <td className={tableCellClasses}>
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${deepBrown}`}>{grade.grade}/{grade.maxGrade}</span>
                                <span className={`text-sm ${mutedText}`}>({Math.round(grade.grade / grade.maxGrade * 100)}%)</span>
                              </div>
                            </td>
                            <td className={tableCellClasses}>{grade.date}</td>
                            <td className={`${tableCellClasses} text-right`}>
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                         {studentGrades.length === 0 && (
                             <tr><td colSpan={5} className={`p-6 text-center ${mutedText}`}>No grades recorded for this selection.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
                <CardHeader>
                  <CardTitle className={deepBrown}>Grade Summary</CardTitle>
                  <CardDescription className={midBrown}>Overall performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className={`text-sm font-medium ${deepBrown}`}>Current Grade</span>
                        <span className={`text-sm font-medium ${midBrown}`}>85% (B)</span>
                      </div>
                      <Progress value={85} className={`h-2 [&>div]:bg-[${accentColor}]`} />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className={`text-sm font-medium mb-2 ${deepBrown}`}>Grade Breakdown</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className={`text-sm ${midBrown}`}>Quizzes</span>
                            <span className={`text-sm font-medium ${deepBrown}`}>89%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`text-sm ${midBrown}`}>Assignments</span>
                            <span className={`text-sm font-medium ${deepBrown}`}>83.5%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`text-sm ${midBrown}`}>Participation</span>
                            <span className={`text-sm font-medium ${deepBrown}`}>92.5%</span>
                          </div>
                        </div>
                      </div>

                      <div className={`pt-2 border-t ${tableRowBorder}`}>
                        <h3 className={`text-sm font-medium mb-2 ${deepBrown}`}>Feedback Summary</h3>
                        <p className={`text-sm ${mutedText}`}>
                          John demonstrates good understanding of core concepts. Written assignments could benefit from more scriptural references and deeper theological analysis.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex gap-2 w-full md:w-auto">
                <Select defaultValue="current">
                  <SelectTrigger className={`w-[250px] ${selectTriggerClasses}`}>
                    <SelectValue placeholder="Select cohort" />
                  </SelectTrigger>
                  <SelectContent className={selectContentClasses}>
                    <SelectItem value="current">Current Cohort (Jan 2025)</SelectItem>
                    <SelectItem value="previous">Previous Cohort (Jul 2024)</SelectItem>
                    <SelectItem value="all">All Cohorts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className={outlineButtonClasses}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Reports
                </Button>
                <Button className={primaryButtonClasses}>
                  <BarChart className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
                <CardHeader>
                  <CardTitle className={deepBrown}>Enrollment Statistics</CardTitle>
                  <CardDescription className={midBrown}>Current cohort enrollment data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg ${goldAccentBgLight}`}>
                        <h3 className={`text-sm font-medium ${mutedText}`}>Total Students</h3>
                        <p className={`text-3xl font-bold ${deepBrown}`}>124</p>
                        <p className={`text-xs mt-1 ${mutedText}`}>+12% from last cohort</p>
                      </div>
                      <div className={`p-4 rounded-lg ${goldAccentBgLight}`}>
                        <h3 className={`text-sm font-medium ${mutedText}`}>Completion Rate</h3>
                        <p className={`text-3xl font-bold ${deepBrown}`}>78%</p>
                        <p className={`text-xs mt-1 ${mutedText}`}>+5% from last cohort</p>
                      </div>
                      <div className={`p-4 rounded-lg ${goldAccentBgLight}`}>
                        <h3 className={`text-sm font-medium ${mutedText}`}>Average Grade</h3>
                        <p className={`text-3xl font-bold ${deepBrown}`}>82%</p>
                        <p className={`text-xs mt-1 ${mutedText}`}>+2% from last cohort</p>
                      </div>
                      <div className={`p-4 rounded-lg ${goldAccentBgLight}`}>
                        <h3 className={`text-sm font-medium ${mutedText}`}>At-Risk Students</h3>
                        <p className={`text-3xl font-bold ${deepBrown}`}>15</p>
                        <p className={`text-xs mt-1 ${mutedText}`}>12% of total students</p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <h3 className={`text-sm font-medium mb-2 ${deepBrown}`}>Geographic Distribution</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={`text-sm ${midBrown}`}>United States</span>
                          <span className={`text-sm font-medium ${deepBrown}`}>32%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${midBrown}`}>Nigeria</span>
                          <span className={`text-sm font-medium ${deepBrown}`}>18%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${midBrown}`}>United Kingdom</span>
                          <span className={`text-sm font-medium ${deepBrown}`}>12%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${midBrown}`}>Canada</span>
                          <span className={`text-sm font-medium ${deepBrown}`}>10%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${midBrown}`}>Other</span>
                          <span className={`text-sm font-medium ${deepBrown}`}>28%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
                <CardHeader>
                  <CardTitle className={deepBrown}>Performance Metrics</CardTitle>
                  <CardDescription className={midBrown}>Course performance and engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className={`text-sm font-medium mb-2 ${deepBrown}`}>Course Completion Rates</h3>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className={`text-sm ${midBrown}`}>Foundations of the Christian Faith</span>
                            <span className={`text-sm font-medium ${deepBrown}`}>85%</span>
                          </div>
                          <Progress value={85} className={`h-2 [&>div]:bg-[${accentColor}]`} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className={`text-sm ${midBrown}`}>The Bible: God's Word</span>
                            <span className={`text-sm font-medium ${deepBrown}`}>78%</span>
                          </div>
                          <Progress value={78} className={`h-2 [&>div]:bg-[${accentColor}]`} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className={`text-sm ${midBrown}`}>Apostolic Doctrine</span>
                            <span className={`text-sm font-medium ${deepBrown}`}>72%</span>
                          </div>
                          <Progress value={72} className={`h-2 [&>div]:bg-[${accentColor}]`} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <h3 className={`text-sm font-medium mb-2 ${deepBrown}`}>Quiz Submission Rates</h3> {/* Renamed */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={`text-sm ${midBrown}`}>Quizzes</span>
                          <span className={`text-sm font-medium ${deepBrown}`}>92%</span>
                        </div>
                         {/* Removed Assignment/Discussion specifics if focusing on quizzes */}
                        {/* <div className="flex justify-between">
                          <span className={`text-sm ${midBrown}`}>Written Assignments</span>
                          <span className={`text-sm font-medium ${deepBrown}`}>85%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${midBrown}`}>Discussion Participation</span>
                          <span className={`text-sm font-medium ${deepBrown}`}>78%</span>
                        </div> */}
                         <div className="flex justify-between">
                          <span className={`text-sm ${midBrown}`}>Final Projects</span>
                          <span className={`text-sm font-medium ${deepBrown}`}>90%</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <h3 className={`text-sm font-medium mb-2 ${deepBrown}`}>Student Engagement</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={`text-sm ${midBrown}`}>Average Weekly Logins</span>
                          <span className={`text-sm font-medium ${deepBrown}`}>4.2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${midBrown}`}>Average Time Spent</span>
                          <span className={`text-sm font-medium ${deepBrown}`}>5.8 hours/week</span>
                        </div>
                        {/* <div className="flex justify-between">
                          <span className={`text-sm ${midBrown}`}>Discussion Posts</span>
                          <span className={`text-sm font-medium ${deepBrown}`}>3.5/student/week</span>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}