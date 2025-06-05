// Ensure this is in: ./admin/content/AdminHomePageContentEditor.ts
// (or the actual file path where HomePageContentData is defined)

interface UnauthenticatedCTA {
    title: string;
    description: string;
    investmentLabel: string;
    // REMOVE THE OLD investmentValue FIELD:
    // investmentValue?: string; // <--- DELETE THIS LINE if it exists
  
    // ADD THESE NEW FIELDS:
    investmentValueUSD?: string; // e.g., "$100" or "100 USD"
    investmentValueETB?: string; // e.g., "5000 Birr" or "5000 ETB"
    investmentNote?: string;
  }
  
  export interface HomePageContentData {
    hero: {
      title: string;
      subtitle: string;
      logoUrl?: string;
    };
    programHighlights: {
      title: string;
      description: string;
      items: Array<{ id?: string; text: string }>;
    };
    learningOutcomes: {
      title: string;
      description: string;
      items: Array<{ id?: string; text: string }>;
    };
    cta: {
      authenticated: {
        title: string;
        description: string;
      };
      unauthenticated: UnauthenticatedCTA; // This uses the updated interface
    };
  }