export interface DashboardGuidanceSectionData {
  title: string;
  description: string;
  buttonText: string;
  videoUrl: string; 
}


export interface DashboardPageContentData {
  _id?: string;
  identifier?: string;

  guidanceSection: DashboardGuidanceSectionData;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}