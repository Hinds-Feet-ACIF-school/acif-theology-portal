// src/pages/AdminCourseManagementPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Section } from '../types/courseTypes'; // Ensure this path is correct
import SectionPreviewModal from '../components/modals/SectionPreviewModal'; // Ensure this path is correct

// Define your style constants for this page
const lightBg = "bg-gray-50"; // Example: Light gray background for light mode
const darkBg = "dark:bg-gray-900"; // Example: Dark background for dark mode
// Add other theme-specific text/border colors if needed for this page
const primaryTextLight = "text-gray-800";
const primaryTextDark = "dark:text-white";


// Dummy data for demonstration - replace with your actual data fetching and state
const dummySections: Section[] = [
    { 
        id: "sec1", 
        title: "Introduction to Theology", 
        order: 1, 
        weekId: "week1", 
        description: "An overview of theological studies.", 
        textContent: "<p>This is <strong>rich text</strong> content.</p>",
        content: [] // Added required content property
    },
    { 
        id: "sec2", 
        title: "The Nature of God", 
        order: 2, 
        weekId: "week1", 
        description: "Exploring divine attributes.", 
        contentUrl: "https://example.com/nature-of-god",
        content: [] // Added required content property
    },
    { 
        id: "sec3", 
        title: "Scriptural Interpretation", 
        order: 1, 
        weekId: "week2", 
        description: "Hermeneutics and biblical exegesis.",
        materials: [
            {id: "mat1", title: "Video on Hermeneutics", type: "video", url: "https://youtube.com/embed/somevideo"},
            {id: "mat2", title: "Reading: Chapter 1", type: "reading"},
        ],
        content: [] // Added required content property
    },
];

export default function AdminCourseManagementPage() {
    const [showSectionPreviewModal, setShowSectionPreviewModal] = useState(false);
    const [sectionToPreview, setSectionToPreview] = useState<Section | null>(null);

    // You would likely have state for courses, weeks, and sections fetched from your API
    // For example:
    // const [courses, setCourses] = useState<Course[]>([]);
    // const [isLoading, setIsLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);

    // useEffect(() => {
    //   // Fetch your courses and their sections here
    //   const fetchAdminCourseData = async () => {
    //     try {
    //       // const data = await apiService.getAllCoursesWithDetailsForAdmin();
    //       // setCourses(data);
    //     } catch (err) {
    //       // setError(err.message);
    //     } finally {
    //       // setIsLoading(false);
    //     }
    //   };
    //   fetchAdminCourseData();
    // }, []);


    // Memoize the section object passed to the modal if sectionToPreview changes.
    // This can help prevent unnecessary re-renders of the modal if its props are complex
    // and it's not already memoized internally.
    const memoizedSectionToPreview = useMemo(() => {
        // console.log("[AdminPage] Memoizing sectionToPreview. Current value:", sectionToPreview ? sectionToPreview.id : 'null');
        return sectionToPreview;
    }, [sectionToPreview]); // Dependency: only re-memoize if sectionToPreview itself changes reference

    const openSectionPreview = useCallback((section: Section) => {
        // console.log("[AdminPage] Opening section preview for:", section.id);
        setSectionToPreview(section); // Set the section data
        setShowSectionPreviewModal(true); // Open the modal
    }, []); // No dependencies needed as setState functions from useState are stable

    const handleCloseSectionPreviewModal = useCallback(() => {
        // console.log("[AdminPage] Closing section preview modal.");
        setShowSectionPreviewModal(false); // Close the modal
        setSectionToPreview(null); // Clear the section data. Important for memoizedSectionToPreview to update if same section is clicked again.
    }, []); // Empty dependency array: this function's reference will not change

    // if (isLoading) return <div className={`p-6 ${lightBg} ${darkBg} min-h-screen text-center ${primaryTextLight} ${primaryTextDark}`}>Loading course data...</div>;
    // if (error) return <div className={`p-6 ${lightBg} ${darkBg} min-h-screen text-center text-red-500`}>Error: {error}</div>;

    return (
        <div className={`p-4 md:p-6 lg:p-8 ${lightBg} ${darkBg} min-h-screen`}>
            <h1 className={`text-2xl font-bold mb-6 ${primaryTextLight} ${primaryTextDark}`}>Course & Section Management</h1>
            
            {/* 
                Your UI for listing courses, weeks, and sections would go here.
                Each section item would have a button/link to trigger `openSectionPreview(sectionData)`.
            */}

            <div className="space-y-4">
                <h2 className={`text-xl font-semibold ${primaryTextLight} ${primaryTextDark}`}>Dummy Sections (Replace with actual data)</h2>
                {dummySections.map(section => (
                    <div key={section.id} className={`p-3 border rounded-md shadow-sm ${primaryTextLight} ${primaryTextDark} bg-white dark:bg-gray-800`}>
                        <h3 className="font-medium">{section.title} (Order: {section.order})</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{section.description}</p>
                        <button 
                            onClick={() => openSectionPreview(section)}
                            className="mt-2 px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
                        >
                            Preview Section
                        </button>
                    </div>
                ))}
            </div>


            {/* The Modal: Rendered conditionally */}
            {/* 
                The modal itself is likely controlled internally by its 'isOpen' prop.
                We ensure that when isOpen is true, memoizedSectionToPreview also has data.
            */}
            {showSectionPreviewModal && memoizedSectionToPreview && (
                <SectionPreviewModal
                    isOpen={showSectionPreviewModal} // Controls visibility
                    onClose={handleCloseSectionPreviewModal} // Function to close the modal
                    section={memoizedSectionToPreview} // The section data to display
                />
            )}
        </div>
    );
}