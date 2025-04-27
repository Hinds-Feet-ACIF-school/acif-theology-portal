// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "../../components/ui/button";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
// import { Input } from "../../components/ui/input";
// import { Textarea } from "../../components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
// import { Label } from "../../components/ui/label";
// import {
//   FileText,
//   PlusCircle,
//   Search,
//   Edit,
//   Eye,
//   Trash2,
//   ArrowLeft,
//   Save,
//   ChevronLeft,
//   Download,
//   Loader2,
//   AlertCircle,
//   ExternalLink,
// } from "lucide-react";
// import * as apiService from "../../services/api";

// interface Assignment {
//   id: string;
//   weekId: string;
//   title: string;
//   description?: string;
//   instructions?: string;
//   type?: string;
//   points?: number;
//   dueDateOffsetDays?: number | null;
//   order?: number;
//   createdBy?: string;
//   createdAt?: any;
//   updatedAt?: any;
//   weekNumber?: number;
//   courseTitle?: string;
//   courseId?: string;
// }

// interface Submission {
//     id: string;
//     assignmentId: string;
//     userId: string;
//     userName?: string;
//     submittedAt: any;
//     status: 'submitted' | 'graded' | 'pending';
//     grade?: number | null;
//     assignmentTitle?: string;
// }

// const lightBg = 'bg-[#FFF8F0]';
// const darkBg = 'dark:bg-gray-950';
// const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
// const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
// const goldAccent = 'text-[#C5A467]';
// const goldBg = 'bg-[#C5A467]';
// const goldBgHover = 'hover:bg-[#B08F55]';
// const goldBorder = 'border-[#C5A467]';
// const lightCardBg = 'bg-white';
// const darkCardBg = 'dark:bg-gray-900';
// const goldAccentBgLight = 'bg-[#C5A467]/10 dark:bg-[#C5A467]/15';
// const mutedText = 'text-gray-600 dark:text-gray-400';
// const inputBorder = 'border-gray-300 dark:border-gray-700';
// const focusRing = 'focus:ring-1 focus:ring-offset-0 focus:ring-[#C5A467]';
// const tableHeaderBg = 'bg-gray-50 dark:bg-gray-800/50';
// const tableRowBorder = 'border-b border-gray-200 dark:border-gray-700';
// const tableHeaderClasses = `h-12 px-4 text-left align-middle font-medium text-xs uppercase ${mutedText}`;
// const tableCellClasses = `p-4 align-middle ${midBrown}`;
// const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`;
// const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
// const ghostButtonClasses = `${midBrown} hover:bg-gray-100 dark:hover:bg-gray-700/50`;
// const linkClasses = `${goldAccent} hover:underline`;
// const tabsListBg = 'bg-gray-100/50 dark:bg-gray-800/50';
// const tabsTriggerClasses = `${midBrown} data-[state=active]:${deepBrown} data-[state=active]:${lightCardBg} dark:data-[state=active]:${darkCardBg} data-[state=active]:shadow-sm`;
// const inputClasses = `h-9 rounded-md px-3 text-sm ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing} placeholder:text-gray-400 dark:placeholder:text-gray-500`;
// const selectTriggerClasses = `h-9 rounded-md px-3 text-sm w-full md:w-[180px] ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing}`;
// const selectContentClasses = `border ${inputBorder} ${lightCardBg} ${darkCardBg} ${deepBrown}`;
// const positiveColor = "text-green-600 dark:text-green-400";
// const positiveBg = "bg-green-100 dark:bg-green-900/30";
// const warningColor = "text-yellow-700 dark:text-yellow-400";
// const warningBg = "bg-yellow-100 dark:bg-yellow-900/30";


// export default function AdminAssignmentManagementPage() {
//   const [activeTab, setActiveTab] = useState("assignments");
//   const [assignments, setAssignments] = useState<Assignment[]>([]);
//   const [submissions, setSubmissions] = useState<Submission[]>([]);
//   const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
//   const [isEditing, setIsEditing] = useState(false);

//   const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
//   const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//    const [filterCourseId, setFilterCourseId] = useState<string>('all');
//    const [filterWeekId, setFilterWeekId] = useState<string>('all');

//   useEffect(() => {
//     fetchAllAssignments();
//     fetchSubmissionsToGrade();
//   }, []);

