// src/pages/ForgotPasswordPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { ArrowLeft, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";

// --- KEY CHANGE: Import from Firebase Client SDK ---
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app as firebaseClientApp } from "../config/firebaseClient.config";

const accentColor = "#C5A467";
const accentHoverColor = "#B08F55";
const primaryTextLight = "text-[#2A0F0F]";
const secondaryTextLight = "text-[#4A1F1F]";
const primaryTextDark = "dark:text-[#FFF8F0]";
const secondaryTextDark = "dark:text-[#E0D6C3]/90";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    // --- KEY CHANGE: Use the Firebase Client SDK directly ---
    const authClient = getAuth(firebaseClientApp);
    
    // This URL is where the user will be sent AFTER they successfully
    // reset their password on the Firebase-hosted page.
    const actionCodeSettings = {
      url: `${window.location.origin}/login?passwordResetSuccess=true`,
      handleCodeInApp: false,
    };

    try {
      await sendPasswordResetEmail(authClient, email, actionCodeSettings);
      
      // For security, always show a generic success message.
      setMessage("A password reset link has been sent. Please check your inbox (and spam folder).");

    } catch (err: any) {
      console.error("Firebase password reset error:", err);
      if (err.code === "auth/user-not-found") {
        // Still show a success message to prevent attackers from discovering valid emails.
        setMessage("A password reset link has been sent. Please check your inbox (and spam folder).");
      } else if (err.code === "auth/invalid-email") {
        setError("The email address is badly formatted.");
      } else {
        setError("Failed to send reset link. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const renderFeedback = () => {
    if (message) {
      return (
        <div className="flex items-center text-sm text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
          <ShieldCheck className="h-5 w-5 mr-2 flex-shrink-0" />
          {message}
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
          <ShieldAlert className="h-5 w-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      );
    }
    return null;
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-[#FFF8F0] dark:bg-gray-950 px-4">
      <div className="mx-auto max-w-md w-full">
        <Card className="bg-white dark:bg-gray-900 border border-[#C5A467]/20 dark:border-[#C5A467]/30 shadow-lg relative">
        
          <Button
              variant="ghost"
              size="icon"
              onClick={handleGoBack}
              className={`absolute top-3 left-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[${accentColor}] dark:hover:text-[${accentColor}] rounded-full`}
              aria-label="Go back to login"
          >
              <ArrowLeft className="h-5 w-5" />
          </Button>

          <CardHeader className="space-y-2 pt-12 pb-6 text-center"> 
            <CardTitle className={`text-2xl font-serif ${primaryTextLight} ${primaryTextDark}`}>
              Forgot Your Password?
            </CardTitle>
            <CardDescription className={`${secondaryTextLight} ${secondaryTextDark}`}>
              No worries! Enter your email and we'll send you a reset link.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-2 pb-6">
              {!message && (
                <div className="space-y-2">
                  <Label htmlFor="email" className={`${primaryTextLight} ${primaryTextDark} font-medium`}>Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className={`bg-[#FFF8F0] dark:bg-gray-800 border-[#E0D6C3] dark:border-gray-700 focus:border-[${accentColor}] dark:focus:border-[${accentColor}] focus:ring-[${accentColor}] ${primaryTextLight} ${primaryTextDark}`}
                    disabled={loading}
                  />
                </div>
              )}
              
              <div className="pt-2">
                {renderFeedback()}
              </div>

            </CardContent>
            <CardFooter className="pt-4 pb-6 flex-col gap-4">
               {!message && (
                 <Button
                    type="submit"
                    className={`w-full bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors disabled:opacity-70`}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
               )}
               <Link
                    to="/login"
                    className={`text-sm text-[${accentColor}] hover:text-[${accentHoverColor}] underline transition-colors`}
                >
                    Back to Login
                </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}