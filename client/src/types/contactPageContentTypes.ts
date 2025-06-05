// src/types/contactPageContentTypes.ts

// This interface describes the structure of a single contact information item.
// While the current page only has one (email), this structure allows for future expansion (phone, address etc.)
// For the admin editor, we'll directly edit the fields of the single emailInfo object.
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
    // Currently, we only have one email. If you want a list of contact methods:
    // items: ContactInfoItemData[];
    // For simplicity with the current page, we'll keep it as a single object:
    emailInfo: ContactInfoItemData; // The admin will edit this specific object's fields
  };
  sendMessage: { // For the section title above the contact form
    title: string;
  };

  createdAt?: string | Date;
  updatedAt?: string | Date;
}