//   const fetchAllAssignments = async () => {
//     setIsLoadingAssignments(true);
//     setError(null);
//     try {
//       console.warn("Fetching all assignments without context - Needs backend endpoint");
//       await new Promise(resolve => setTimeout(resolve, 300));
//       const mockAssignments: Assignment[] = [
//          {id: 'assign1', weekId: 'wk_crs1-3', title: 'Reflection: Holy Spirit Experience', type: 'Reflection', points: 50, dueDateOffsetDays: 7, courseTitle: 'Foundations...', weekNumber: 3 },
//          {id: 'assign2', weekId: 'wk_crs1-4', title: 'Final Essay: Salvation', type: 'Essay', points: 100, dueDateOffsetDays: 10, courseTitle: 'Foundations...', weekNumber: 4 },
//       ];
//       setAssignments(mockAssignments);

//     } catch (err: any) {
//       setError(err.message || "Failed to fetch assignments");
//       console.error(err);
//     } finally {
//       setIsLoadingAssignments(false);
//     }
//   };

//   const fetchSubmissionsToGrade = async () => {
//     setIsLoadingSubmissions(true);
//     setError(null);
//     try {
//       console.warn("Fetching submissions to grade - Needs backend endpoint");
//       await new Promise(resolve => setTimeout(resolve, 400));
//        const mockSubmissions: Submission[] = [
//          {id: 'sub1', assignmentId: 'assign1', userId: 'user123', userName: 'John Doe', submittedAt: new Date(), status: 'submitted', assignmentTitle: 'Reflection: Holy Spirit Experience'},
//          {id: 'sub2', assignmentId: 'assign1', userId: 'user456', userName: 'Jane Smith', submittedAt: new Date(), status: 'submitted', assignmentTitle: 'Reflection: Holy Spirit Experience'},
//       ];
//       setSubmissions(mockSubmissions);
//     } catch (err: any) {
//       setError(err.message || "Failed to fetch submissions");
//       console.error(err);
//     } finally {
//       setIsLoadingSubmissions(false);
//     }
//   };

//   const handleEditAssignment = (assignment: Assignment) => {
//     setSelectedAssignment(assignment);
//     setIsEditing(true);
//     console.log("TODO: Open Edit Assignment Modal for", assignment.id);
//   };

//   const handleViewAssignment = (assignment: Assignment) => {
//      setSelectedAssignment(assignment);
//      setIsEditing(false);
//      console.log("TODO: Open View Assignment Modal for", assignment.id);
//   };

//   const handleDeleteAssignment = async (assignmentId: string, assignmentTitle: string) => {
//     if (window.confirm(`Are you sure you want to delete assignment "${assignmentTitle}" and all its submissions?`)) {
//        setError(null);
//        try {
//           await apiService.deleteAssignment(assignmentId);
//           fetchAllAssignments();
//           if (selectedAssignment?.id === assignmentId) {
//              setSelectedAssignment(null);
//           }
//        } catch (err: any) {
//           setError(err.message || "Failed to delete assignment");
//           console.error(err);
//        }
//     }
//   };

//   const handleGradeSubmission = (submission: Submission) => {
//       console.log("TODO: Open Grade Submission Modal for", submission.id);
//   }

//   const renderAssignmentDetails = () => {
//     if (!selectedAssignment) return null;
//     const assignment = selectedAssignment;

