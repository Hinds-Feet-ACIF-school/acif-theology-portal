// src/types/siteBrandingContentTypes.ts
export interface HeaderBrandingData {
    siteName: string;    // e.g., "Apostolic Theology" (used in Header)
    siteLogoUrl?: string; // URL for the main site logo (used in Header)
  }
  
  export interface FooterBrandingData {
    footerLogoUrl?: string; // URL for the logo in the footer (can be same as header or different)
    footerSiteName: string; // Site name as it appears in the footer (can be same or slightly different)
    copyrightText: string;  // e.g., "International Apostolic Church" (year added dynamically)
    tagline: string;        // e.g., "Study to shew thyself approved..."
  }
  
  export interface SiteBrandingContentData {
    _id?: string;
    identifier?: string; // e.g., "siteBranding"
  
    header: HeaderBrandingData;
    footer: FooterBrandingData;
  
    createdAt?: string | Date;
    updatedAt?: string | Date;
  }