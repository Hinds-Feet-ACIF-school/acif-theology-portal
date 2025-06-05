// src/pages/admin/content/AdminProgramOverviewPageContentEditor.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { PlusCircle, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

import {
  ProgramOverviewPageContentData,
  CourseContentData,
} from '../../../types/programOverviewContentTypes'; // Ensure this interface includes optional _id, identifier, createdAt, updatedAt

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// --- INITIAL/FALLBACK DATA ---
const getInitialProgramOverviewData = (): ProgramOverviewPageContentData => ({
  hero: {
    title: "Program Overview",
    subtitle: "A comprehensive guide to our Certificate in Apostolic & Evangelical Theology.",
  },
  programStructure: {
    title: "Program Structure",
    description: "Our certificate program is structured to provide a comprehensive understanding of Apostolic and Evangelical theology through six sequential courses.",
    items: [
      { id: "ps1", title: "Duration", desc: "6 months total (6 courses, 4 weeks each)" },
      { id: "ps2", title: "Study Time", desc: "Approx. 10-12 hours per week" },
      { id: "ps3", title: "Credits", desc: "39 ECTS total (6.5 ECTS per course)" },
      { id: "ps4", title: "Delivery", desc: "100% online with video lectures, readings, and assignments" },
    ],
  },
  learningApproach: {
    title: "Learning Approach",
    description: "Our program follows a structured, sequential learning approach to ensure you build a solid foundation.",
    points: [
      { id: "la1", text: "Courses must be taken in sequence." },
      { id: "la2", text: "Weekly content unlocks progressively." },
      { id: "la3", text: "Must complete current week's materials before accessing next week." },
      { id: "la4", text: "Biannual intakes (January and July start dates)." },
      { id: "la5", text: "Cohort-based learning with peer interaction forums." },
      { id: "la6", text: "Mid-cohort entry: Complete the current cohort's remaining lessons. Finish any missed lessons during the next cohort intake (free of charge) to receive your certificate." }
    ],
    weeklyComponentsTitle: "Weekly Learning Components",
    weeklyComponents: [
      { id: "wc1", text: "Video Lectures" }, { id: "wc2", text: "Reading Materials" },
      { id: "wc3", text: "Quizzes & Assignments" }, { id: "wc4", text: "Discussion Forums" }
    ],
  },
  courseCurriculum: {
    title: "Course Curriculum",
    description: "Detailed breakdown of the six courses included in the certificate program.",
    courses: [
      {
        id: "foundations", title: "Foundations of the Christian Faith",
        description: "Introduces the central tenets of Christianity—God's nature, Jesus Christ's identity, the Holy Spirit's work, and salvation by grace through faith. Emphasizes both biblical understanding and personal application.",
        weeks: [
          { id: "fw1", text: "Week 1: The Nature & Attributes of God (Gen 1–2, Ps 139)"},
          { id: "fw2", text: "Week 2: The Person & Work of Jesus Christ (John 1, Col 1)"},
          { id: "fw3", text: "Week 3: The Holy Spirit & Spiritual Birth (John 3, Acts 2)"},
          { id: "fw4", text: "Week 4: Salvation & the New Life (Romans 5–6, Ephesians 2)"},
        ],
        assessments: [ { id: "fa1", text: "Short Quizzes (Weeks 1–3)"}, { id: "fa2", text: "Reflection Essay (Week 4)"} ],
        ects: 6.5,
      },
      {
        id: "bible", title: "The Bible: God's Word",
        description: "Explores the Bible's formation, authority, and interpretation. Equips students with methods to study and apply Scripture faithfully in personal life and ministry.",
        weeks: [ { id: "bw1", text: "Week 1: Canon & Inspiration (2 Tim 3:16, 2 Pet 1:19–21)"}, { id: "bw2", text: "Week 2: Old & New Testament Overview"}, { id: "bw3", text: "Week 3: Hermeneutics (Context, Culture)"}, { id: "bw4", text: "Week 4: Applying Scripture Today (Devotional exercise & final quiz)"}, ],
        assessments: [ { id: "ba1", text: "Weekly Reading Summaries"}, { id: "ba2", text: "Exegesis Project"}, { id: "ba3", text: "Final Quiz"} ],
        ects: 6.5,
      },
      {
        id: "apostolic", title: "Apostolic Doctrine",
        description: "Presents Oneness theology, baptism in Jesus' name, Holy Spirit baptism, and the call to holiness. Guides students in understanding and defending these Apostolic doctrines biblically and practically.",
        weeks: [ { id: "adw1", text: "Week 1: The Oneness of God (Deut 6:4, Isa 9:6)"}, { id: "adw2", text: "Week 2: Baptism in Jesus' Name (Acts 2, Acts 10, Acts 19)"}, { id: "adw3", text: "Week 3: Holy Spirit Baptism & Tongues (Acts 8, 1 Cor 14)"}, { id: "adw4", text: "Week 4: Holiness & Apostolic Identity"}, ],
        assessments: [ { id: "ada1", text: "Doctrinal Discussion Forum"}, { id: "ada2", text: "Essay: Defense of One Apostolic Doctrine"}, { id: "ada3", text: "Weekly Quizzes"} ],
        ects: 6.5,
      },
      {
        id: "spiritual", title: "Spiritual Growth & Christian Living",
        description: "Builds practical habits of prayer, fasting, Bible reading, and fellowship. Encourages holistic Christian ethics and personal sanctification.",
        weeks: [ { id: "sgw1", text: "Week 1: Prayer & Fasting (practice: 1-day group fast, journaling)"}, { id: "sgw2", text: "Week 2: Overcoming Temptation & Sin (Gal 5, Eph 6)"}, { id: "sgw3", text: "Week 3: The Fruit of the Spirit (Daily Spiritual Inventory)"}, { id: "sgw4", text: "Week 4: Building a Devotional Lifestyle (Final Self-assessment)"}, ],
        assessments: [ { id: "sga1", text: "Personal Devotion Log"}, { id: "sga2", text: "Weekly Quizzes"}, { id: "sga3", text: "Final Reflection Paper"} ],
        ects: 6.5,
      },
      {
        id: "evangelism", title: "Introduction to Evangelism",
        description: "Equips students with biblical frameworks for evangelism and outreach, including personal testimony, apologetics, and cross-cultural communication of the Gospel.",
        weeks: [ { id: "iew1", text: "Week 1: The Great Commission (Matt 28, Mark 16)"}, { id: "iew2", text: "Week 2: Personal Testimony & Witnessing (Record your testimony)"}, { id: "iew3", text: "Week 3: Basic Apologetics (Common objections & responses)"}, { id: "iew4", text: "Week 4: Evangelism Project (Submit outreach plan)"}, ],
        assessments: [ { id: "iea1", text: "Weekly Quizzes"}, { id: "iea2", text: "Personal Testimony Video/Essay"}, { id: "iea3", text: "Outreach/Apologetics Plan"} ],
        ects: 6.5,
      },
      {
        id: "church", title: "Church Life & Service",
        description: "Covers the role of the Church, spiritual gifts, and biblical models of service. Encourages unity, humility, and accountability in ministry.",
        weeks: [ { id: "clw1", text: "Week 1: The Church in Scripture (Acts 2, Eph 4)"}, { id: "clw2", text: "Week 2: Spiritual Gifts & Ministry Roles (gift assessment test)"}, { id: "clw3", text: "Week 3: Servant Leadership & Unity (John 13, 1 Cor 12)"}, { id: "clw4", text: "Week 4: Practical Service Project"}, ],
        assessments: [ { id: "cla1", text: "Spiritual Gift Survey"}, { id: "cla2", text: "Leadership Case Study"}, { id: "cla3", text: "Final \"Service Plan\" Project"} ],
        ects: 6.5,
      },
    ],
  },
  certification: {
    title: "Certification",
    description: "Upon successful completion of all program requirements.",
    mockup: {
      titlePrefix: "Certificate in",
      mainTitle: "Apostolic & Evangelical Theology",
      awardedBy: "Awarded by the International Apostolic Church",
      credits: "39 ECTS Credits",
    },
    whatYoullReceiveTitle: "What You'll Receive",
    details: [
      { id: "cd1", text: "Digital certificate suitable for printing (with unique ID)" },
      { id: "cd2", text: "Official transcript detailing courses and grades" },
      { id: "cd3", text: "Recognition of completion from the Apostolic Church International" },
      { id: "cd4", text: "Solid foundation for ministry roles or further theological studies" },
    ],
    quote: '"Study to show yourself approved unto God..." – 2 Timothy 2:15',
  },
  cta: {
    title: "Ready to Begin Your Theological Journey?",
    description: "Join our next cohort and deepen your understanding of Apostolic and Evangelical theology.",
    investmentLabel: "Investment:",
    // OLD: investmentValue: "$100 Enrollment Fee", // Remove or comment out
    investmentValueUSD: "$100 USD", // Default USD value
    investmentValueETB: "5500 ETB", // Default ETB value
    investmentNote: "A one-time fee to secure your place and begin this transformative program.",
  },
});
// --- END INITIAL/FALLBACK DATA ---