//     return (
//       <Card className={`mt-6 ${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
//         <CardHeader className="flex flex-row items-start justify-between">
//           <div>
//             <CardTitle className={deepBrown}>{isEditing ? "Edit Assignment" : "Assignment Details"}</CardTitle>
//             <CardDescription className={midBrown}>
//               {isEditing ? "Modify assignment information" : `Details for: ${assignment.title}`}
//             </CardDescription>
//           </div>
//           <Button variant="ghost" size="icon" className={ghostButtonClasses} onClick={() => { setSelectedAssignment(null); setIsEditing(false); }}>
//             <ChevronLeft className="h-4 w-4" />
//           </Button>
//         </CardHeader>
//         <CardContent>
//           {isEditing ? (
//             <div className={`text-center py-6 ${mutedText}`}>Edit form not implemented yet.</div>
//           ) : (
//             <div className="space-y-4">
//                 <p><strong className={`font-medium ${deepBrown}`}>Title:</strong> <span className={midBrown}>{assignment.title}</span></p>
//                 <p><strong className={`font-medium ${deepBrown}`}>Type:</strong> <span className={midBrown}>{assignment.type || 'N/A'}</span></p>
//                 <p><strong className={`font-medium ${deepBrown}`}>Week ID:</strong> <span className={midBrown}>{assignment.weekId}</span></p>
//                 <p><strong className={`font-medium ${deepBrown}`}>Points:</strong> <span className={midBrown}>{assignment.points ?? 'N/A'}</span></p>
//                 <p><strong className={`font-medium ${deepBrown}`}>Due Date Offset:</strong> <span className={midBrown}>{assignment.dueDateOffsetDays !== null ? `+${assignment.dueDateOffsetDays} days after week start` : 'No specific offset'}</span></p>
//                 <div><strong className={`font-medium ${deepBrown}`}>Description:</strong> <p className={`text-sm mt-1 ${midBrown}`}>{assignment.description || 'N/A'}</p></div>
//                 <div><strong className={`font-medium ${deepBrown}`}>Instructions:</strong> <p className={`text-sm mt-1 whitespace-pre-line ${midBrown}`}>{assignment.instructions || 'N/A'}</p></div>
//             </div>
//           )}
//         </CardContent>
//         <CardFooter className="flex justify-end gap-2">
//           {isEditing ? (
//             <>
//               <Button variant="outline" className={outlineButtonClasses} onClick={() => setIsEditing(false)}>Cancel</Button>
//               <Button className={primaryButtonClasses}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
//             </>
//           ) : (
//             <>
//               <Button variant="outline" className={outlineButtonClasses}><Eye className="mr-2 h-4 w-4" /> View Submissions</Button>
//               <Button className={primaryButtonClasses} onClick={() => setIsEditing(true)}>
//                 <Edit className="mr-2 h-4 w-4" /> Edit Assignment
//               </Button>
//             </>
//           )}
//         </CardFooter>
//       </Card>
//     );
//   };


//   return (
//     <div className={`flex flex-col min-h-screen ${lightBg} ${darkBg}`}>
//       <div className="container px-4 py-8 md:px-6">
//         <div className="flex items-center gap-2 mb-6">
//           <Link to="/admin" className={`flex items-center ${linkClasses}`}>
//             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin Dashboard
//           </Link>
//         </div>
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//           <div>
//             <h1 className={`text-3xl font-bold tracking-tight ${deepBrown}`}>Assignment Management</h1>
//             <p className={midBrown}>Manage assignments and review submissions.</p>
//           </div>
//           <Button className={primaryButtonClasses} >
//             <PlusCircle className="mr-2 h-4 w-4" /> Create New Assignment
//           </Button>
//         </div>

//         {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded flex items-center gap-2"><AlertCircle className="h-5 w-5"/> {error}</div>}


//         <Tabs defaultValue="assignments" className="space-y-8" onValueChange={setActiveTab}>
//           <TabsList className={`rounded-md p-1 ${tabsListBg}`}>
//             <TabsTrigger value="assignments" className={tabsTriggerClasses}>All Assignments</TabsTrigger>
//             <TabsTrigger value="grading" className={tabsTriggerClasses}>Grading</TabsTrigger>
//           </TabsList>

