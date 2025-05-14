import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button.js';
import { Input } from '../components/ui/input.js';
import { Textarea } from '../components/ui/textarea.js';
import { Label } from '../components/ui/label.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card.js';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from 'lucide-react';

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
const altSectionBgLight = "bg-[#F4EDE4]";
const altSectionBgDark = "dark:bg-gray-900";
const inputBgLight = "bg-[#FFF8F0]";
const inputBgDark = "dark:bg-gray-800";
const inputBorderLight = "border-[#E0D6C3]";
const inputBorderDark = "dark:border-gray-700";
const focusRingAccent = `focus:ring-[${accentColor}]`;
const focusBorderAccent = `focus:border-[${accentColor}] dark:focus:border-[${accentColor}]`;
const goldBg = `bg-[${accentColor}]`;
const goldBgHover = `hover:bg-[${accentHoverColor}]`;

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting contact form:", formData);

      await new Promise(resolve => setTimeout(resolve, 1500));


      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      console.error("Contact form submission error:", err);
      setError(err.message || "Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = `flex h-10 w-full rounded-md border ${inputBorderLight} ${inputBorderDark} ${inputBgLight} ${inputBgDark} px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}] disabled:cursor-not-allowed disabled:opacity-50 ${primaryTextLight} ${primaryTextDark} shadow-sm transition-colors`;
  const textareaClasses = `${inputClasses} min-h-[100px]`;
  const buttonPrimaryClasses = `bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors duration-200 inline-flex items-center justify-center rounded-md text-sm ring-offset-background h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}]`;

  return (
    <div className={`flex flex-col min-h-screen ${sectionBgLight} ${sectionBgDark}`}>
      <section className="w-full py-16 sm:py-20 md:py-28 lg:py-36 xl:py-40 bg-gradient-to-br from-[#2A0F0F] to-[#4A1F1F] dark:from-gray-900 dark:to-gray-800 relative overflow-hidden text-[#FFF8F0]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            <Mail className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-[${accentColor}] mb-3`} />
            <div className="space-y-2">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-serif tracking-tight text-white`}>
                Contact Us
              </h1>
              <p className={`mx-auto max-w-[700px] text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl text-white`}>
                We'd love to hear from you! Reach out with any questions or inquiries.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`w-full py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 ${sectionBgLight} ${sectionBgDark}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6 text-center lg:text-left">
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark}`}>Get in Touch</h2>
              <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm w-full`}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                    <Mail className={`h-6 w-6 text-[${accentColor}] mt-1 flex-shrink-0`} />
                    <div>
                      <h3 className={`font-semibold ${primaryTextLight} ${primaryTextDark}`}>Email</h3>
                      <a href="mailto:info@apostolictheology.org" className={`${secondaryTextLight} ${secondaryTextDark} hover:text-[${accentColor}] transition-colors break-all`}>
                        info@apostolictheology.org
                      </a>
                      <p className={`text-xs ${mutedTextLight} ${mutedTextDark} mt-1`}>For general inquiries and admissions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight ${primaryTextLight} ${primaryTextDark} text-center lg:text-left`}>Send Us a Message</h2>
              <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-sm w-full`}>
                <form onSubmit={handleSubmit} noValidate>
                  <CardContent className="p-6 space-y-4">
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
                    {error && (
                      <p className="text-sm font-medium text-red-600 dark:text-red-400 text-center sm:text-left">{error}</p>
                    )}
                    {success && (
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
}