// --- REAL API FUNCTIONS ---
const fetchProgramOverviewContentFromAPI = async (): Promise<ProgramOverviewPageContentData | null> => {
  console.log("Attempting to fetch program overview page content from API...");
  try {
    const response = await fetch(`${API_BASE_URL}/content/program-overview`);
    if (!response.ok) {
      console.warn(`Failed to fetch Program Overview content from API. Status: ${response.status}`);
      return null;
    }
    const data = await response.json();
    if (typeof data === 'object' && data !== null && data.hero?.title) {
      console.log("Successfully fetched program overview content from API.");
      return data;
    } else {
      console.warn("API returned data not in the expected ProgramOverviewPageContentData format, or it was empty/null.");
      return null;
    }
  } catch (error) {
    console.error("Network or JSON parsing error during fetchProgramOverviewContentFromAPI:", error);
    return null;
  }
};

const saveProgramOverviewContent = async (content: ProgramOverviewPageContentData): Promise<ProgramOverviewPageContentData> => {
  console.log("Saving program overview page content to API:", content);
  const token = localStorage.getItem('token');
  const { _id, identifier, createdAt, updatedAt, ...contentToSave } = content;

  const response = await fetch(`${API_BASE_URL}/content/program-overview`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(contentToSave),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to save Program Overview content" }));
    throw new Error(errorData.message || "Failed to save Program Overview content");
  }
  return response.json();
};
// --- END REAL API FUNCTIONS ---