//           <TabsContent value="assignments" className="space-y-6">
//             <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
//                 <CardHeader>
//                     <CardTitle className={deepBrown}>Assignment List</CardTitle>
//                     <CardDescription className={midBrown}>View and manage all created assignments.</CardDescription>
//                 </CardHeader>
//               <CardContent className="p-0">
//                  {isLoadingAssignments ? (
//                     <div className={`flex justify-center items-center p-10 ${midBrown}`}><Loader2 className={`h-8 w-8 animate-spin ${goldAccent}`}/></div>
//                  ) : !assignments || assignments.length === 0 ? (
//                     <div className={`p-6 text-center ${mutedText}`}>No assignments found.</div>
//                  ) : (
//                     <div className="relative w-full overflow-auto">
//                     <table className="w-full caption-bottom text-sm">
//                         <thead className={tableHeaderBg}>
//                         <tr className={tableRowBorder}>
//                             <th className={tableHeaderClasses}>Title</th>
//                             <th className={tableHeaderClasses}>Course / Week</th>
//                             <th className={tableHeaderClasses}>Type</th>
//                             <th className={tableHeaderClasses}>Due Offset</th>
//                             <th className={`${tableHeaderClasses} text-right`}>Actions</th>
//                         </tr>
//                         </thead>
//                         <tbody className={`divide-y ${tableRowBorder}`}>
//                         {assignments.map((assignment) => (
//                             <tr key={assignment.id}>
//                             <td className={`p-4 align-middle font-medium ${deepBrown}`}>{assignment.title}</td>
//                             <td className={`${tableCellClasses} text-xs`}>{assignment.courseTitle ? `${assignment.courseTitle} / Wk ${assignment.weekNumber}` : assignment.weekId}</td>
//                             <td className={tableCellClasses}>{assignment.type || 'N/A'}</td>
//                             <td className={tableCellClasses}>{assignment.dueDateOffsetDays !== null ? `+${assignment.dueDateOffsetDays}d` : '-'}</td>
//                             <td className={`${tableCellClasses} text-right`}>
//                                 <div className="flex items-center justify-end gap-1">
//                                 <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`} onClick={() => handleViewAssignment(assignment)} aria-label={`View ${assignment.title}`}>
//                                     <Eye className="h-4 w-4" />
//                                 </Button>
//                                 <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`} onClick={() => handleEditAssignment(assignment)} aria-label={`Edit ${assignment.title}`}>
//                                     <Edit className="h-4 w-4" />
//                                 </Button>
//                                 <Button variant="ghost" size="icon" className={`${ghostButtonClasses} hover:text-red-600 h-8 w-8`} onClick={() => handleDeleteAssignment(assignment.id, assignment.title)} aria-label={`Delete ${assignment.title}`}>
//                                     <Trash2 className="h-4 w-4" />
//                                 </Button>
//                                 </div>
//                             </td>
//                             </tr>
//                         ))}
//                         </tbody>
//                     </table>
//                     </div>
//                  )}
//               </CardContent>
//             </Card>

//             {selectedAssignment && renderAssignmentDetails()}
//           </TabsContent>

//           <TabsContent value="grading" className="space-y-6">
//             <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
//               <CardHeader>
//                 <CardTitle className={deepBrown}>Submissions to Grade</CardTitle>
//                 <CardDescription className={midBrown}>Review and grade student submissions.</CardDescription>
//               </CardHeader>
//               <CardContent className="p-0">
//                  {isLoadingSubmissions ? (
//                     <div className={`flex justify-center items-center p-10 ${midBrown}`}><Loader2 className={`h-8 w-8 animate-spin ${goldAccent}`}/></div>
//                  ) : !submissions || submissions.length === 0 ? (
//                     <div className={`p-6 text-center ${mutedText}`}>No submissions currently awaiting grading.</div>
//                  ) : (
//                     <div className="relative w-full overflow-auto">
//                     <table className="w-full caption-bottom text-sm">
//                         <thead className={tableHeaderBg}>
//                         <tr className={tableRowBorder}>
//                             <th className={tableHeaderClasses}>Student</th>
//                             <th className={tableHeaderClasses}>Assignment</th>
//                             <th className={tableHeaderClasses}>Submitted Date</th>
//                             <th className={tableHeaderClasses}>Status</th>
//                             <th className={`${tableHeaderClasses} text-right`}>Actions</th>
//                         </tr>
//                         </thead>
//                         <tbody className={`divide-y ${tableRowBorder}`}>
//                         {submissions.map((sub) => (
//                             <tr key={sub.id}>
//                             <td className={`p-4 align-middle ${deepBrown}`}>{sub.userName || sub.userId}</td>
//                             <td className={tableCellClasses}>{sub.assignmentTitle || sub.assignmentId}</td>
//                             <td className={tableCellClasses}>{sub.submittedAt ? new Date(sub.submittedAt.seconds * 1000).toLocaleString() : 'N/A'}</td>
//                             <td className={tableCellClasses}>
//                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sub.status === 'graded' ? positiveBg + ' ' + positiveColor : warningBg + ' ' + warningColor}`}>
//                                 {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
//                                 </span>
//                             </td>
//                             <td className={`${tableCellClasses} text-right`}>
//                                 <Button variant="outline" size="sm" className={outlineButtonClasses} onClick={() => handleGradeSubmission(sub)} aria-label={`Grade submission by ${sub.userName || sub.userId}`}>
//                                 {sub.status === 'graded' ? <><Eye className="mr-1 h-4 w-4" /> View/Edit Grade</> : <><Edit className="mr-1 h-4 w-4" /> Grade</>}
//                                 </Button>
//                             </td>
//                             </tr>
//                         ))}
//                         </tbody>
//                     </table>
//                     </div>
//                  )}
//               </CardContent>
//             </Card>
//           </TabsContent>

//         </Tabs>
//       </div>

//     </div>
//   );
// }