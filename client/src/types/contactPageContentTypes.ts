export interface ContactInfoItemData {
  id: string; // e.g., "email1"
  type: "Email" | "Phone" | "Address"; // Helps determine icon/display logic on public page
  value: string; // The actual email, phone number, or address line
  description: string; // e.g., "For general inquiries and admissions"
}

export interface ContactPageContentData {
  _id?: string;
  identifier?: string;

  hero: {
    title: string;
    subtitle: string;
  };
  getInTouch: {
    title: string;
    emailInfo: ContactInfoItemData;
  };
  sendMessage: { 
    title: string;
  };

  createdAt?: string | Date;
  updatedAt?: string | Date;
}