const AdminProgramOverviewPageContentEditor: React.FC = () => {
  const [content, setContent] = useState<ProgramOverviewPageContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const fetchedContentFromApi = await fetchProgramOverviewContentFromAPI();

      if (fetchedContentFromApi) {
        setContent(fetchedContentFromApi);
      } else {
        setContent(getInitialProgramOverviewData());
        console.log("Using initial fallback data for Program Overview Editor.");
        // setError("Using default template. Your changes will be saved to the live site."); // Optional info message
      }
      setIsLoading(false);
    };
    loadContent();
  }, []);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };
  
  const handleInputChange = (path: string, value: any) => {
    clearMessages();
    setContent(prev => {
        if (!prev) return null;
        const keys = path.split('.');
        let newContent = JSON.parse(JSON.stringify(prev));
        let currentLevel: any = newContent;

        for (let i = 0; i < keys.length; i++) {
            const keyPart = keys[i];
            const arrayMatch = keyPart.match(/^(\w+)\[(\d+)\]$/);

            if (i === keys.length - 1) {
                if (arrayMatch) {
                    const arrayName = arrayMatch[1];
                    const index = parseInt(arrayMatch[2]);
                    if (!currentLevel[arrayName]) currentLevel[arrayName] = [];
                    currentLevel[arrayName][index] = value;
                } else {
                    currentLevel[keyPart] = value;
                }
            } else {
                if (arrayMatch) {
                    const arrayName = arrayMatch[1];
                    const index = parseInt(arrayMatch[2]);
                    if (!currentLevel[arrayName]) currentLevel[arrayName] = [];
                    if (!currentLevel[arrayName][index]) currentLevel[arrayName][index] = {};
                    currentLevel = currentLevel[arrayName][index];
                } else {
                    if (!currentLevel[keyPart] || typeof currentLevel[keyPart] !== 'object') {
                        currentLevel[keyPart] = {};
                    }
                    currentLevel = currentLevel[keyPart];
                }
            }
        }
        return newContent;
    });
  };
  
  const handleListItemChange = (listPath: string, index: number, fieldKey: string, value: string) => {
    clearMessages();
    handleInputChange(`${listPath}[${index}].${fieldKey}`, value);
  };
  
  const addListItemByPath = (listPath: string, newItemPrototype: () => object) => {
    clearMessages();
    setContent(prev => {
        if (!prev) return null;
        const keys = listPath.split('.');
        let newContent = JSON.parse(JSON.stringify(prev));
        let currentObject: any = newContent;
        const newItem = newItemPrototype();

        for (let i = 0; i < keys.length; i++) {
            const keyPart = keys[i];
            if (i === keys.length - 1) {
                if (!currentObject[keyPart] || !Array.isArray(currentObject[keyPart])) {
                    currentObject[keyPart] = [];
                }
                currentObject[keyPart].push(newItem);
            } else { 
                if (!currentObject[keyPart] || typeof currentObject[keyPart] !== 'object') {
                    currentObject[keyPart] = {};
                }
                currentObject = currentObject[keyPart];
            }
        }
        return newContent;
    });
  };
  
  const removeListItemByPath = (listPath: string, indexToRemove: number) => {
    clearMessages();
    setContent(prev => {
        if (!prev) return null;
        const keys = listPath.split('.');
        let newContent = JSON.parse(JSON.stringify(prev));
        let currentObject: any = newContent;

        for (let i = 0; i < keys.length; i++) {
            const keyPart = keys[i];
             if (i === keys.length - 1) { 
                if (Array.isArray(currentObject[keyPart])) {
                    currentObject[keyPart] = currentObject[keyPart].filter((_: any, idx: number) => idx !== indexToRemove);
                } else { return prev; }
            } else { 
                if (currentObject[keyPart] && typeof currentObject[keyPart] === 'object') {
                    currentObject = currentObject[keyPart];
                } else { return prev; }
            }
        }
        return newContent;
    });
    setSuccessMessage("Item removed. Save to persist changes.");
  };

  const addCourse = () => {
    clearMessages();
    const newCourse: CourseContentData = {
      id: `course-${Date.now()}-${Math.random().toString(16).slice(2)}`, title: "New Course", description: "",
      weeks: [], assessments: [], ects: 0,
    };
    setContent(prev => {
        if (!prev) return null;
        
        let newContent = JSON.parse(JSON.stringify(prev));
        if (!newContent.courseCurriculum) {
            newContent.courseCurriculum = { title: "Course Curriculum", description: "Course details", courses: [] };
        }
        if (!Array.isArray(newContent.courseCurriculum.courses)) {
            newContent.courseCurriculum.courses = [];
        }
        newContent.courseCurriculum.courses.push(newCourse);
        return newContent;
    });
  };

  const removeCourse = (courseIndex: number) => {
    clearMessages();
    setContent(prev => {
        if (!prev || !prev.courseCurriculum || !prev.courseCurriculum.courses) return prev;
        let newContent = JSON.parse(JSON.stringify(prev));
        newContent.courseCurriculum.courses = newContent.courseCurriculum.courses.filter((_:any, idx:number) => idx !== courseIndex);
        return newContent;
    });
    setSuccessMessage("Course removed. Save to persist changes.");
  };

  const handleCourseDetailChange = (courseIndex: number, field: keyof Omit<CourseContentData, 'weeks' | 'assessments'>, value: string | number) => {
    clearMessages();
    setContent(prev => {
        if (!prev || !prev.courseCurriculum?.courses?.[courseIndex]) return prev;
        const newContent = JSON.parse(JSON.stringify(prev));
        (newContent.courseCurriculum.courses[courseIndex] as any)[field] = value;
        return newContent;
    });
  };
  
  const addCourseListItem = (courseIndex: number, listType: 'weeks' | 'assessments') => {
    clearMessages();
    setContent(prev => {
        if (!prev || !prev.courseCurriculum?.courses?.[courseIndex]) return prev;
        
        const newContent = JSON.parse(JSON.stringify(prev));
        const courseToUpdate = newContent.courseCurriculum.courses[courseIndex];
        const newItem = { id: `${listType}-item-${Date.now()}-${Math.random().toString(16).slice(2)}`, text: "" };
        
        if (!Array.isArray(courseToUpdate[listType])) {
            courseToUpdate[listType] = [];
        }
        courseToUpdate[listType].push(newItem);
        return newContent;
    });
  };
  
  const removeCourseListItem = (courseIndex: number, listType: 'weeks' | 'assessments', itemIndex: number) => {
    clearMessages();
    setContent(prev => {
        if (!prev || !prev.courseCurriculum?.courses?.[courseIndex] || !Array.isArray(prev.courseCurriculum.courses[courseIndex][listType])) return prev;
        const newContent = JSON.parse(JSON.stringify(prev));
        const courseToUpdate = newContent.courseCurriculum.courses[courseIndex];
        courseToUpdate[listType] = courseToUpdate[listType].filter((_:any, idx:number) => idx !== itemIndex);
        return newContent;
    });
    setSuccessMessage("Course item removed. Save to persist changes.");
  };
  
  const handleCourseListItemTextChange = (courseIndex: number, listType: 'weeks' | 'assessments', itemIndex: number, text: string) => {
    clearMessages();
    setContent(prev => {
        if (!prev || !prev.courseCurriculum?.courses?.[courseIndex] || 
            !Array.isArray(prev.courseCurriculum.courses[courseIndex][listType]) || 
            !prev.courseCurriculum.courses[courseIndex][listType][itemIndex]) return prev;

        const newContent = JSON.parse(JSON.stringify(prev));
        newContent.courseCurriculum.courses[courseIndex][listType][itemIndex].text = text;
        return newContent;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content) {
        setError("No content to save.");
        return;
    }
    setIsSaving(true);
    clearMessages();
    try {
      const savedContent = await saveProgramOverviewContent(content);
      setContent(savedContent);
      setSuccessMessage("Program Overview content saved successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while saving.";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading Program Overview editor...</div>;
  
  if (!content && error) {
    return (
        <div className="container mx-auto p-4 md:p-6 space-y-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Program Overview Page</h1>
            <div role="alert" className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0"/>
                <span>Critical Error: {error}. Unable to initialize editor.</span>
            </div>
        </div>
      );
  }
  if (!content) {
    return <div className="p-6 text-center">Content is not available. Please try refreshing the page.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Program Overview Page</h1>
        {successMessage && (
          <div role="alert" className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 rounded-md text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0"/>
            <span>{successMessage}</span>
          </div>
        )}
        {error && (
          <div role="alert" className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0"/>
            <span>{error}</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <Input id="heroTitle" value={content.hero.title} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('hero.title', e.target.value)} />
            </div>
            <div>
              <label htmlFor="heroSubtitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
              <Textarea id="heroSubtitle" value={content.hero.subtitle} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('hero.subtitle', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Program Structure</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label htmlFor="psTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Title</label>
                    <Input id="psTitle" value={content.programStructure.title} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('programStructure.title', e.target.value)} />
                </div>
                <div>
                    <label htmlFor="psDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Description</label>
                    <Textarea id="psDescription" value={content.programStructure.description} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('programStructure.description', e.target.value)} />
                </div>
                <h4 className="text-md font-semibold pt-2 text-gray-700 dark:text-gray-300">Structure Items:</h4>
                {content.programStructure.items.map((item, index) => (
                    <Card key={item.id} className="p-3 space-y-2 bg-white dark:bg-gray-800 border dark:border-gray-700">
                        <div>
                            <label htmlFor={`psItemTitle-${index}`} className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Item Title</label>
                            <Input id={`psItemTitle-${index}`} value={item.title} onChange={(e: ChangeEvent<HTMLInputElement>) => handleListItemChange('programStructure.items', index, 'title', e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor={`psItemDesc-${index}`} className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Item Description</label>
                            <Textarea id={`psItemDesc-${index}`} value={item.desc} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleListItemChange('programStructure.items', index, 'desc', e.target.value)} rows={2}/>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeListItemByPath('programStructure.items', index)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">
                            <Trash2 className="h-4 w-4 mr-1" /> Remove Item
                        </Button>
                    </Card>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addListItemByPath('programStructure.items', () => ({ id: `psItem-${Date.now()}-${Math.random().toString(16).slice(2)}`, title: "", desc: "" }))}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Structure Item
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Learning Approach</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <label htmlFor="laTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Title</label>
                    <Input id="laTitle" value={content.learningApproach.title} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('learningApproach.title', e.target.value)} />
                </div>
                <div>
                    <label htmlFor="laDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Description</label>
                    <Textarea id="laDescription" value={content.learningApproach.description} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('learningApproach.description', e.target.value)} />
                </div>

                <h4 className="text-md font-semibold pt-2 text-gray-700 dark:text-gray-300">Learning Points:</h4>
                {content.learningApproach.points.map((point, index) => (
                    <div key={point.id} className="flex items-center space-x-2 p-2 border dark:border-gray-700 rounded-md">
                        <Textarea value={point.text} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleListItemChange('learningApproach.points', index, 'text', e.target.value)} className="flex-grow bg-white dark:bg-gray-700" rows={1} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeListItemByPath('learningApproach.points', index)}><Trash2 className="h-4 w-4 text-red-500 hover:text-red-700 dark:hover:text-red-400" /></Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addListItemByPath('learningApproach.points', () => ({ id: `laPoint-${Date.now()}-${Math.random().toString(16).slice(2)}`, text: "" }) )}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Point
                </Button>

                <div className="pt-4">
                    <label htmlFor="laWCTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weekly Components Title</label>
                    <Input id="laWCTitle" value={content.learningApproach.weeklyComponentsTitle} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('learningApproach.weeklyComponentsTitle', e.target.value)} />
                </div>
                 <h4 className="text-md font-semibold pt-2 text-gray-700 dark:text-gray-300">Weekly Components:</h4>
                {content.learningApproach.weeklyComponents.map((comp, index) => (
                    <div key={comp.id} className="flex items-center space-x-2 p-2 border dark:border-gray-700 rounded-md">
                        <Input value={comp.text} onChange={(e: ChangeEvent<HTMLInputElement>) => handleListItemChange('learningApproach.weeklyComponents', index, 'text', e.target.value)} className="flex-grow bg-white dark:bg-gray-700" />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeListItemByPath('learningApproach.weeklyComponents', index)}><Trash2 className="h-4 w-4 text-red-500 hover:text-red-700 dark:hover:text-red-400" /></Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addListItemByPath('learningApproach.weeklyComponents', () => ({ id: `laComp-${Date.now()}-${Math.random().toString(16).slice(2)}`, text: "" }) )}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Weekly Component
                </Button>
            </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Course Curriculum</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="ccTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Title</label>
              <Input id="ccTitle" value={content.courseCurriculum.title} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('courseCurriculum.title', e.target.value)} />
            </div>
            <div>
              <label htmlFor="ccDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Description</label>
              <Textarea id="ccDescription" value={content.courseCurriculum.description} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('courseCurriculum.description', e.target.value)} />
            </div>

            <h3 className="text-lg font-semibold pt-4 text-gray-700 dark:text-gray-300">Courses:</h3>
            {content.courseCurriculum.courses.map((course, courseIdx) => (
              <Card key={course.id} className="p-4 space-y-3 mt-2 border-2 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">Course: {course.title || `Course ${courseIdx + 1}`}</h4>
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeCourse(courseIdx)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Remove Course
                    </Button>
                </div>
                <div>
                  <label htmlFor={`courseId-${courseIdx}`} className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Course ID (unique, e.g., 'foundations')</label>
                  <Input id={`courseId-${courseIdx}`} value={course.id} onChange={(e: ChangeEvent<HTMLInputElement>) => handleCourseDetailChange(courseIdx, 'id', e.target.value)} placeholder="Unique Course ID"/>
                </div>
                <div>
                  <label htmlFor={`courseTitle-${courseIdx}`} className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Title</label>
                  <Input id={`courseTitle-${courseIdx}`} value={course.title} onChange={(e: ChangeEvent<HTMLInputElement>) => handleCourseDetailChange(courseIdx, 'title', e.target.value)} />
                </div>
                <div>
                  <label htmlFor={`courseDesc-${courseIdx}`} className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Description</label>
                  <Textarea id={`courseDesc-${courseIdx}`} value={course.description} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleCourseDetailChange(courseIdx, 'description', e.target.value)} rows={3} />
                </div>
                <div>
                  <label htmlFor={`courseEcts-${courseIdx}`} className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">ECTS</label>
                  <Input id={`courseEcts-${courseIdx}`} type="number" value={course.ects} onChange={(e: ChangeEvent<HTMLInputElement>) => handleCourseDetailChange(courseIdx, 'ects', parseFloat(e.target.value) || 0)} />
                </div>

                <div className="pl-4 border-l-2 dark:border-gray-600 mt-2 pt-2">
                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Weekly Breakdown:</h5>
                    {course.weeks.map((week, weekIdx) => (
                        <div key={week.id} className="flex items-center space-x-2 my-1 p-1 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700/50">
                            <Textarea value={week.text} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleCourseListItemTextChange(courseIdx, 'weeks', weekIdx, e.target.value)} rows={1} className="flex-grow bg-transparent" placeholder={`Week ${weekIdx + 1} content`} />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeCourseListItem(courseIdx, 'weeks', weekIdx)}><Trash2 className="h-3 w-3 text-red-500 hover:text-red-700 dark:hover:text-red-400" /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => addCourseListItem(courseIdx, 'weeks')} className="mt-1">
                        <PlusCircle className="mr-1 h-3 w-3" /> Add Week
                    </Button>
                </div>

                 <div className="pl-4 border-l-2 dark:border-gray-600 mt-2 pt-2">
                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Assessments:</h5>
                    {course.assessments.map((assessment, assessmentIdx) => (
                        <div key={assessment.id} className="flex items-center space-x-2 my-1 p-1 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700/50">
                            <Textarea value={assessment.text} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleCourseListItemTextChange(courseIdx, 'assessments', assessmentIdx, e.target.value)} rows={1} className="flex-grow bg-transparent" placeholder={`Assessment ${assessmentIdx + 1}`} />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeCourseListItem(courseIdx, 'assessments', assessmentIdx)}><Trash2 className="h-3 w-3 text-red-500 hover:text-red-700 dark:hover:text-red-400" /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => addCourseListItem(courseIdx, 'assessments')} className="mt-1">
                        <PlusCircle className="mr-1 h-3 w-3" /> Add Assessment
                    </Button>
                </div>
              </Card>
            ))}
            <Button type="button" variant="default" size="sm" onClick={addCourse} className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Course
            </Button>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Certification Section</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label htmlFor="certTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Title</label>
                    <Input id="certTitle" value={content.certification.title} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('certification.title', e.target.value)} />
                </div>
                <div>
                    <label htmlFor="certDesc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Description</label>
                    <Textarea id="certDesc" value={content.certification.description} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('certification.description', e.target.value)} />
                </div>
                <fieldset className="border p-3 rounded dark:border-gray-700">
                    <legend className="text-sm font-semibold px-1 text-gray-700 dark:text-gray-300">Certificate Mockup Text</legend>
                    <div className="space-y-3 mt-1">
                        <div>
                            <label htmlFor="certMockupTitlePrefix" className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Title Prefix (e.g., 'Certificate in')</label>
                            <Input id="certMockupTitlePrefix" value={content.certification.mockup.titlePrefix} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('certification.mockup.titlePrefix', e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="certMockupMainTitle" className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Main Title (e.g., 'Apostolic & Evangelical Theology')</label>
                            <Input id="certMockupMainTitle" value={content.certification.mockup.mainTitle} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('certification.mockup.mainTitle', e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="certMockupAwardedBy" className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Awarded By</label>
                            <Input id="certMockupAwardedBy" value={content.certification.mockup.awardedBy} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('certification.mockup.awardedBy', e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="certMockupCredits" className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Credits Text</label>
                            <Input id="certMockupCredits" value={content.certification.mockup.credits} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('certification.mockup.credits', e.target.value)} />
                        </div>
                    </div>
                </fieldset>
                 <div>
                    <label htmlFor="certReceiveTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">"What You'll Receive" Title</label>
                    <Input id="certReceiveTitle" value={content.certification.whatYoullReceiveTitle} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('certification.whatYoullReceiveTitle', e.target.value)} />
                </div>
                <h4 className="text-md font-semibold pt-2 text-gray-700 dark:text-gray-300">Certification Details:</h4>
                {content.certification.details.map((detail, index) => (
                    <div key={detail.id} className="flex items-center space-x-2 p-2 border dark:border-gray-700 rounded-md">
                        <Textarea value={detail.text} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleListItemChange('certification.details', index, 'text', e.target.value)} className="flex-grow bg-white dark:bg-gray-700" rows={1} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeListItemByPath('certification.details', index)}><Trash2 className="h-4 w-4 text-red-500 hover:text-red-700 dark:hover:text-red-400" /></Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addListItemByPath('certification.details', () => ({ id: `certDetail-${Date.now()}-${Math.random().toString(16).slice(2)}`, text: "" }))}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Detail
                </Button>
                 <div>
                    <label htmlFor="certQuote" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quote</label>
                    <Textarea id="certQuote" value={content.certification.quote} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('certification.quote', e.target.value)} />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Call to Action (Unauthenticated Users)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <label htmlFor="ctaTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <Input id="ctaTitle" value={content.cta.title} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('cta.title', e.target.value)} />
                </div>
                <div>
                    <label htmlFor="ctaDesc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <Textarea id="ctaDesc" value={content.cta.description} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('cta.description', e.target.value)} />
                </div>
                <div>
                    <label htmlFor="ctaInvestLabel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Investment Label</label>
                    <Input id="ctaInvestLabel" value={content.cta.investmentLabel} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('cta.investmentLabel', e.target.value)} />
                </div>

                {/* --- MODIFIED SECTION FOR INVESTMENT VALUES --- */}
                <div>
                    <label htmlFor="ctaInvestValueUSD" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Investment Value (USD)
                    </label>
                    <Input 
                        id="ctaInvestValueUSD" 
                        value={content.cta.investmentValueUSD || ''} 
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('cta.investmentValueUSD', e.target.value)}
                        placeholder="$100 USD"
                    />
                  
                </div>
                <div>
                    <label htmlFor="ctaInvestValueETB" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Investment Value (ETB)
                    </label>
                    <Input 
                        id="ctaInvestValueETB" 
                        value={content.cta.investmentValueETB || ''} 
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('cta.investmentValueETB', e.target.value)}
                        placeholder="5500 ETB"
                    />
                   
                </div>
                {/* --- END OF MODIFIED SECTION --- */}

                <div>
                    <label htmlFor="ctaInvestNote" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Investment Note</label>
                    <Textarea id="ctaInvestNote" value={content.cta.investmentNote} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('cta.investmentNote', e.target.value)} />
                </div>
            </CardContent>
        </Card>


        <CardFooter className="flex justify-end pt-6 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-t">
          <Button type="submit" size="lg" disabled={isSaving || isLoading}>
            {isSaving ? 'Saving...' : 'Save Program Overview Content'}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};

export default AdminProgramOverviewPageContentEditor;