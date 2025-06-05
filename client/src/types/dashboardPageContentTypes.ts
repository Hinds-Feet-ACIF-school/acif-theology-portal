// src/types/dashboardPageContentTypes.ts

export interface DashboardGuidanceSectionData {
  title: string;
  description: string;
  buttonText: string;
  videoUrl: string; // The URL for the guidance video
}

// Example for if announcements were to be made editable in the future
// export interface DashboardAnnouncementItemData {
//   id: string;
//   title: string;
//   date: string; // Or Date type if you prefer
//   content: string;
// }

export interface DashboardPageContentData {
  _id?: string;
  identifier?: string; // e.g., "userDashboard"

  guidanceSection: DashboardGuidanceSectionData;
  // announcements?: DashboardAnnouncementItemData[]; // If you add editable announcements

  createdAt?: string | Date;
  updatedAt?: string | Date;
}