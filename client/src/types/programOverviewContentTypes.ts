// src/types/programOverviewContentTypes.ts

export interface ContentListItem {
  id: string; // Unique ID for React keys and stable editing
  text: string;
}

export interface CTAContentData {
  title: string;
  description: string;
  investmentLabel: string;
  // OLD: investmentValue: string; // This line should have already been removed/commented
  investmentValueUSD?: string; // For USD price string
  investmentValueETB?: string; // For ETB price string
  investmentNote: string;
}

export interface ProgramStructureItemData {
  id: string;
  title: string;
  desc: string;
}

export interface CourseWeekData extends ContentListItem {}
export interface CourseAssessmentData extends ContentListItem {}

export interface CourseContentData {
  id: string; // e.g., "foundations", "bible" - user-editable, should be unique
  title: string;
  description: string;
  weeks: CourseWeekData[];
  assessments: CourseAssessmentData[];
  ects: number;
}

// THIS IS THE ONLY DEFINITION of ProgramOverviewPageContentData that should remain
export interface ProgramOverviewPageContentData {
  _id?: string; // From MongoDB/Firestore if applicable
  identifier?: string; // For identifying the page content, e.g., "programOverview"

  hero: {
    title: string;
    subtitle: string;
  };
  programStructure: {
    title: string;
    description: string;
    items: ProgramStructureItemData[];
  };
  learningApproach: {
    title: string;
    description: string;
    points: ContentListItem[];
    weeklyComponentsTitle: string;
    weeklyComponents: ContentListItem[];
  };
  courseCurriculum: {
    title: string;
    description: string;
    courses: CourseContentData[];
  };
  certification: {
    title: string;
    description: string;
    mockup: {
      titlePrefix: string;
      mainTitle: string;
      awardedBy: string;
      credits: string;
    };
    whatYoullReceiveTitle: string;
    details: ContentListItem[];
    quote: string;
  };
  cta: CTAContentData; // CORRECT: Uses the updated CTAContentData interface

  createdAt?: string | Date; // Or Firebase Timestamp
  updatedAt?: string | Date; // Or Firebase Timestamp
}

// DELETE THE DUPLICATE ProgramOverviewPageContentData DEFINITION THAT WAS HERE