// src/types/aboutPageContentTypes.ts
import { LucideIcon } from 'lucide-react'; // For potential future use if icons are stored/selected

export interface CoreValueItemData {
  id: string; // Unique ID for React keys and stable editing
  // iconName?: string; // Optional: if you want to store icon names like "BookOpen"
  title: string;
  desc: string;
}

export interface AboutPageContentData {
  _id?: string;
  identifier?: string;

  hero: {
    // logoUrl will be hardcoded as it's from local assets in your current public page
    logoUrl?: string; 
    title: string;
    subtitle: string;
  };
  missionVision: {
    missionTitle: string;
    missionDescription: string;
    visionTitle: string;
    visionDescription: string;
  };
  coreValues: {
    title: string;
    items: CoreValueItemData[];
  };


  createdAt?: string | Date;
  updatedAt?: string | Date;
}