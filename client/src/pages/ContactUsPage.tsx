import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button'; 
import { Input } from '../components/ui/input';  
import { Textarea } from '../components/ui/textarea'; 
import { Label } from '../components/ui/label';     
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card'; 
import { Mail, Send, Loader2, CheckCircle } from 'lucide-react';
import * as apiService from '../services/api';

// Import the data type
import { ContactPageContentData } from '../types/contactPageContentTypes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Fetch function for public page content (not form submission)
const fetchPublicContactUsPageContent = async (): Promise<ContactPageContentData> => {
  const response = await fetch(`${API_BASE_URL}/content/contact`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to fetch Contact Us page content" }));
    throw new Error(errorData.message || "Failed to fetch Contact Us page content");
  }
  return response.json();
};

const accentColor = "#C5A467";
const accentHoverColor = "#B08F55";
const primaryTextLight = "text-[#2A0F0F]";
const secondaryTextLight = "text-[#4A1F1F]";
const primaryTextDark = "dark:text-[#FFF8F0]";
const secondaryTextDark = "dark:text-[#E0D6C3]/90";
const mutedTextLight = "text-gray-500";
const mutedTextDark = "dark:text-gray-400";
const cardBgLight = "bg-white";
const cardBgDark = "dark:bg-gray-900";
const cardBorder = `border border-[#C5A467]/20 dark:border-[#C5A467]/30`;
const sectionBgLight = "bg-[#FFF8F0]";
const sectionBgDark = "dark:bg-gray-950";
const inputBgLight = "bg-[#FFF8F0]";
const inputBgDark = "dark:bg-gray-800";
const inputBorderLight = "border-[#E0D6C3]";
const inputBorderDark = "dark:border-gray-700";


const ContactUsPage: React.FC = () => {
  const [pageContent, setPageContent] = useState<ContactPageContentData | null>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsContentLoaded(false); // Explicitly set to false before fetching
        setContentError(null);
        const fetchedContent = await fetchPublicContactUsPageContent();
        setPageContent(fetchedContent);
      } catch (err) {
        setContentError(err instanceof Error ? err.message : "An unknown error occurred loading page text.");
        console.error("Error loading contact page content:", err);
      } finally {
        setIsContentLoaded(true);
      }
    };
    loadContent();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError(null);
    setFormSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setFormError("Please fill out all required fields.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.sendContactEmail(formData);
      setFormSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      console.error("Contact form submission error on frontend:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to send message. Please try again later.";
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = `flex h-10 w-full rounded-md border ${inputBorderLight} ${inputBorderDark} ${inputBgLight} ${inputBgDark} px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}] disabled:cursor-not-allowed disabled:opacity-50 ${primaryTextLight} ${primaryTextDark} shadow-sm transition-colors`;
  const textareaClasses = `${inputClasses} min-h-[100px]`;
  const buttonPrimaryClasses = `bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors duration-200 inline-flex items-center justify-center rounded-md text-sm ring-offset-background h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}]`;

  const heroTitle = pageContent?.hero?.title || "Contact Us";
  const heroSubtitle = pageContent?.hero?.subtitle || "We'd love to hear from you! Reach out with any questions or inquiries.";
  const getInTouchTitle = pageContent?.getInTouch?.title || "Get in Touch";
  const emailValue = pageContent?.getInTouch?.emailInfo?.value || "info@example.com";
  const emailDescription = pageContent?.getInTouch?.emailInfo?.description || "For general inquiries";
  const sendMessageTitle = pageContent?.sendMessage?.title || "Send Us a Message";


  return (
    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>
      <section className="w-full py-16 sm:py-20 md:py-28 lg:py-36 xl:py-40 bg-gradient-to-br from-[#2A0F0F] to-[#4A1F1F] dark:from-gray-900 dark:to-gray-800 relative overflow-hidden text-[#FFF8F0]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            <Mail className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-[${accentColor}] mb-3`} />
            <div className="space-y-2">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-serif tracking-tight text-white`}>
                {heroTitle}
              </h1>
              <p className={`mx-auto max-w-[700px] text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl text-white`}>
                {heroSubtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`w-full py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 ${sectionBgLight} ${sectionBgDark}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {contentError && <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center mb-4">Notice: Some page text might be using defaults due to a loading issue: {contentError}</p>}
          <div className="grid gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6 text-center lg:text-left">
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>{getInTouchTitle}</h2>
              <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm w-full`}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                    <Mail className={`h-6 w-6 text-[${accentColor}] mt-1 flex-shrink-0`} />
                    <div>
                      <h3 className={`font-semibold ${primaryTextLight} ${primaryTextDark}`}>Email</h3>
                      <a href={`mailto:${emailValue}`} className={`${secondaryTextLight} ${secondaryTextDark} hover:text-[${accentColor}] transition-colors break-all`}>
                        {emailValue}
                      </a>
                      <p className={`text-xs ${mutedTextLight} ${mutedTextDark} mt-1`}>{emailDescription}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark} text-center lg:text-left`}>{sendMessageTitle}</h2>
              <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm w-full`}>
                <form onSubmit={handleSubmit} noValidate>
                  <CardContent className="p-6 space-y-4">
                    {/* Form fields remain the same */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className={`${primaryTextLight} ${primaryTextDark} text-sm`}>Name</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required className={inputClasses} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className={`${primaryTextLight} ${primaryTextDark} text-sm`}>Email</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className={inputClasses} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="subject" className={`${primaryTextLight} ${primaryTextDark} text-sm`}>Subject</Label>
                      <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required className={inputClasses} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="message" className={`${primaryTextLight} ${primaryTextDark} text-sm`}>Message</Label>
                      <Textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={5} className={textareaClasses} />
                    </div>
                    {formError && (
                      <p className="text-sm font-medium text-red-600 dark:text-red-400 text-center sm:text-left">{formError}</p>
                    )}
                    {formSuccess && (
                      <div className="flex items-center justify-center sm:justify-start gap-2 p-3 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
                         <CheckCircle size={18} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                         <p className="text-sm font-medium text-green-700 dark:text-green-300">Message sent successfully! We'll be in touch soon.</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex justify-center sm:justify-start">
                    <Button type="submit" className={buttonPrimaryClasses} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" /> Send Message
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUsPage;