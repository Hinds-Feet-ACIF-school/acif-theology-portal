import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as XLSX from 'xlsx'; // Import xlsx
import { Button } from "../../components/ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.js";
import { Input } from "../../components/ui/input.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select.js";
import { Label } from "../../components/ui/label.js";
import { Progress } from "../../components/ui/progress.js";
import { Users, PlusCircle, Search, Edit, Eye, Trash2, ArrowLeft, Mail, Save, ChevronLeft, UserCircle, FileText, BarChart, UserPlus, Download, HelpCircle, Loader2, AlertCircle, X } from 'lucide-react';
import * as apiService from "../../services/api"; // Assuming you have this service file
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import StudentDetailsModal from "../../components/modals/StudentDetailsModal";
import AddUserModal from "../../components/modals/AddUserModal"; 

// --- Interfaces ---
export interface AdminManagedUser {
    uid: string;
    id?: string; // Firestore doc ID if different from UID
    email?: string | null;
    displayName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role?: 'student' | 'instructor' | 'admin'; // Ensure 'admin' is possible
    country?: string | null;
    church?: string | null;
    enrollment?: { cohortId: string; enrollmentDate: string | Date; cohortName?: string; cohortStartDate?: string | Date } | null;
    createdAt?: string | Date | null;
    disabled?: boolean;
}

interface StudentGradeInfo { /* ... keep as is ... */ }
// --- End Interfaces ---

// --- Theme Constants (keep as is) ---
/* ... your theme constants ... */
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

const tabsTriggerBaseClasses = `px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}] dark:focus-visible:ring-offset-gray-950`;
const tabsTriggerInactiveClasses = `text-[#4A1F1F] dark:text-[#E0D6C3]/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white`;
const tabsTriggerActiveClasses = `shadow-sm ${goldBg} dark:${goldBg} text-[#2A0F0F] dark:text-[#2A0F0F] font-semibold`;
const tabsTriggerDisabledClasses = `opacity-50 cursor-not-allowed`;
const positiveColor = "text-green-600 dark:text-green-400";
const positiveBg = "bg-green-100 dark:bg-green-900/30";
const warningColor = "text-yellow-700 dark:text-yellow-400";
const warningBg = "bg-yellow-100 dark:bg-yellow-900/30";
const inactiveColor = mutedText;
const inactiveBg = "bg-gray-100 dark:bg-gray-700/30";
// --- End Theme Constants ---

