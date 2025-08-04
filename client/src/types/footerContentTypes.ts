export interface FooterContentData {
    _id?: string;
    identifier?: string; // e.g., "siteFooter"
  
    logoUrl?: string; // For the small logo in the footer
    siteName: string; // e.g., "Apostolic Theology"
    copyrightText: string; // e.g., "International Apostolic Church. All rights reserved." (Year will be dynamic)
    tagline: string; // e.g., "Study to shew thyself approved unto God..." - 2 Timothy 2:15
 
    createdAt?: string | Date;
    updatedAt?: string | Date;
  }