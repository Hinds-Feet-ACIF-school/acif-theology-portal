import { LucideIcon } from 'lucide-react'; // For potential future use if icons are stored/selected

export interface CoreValueItemData {
  id: string; 
  title: string;
  desc: string;
}

export interface AboutPageContentData {
  _id?: string;
  identifier?: string;

  hero: {
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