export default function AdminStudentManagementPage() {
    const [activeTab, setActiveTab] = useState("users"); // Default tab
    const [allUsersData, setAllUsersData] = useState<AdminManagedUser[]>([]); // Holds ALL users
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<AdminManagedUser | null>(null); // User for details modal
    const [showDetailsModal, setShowDetailsModal] = useState(false); // State to control details modal
    const [userSearch, setUserSearch] = useState("");
    const [userRoleFilter, setUserRoleFilter] = useState("all"); // Default to 'all'
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<AdminManagedUser | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false); // State for Add User Modal

    // --- Fetch Users Data ---
    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetches ALL users (students, admins, etc.)
            const users = await apiService.getAllUsersForAdmin();
            setAllUsersData(users); // Store all fetched users
        } catch (err: any) {
            console.error("Failed to fetch users:", err);
            setError(err.message || "Could not load user data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    // --- End Fetch Users Data ---

    // --- Filtering Logic ---
    const filteredUsers = allUsersData.filter(user => {
        const searchMatch = (
            user.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.firstName?.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(userSearch.toLowerCase())
        );
        const roleMatch = userRoleFilter === "all" || user.role === userRoleFilter;
        return searchMatch && roleMatch;
    });
    // --- End Filtering Logic ---


    // --- Status Badge Logic (Unchanged, applies to any user type) ---
    const getUserStatus = (user: AdminManagedUser): { text: string; classes: string } => {
        if (user.disabled) {
            return { text: 'Disabled', classes: `${inactiveBg} ${inactiveColor}` };
        }
        // Adjust logic if needed based on how status is determined for non-students
        if (user.role === 'student' && user.enrollment) {
            return { text: 'Active (Enrolled)', classes: `${positiveBg} ${positiveColor}` };
        }
        if (user.role === 'admin') {
            return { text: 'Active (Admin)', classes: `${positiveBg} ${positiveColor}` };
        }
        return { text: 'Active', classes: `${inactiveBg} ${inactiveColor}` }; // Default active status
    };
    // ---

    // --- Handlers ---
    const handleViewDetails = (user: AdminManagedUser) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    const handleDeleteRequest = (user: AdminManagedUser) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        setError(null); // Clear previous errors
        try {
            await apiService.deleteUserAdmin(userToDelete.uid);
            setShowDeleteModal(false);
            setUserToDelete(null);
            if (selectedUser?.uid === userToDelete.uid) {
                setSelectedUser(null);
                setShowDetailsModal(false);
            }
            await fetchUsers(); // Refresh the list
        } catch (err: any) {
            console.error("Failed to delete user:", err);
            setError(err.message || "Could not delete user.");
            // Keep modal open on error
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAddUserSuccess = () => {
        setShowAddUserModal(false);
        fetchUsers(); // Refresh user list after adding
        // Optionally show a success toast/message here
    };

    // --- Export Handler ---
    const handleExport = () => {
        console.log("Exporting data for:", filteredUsers.length, "users");
        if (filteredUsers.length === 0) {
            alert("No data to export."); // Or use a toast notification
            return;
        }

        // 1. Prepare data for the sheet
        const dataToExport = filteredUsers.map(user => ({
            "Name": user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
            "Email": user.email || 'N/A',
            "Role": user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A', // Capitalize role
            "Country": user.country || 'N/A',
            "Church": user.church || 'N/A',
            "Enrollment Date": user.role === 'student' && user.enrollment?.enrollmentDate
                ? new Date(user.enrollment.enrollmentDate).toLocaleDateString()
                : 'N/A',
            "Status": getUserStatus(user).text,
            "UID": user.uid // Include UID for reference if needed
        }));

        try {
            // 2. Create worksheet
            const ws = XLSX.utils.json_to_sheet(dataToExport);

            // 3. Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Users"); // Sheet name "Users"

            // 4. Trigger download
            XLSX.writeFile(wb, "User_Management_Export.xlsx"); // File name

        } catch (error) {
            console.error("Error generating Excel file:", error);
            setError("Failed to export data to Excel.");
            // Optionally show an error toast/message
        }
    };
    // --- End Handlers ---


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
                        <h1 className={`text-3xl font-bold tracking-tight ${deepBrown}`}>User Management</h1>
                        <p className={midBrown}>Manage users, track progress, and view performance</p>
                    </div>
                    <Button className={primaryButtonClasses} onClick={() => setShowAddUserModal(true)}> {/* <-- Enable and attach handler */}
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add New User
                    </Button>
                </div>

                {isLoading && <div className="flex justify-center items-center p-10"><Loader2 className={`h-8 w-8 animate-spin ${goldAccent}`} /></div>}
                {error && !isLoading && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded flex items-center gap-2 text-sm"><AlertCircle className="h-5 w-5" /> {error} <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto p-1 h-auto text-red-700 hover:bg-red-200"><X size={16} /></Button></div>}


                <Tabs defaultValue="users" className="space-y-8" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className={`rounded-md p-1 ${tabsListBg} inline-flex`}>
                        <TabsTrigger value="users" className={`${tabsTriggerBaseClasses} ${activeTab === 'users' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses}`}>All Users</TabsTrigger> {/* <-- Changed text */}
                        <TabsTrigger value="progress" className={`${tabsTriggerBaseClasses} ${activeTab === 'progress' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses} ${tabsTriggerDisabledClasses}`} disabled>Progress Tracking (WIP)</TabsTrigger> {/* Optional: Disable WIP tabs */}
                        <TabsTrigger value="grades" className={`${tabsTriggerBaseClasses} ${activeTab === 'grades' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses} ${tabsTriggerDisabledClasses}`} disabled>Grades & Assessment (WIP)</TabsTrigger>
                        <TabsTrigger value="reports" className={`${tabsTriggerBaseClasses} ${activeTab === 'reports' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses} ${tabsTriggerDisabledClasses}`} disabled>Reports (WIP)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="space-y-6">
                        {/* Search and Filter row */}
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${mutedText}`} />
                                    <Input placeholder="Search by name or email..." className={`pl-8 ${inputClasses}`} value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                                </div>
                                {/* --- Updated Select for Role Filter --- */}
                                <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                                    <SelectTrigger className={selectTriggerClasses}>
                                        <SelectValue placeholder="Filter by role" />
                                    </SelectTrigger>
                                    <SelectContent className={selectContentClasses}>
                                        <SelectItem value="all">All Users</SelectItem>
                                        <SelectItem value="student">Students Only</SelectItem>
                                        <SelectItem value="admin">Admins Only</SelectItem>
                                        {/* Add other roles like 'instructor' if needed */}
                                    </SelectContent>
                                </Select>
                                {/* --- End Updated Select --- */}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className={outlineButtonClasses} onClick={handleExport}> {/* <-- Attach export handler */}
                                    <Download className="mr-2 h-4 w-4" /> Export to Excel
                                </Button>
                            </div>
                        </div>

                        {/* Users Table Card */}
                        <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder}`}>
                            <CardContent className="p-0">
                                {!isLoading && (
                                    <div className="relative w-full overflow-auto">
                                        <table className="w-full caption-bottom text-sm">
                                            <thead className={tableHeaderBg}>
                                                <tr className={tableRowBorder}>
                                                    <th className={tableHeaderClasses}>Name</th>
                                                    <th className={tableHeaderClasses}>Email</th>
                                                    <th className={tableHeaderClasses}>Role</th> {/* <-- Added Role Column */}
                                                    <th className={tableHeaderClasses}>Country</th>
                                                    <th className={tableHeaderClasses}>Enrollment Date</th>
                                                    <th className={tableHeaderClasses}>Status</th>
                                                    <th className={`${tableHeaderClasses} text-right`}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y ${tableRowBorder}`}>
                                                {filteredUsers.map((user) => {
                                                    const statusInfo = getUserStatus(user);
                                                    const enrollmentDateStr = user.role === 'student' && user.enrollment?.enrollmentDate
                                                        ? new Date(user.enrollment.enrollmentDate).toLocaleDateString()
                                                        : 'N/A';

                                                    return (
                                                        <tr key={user.uid} className={`hover:${lightCardBg} dark:hover:${darkCardBg}`}>
                                                            <td className={`p-4 align-middle font-medium ${deepBrown}`}>{user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}</td>
                                                            <td className={tableCellClasses}>{user.email || 'N/A'}</td>
                                                            <td className={tableCellClasses}>{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}</td> {/* <-- Display Role */}
                                                            <td className={tableCellClasses}>{user.country || 'N/A'}</td>
                                                            <td className={tableCellClasses}>{enrollmentDateStr}</td>
                                                            <td className={tableCellClasses}>
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.classes}`}>
                                                                    {statusInfo.text}
                                                                </span>
                                                            </td>
                                                            <td className={`${tableCellClasses} text-right`}>
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`} onClick={() => handleViewDetails(user)}>
                                                                        <span className="sr-only">View User</span>
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                    {/* You might want an Edit button here eventually */}
                                                                    {/* <Button variant="ghost" size="icon" className={`${ghostButtonClasses} h-8 w-8`} onClick={() => handleEditRequest(user)}>
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button> */}
                                                                    <Button variant="ghost" size="icon" className={`${ghostButtonClasses} hover:text-red-600 h-8 w-8`} onClick={() => handleDeleteRequest(user)}>
                                                                        <span className="sr-only">Delete User</span>
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {filteredUsers.length === 0 && !isLoading && (
                                                    <tr><td colSpan={7} className={`p-6 text-center ${mutedText}`}>No users found matching your criteria.</td></tr> // Adjusted colspan
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Other Tabs Content (Placeholder) */}
                    <TabsContent value="progress"> <p className={mutedText}>Progress Tracking Feature - Coming Soon.</p> </TabsContent>
                    <TabsContent value="grades">   <p className={mutedText}>Grades & Assessment Feature - Coming Soon.</p> </TabsContent>
                    <TabsContent value="reports">  <p className={mutedText}>Reports Feature - Coming Soon.</p> </TabsContent>
                </Tabs>
            </div>

            {/* --- Modals --- */}
            {/* Student/User Details Modal (use existing, maybe rename if needed) */}
            <StudentDetailsModal
                isOpen={showDetailsModal}
                onClose={() => { setShowDetailsModal(false); setSelectedUser(null); }}
                student={selectedUser} // Prop name kept as 'student' for now, but it receives a 'user'
            />

            {/* Add User Modal */}
            <AddUserModal
                isOpen={showAddUserModal}
                onClose={() => setShowAddUserModal(false)}
                onSuccess={handleAddUserSuccess} // Pass success handler to refresh list
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title="Confirm User Deletion"
                message={
                    <>
                        Are you sure you want to delete the user: <strong className={deepBrown}>"{userToDelete?.displayName}"</strong> ({userToDelete?.email})?
                        <br /><br />
                        <span className="font-semibold text-red-600 dark:text-red-400">This action cannot be undone. The user's authentication record and profile data will be permanently removed.</span>
                    </>
                }
                confirmText="Delete User"
                confirmVariant="destructive"
                isConfirming={isDeleting}
            />
        </div>
    );
}