import React, { useState, useEffect } from "react"; // Added useEffect for console log
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft } from "lucide-react";

// Import Firebase client SDK modules
import { getAuth, sendPasswordResetEmail as firebaseSendPasswordResetEmail } from "firebase/auth";
import { app as firebaseClientApp } from "../config/firebaseClient.config"; // Your client Firebase app instance

const accentColor = "#C5A467";
const accentHoverColor = "#B08F55";
// ... (your style constants) ...

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ForgotPasswordPage: Component Mounted");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setMessage(null);
    setError(null);

    const authClient = getAuth(firebaseClientApp); // Get Firebase Client Auth instance

    try {
      // This is where the user will be redirected after successfully
      // resetting their password on the Firebase-hosted page.
      // It is a "continue" URL.
      const actionCodeSettings = {
        url: `${window.location.origin}/login?passwordResetSuccess=true`,
        handleCodeInApp: false, // Let Firebase handle the reset UI and send its own email
      };

      await firebaseSendPasswordResetEmail(authClient, email, actionCodeSettings);
      setMessage("A password reset link has been sent. Please check your inbox (and spam folder).");
      // Optionally, clear the email field after success
      // setEmail("");
    } catch (err: any) {
      console.error("Firebase password reset error:", err);
      if (err.code === "auth/user-not-found") {
        // For security, still show a generic success message.
        // Firebase itself doesn't reveal if an email exists when using this client-side function.
        setMessage("A password reset link has been sent. Please check your inbox (and spam folder).");
      } else if (err.code === "auth/invalid-email") {
        setError("The email address is badly formatted.");
      } else if (err.code === "auth/missing-continue-uri") {
        setError("Configuration error: Missing continue URI for password reset. Contact support.");
        console.error("Firebase error detail: auth/missing-continue-uri. Ensure actionCodeSettings.url is provided.");
      }
      else {
        setError(err.message || "Failed to send reset link. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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
              aria-label="Go back"
          >
              <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardHeader className="space-y-2 pt-12 pb-6 text-center">
            <CardTitle className={`text-2xl font-serif text-[#2A0F0F] dark:text-[#FFF8F0]`}>
              Forgot Your Password?
            </CardTitle>
            <CardDescription className={`text-[#4A1F1F] dark:text-[#E0D6C3]/90`}>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-2 pb-6">
              <div className="space-y-2">
                <Label htmlFor="email" className={`text-[#2A0F0F] dark:text-[#FFF8F0] font-medium`}>Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className={`bg-[#FFF8F0] dark:bg-gray-800 border-[#E0D6C3] dark:border-gray-700 focus:border-[${accentColor}] dark:focus:border-[${accentColor}] focus:ring-[${accentColor}] text-[#2A0F0F] dark:text-[#FFF8F0]`}
                />
              </div>
              {message && (
                <p className={`text-sm text-green-600 dark:text-green-400 text-center pt-2`}>{message}</p>
              )}
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center pt-2">{error}</p>
              )}
            </CardContent>
            <CardContent className="pt-4 pb-6">
              <Button
                type="submit"
                className={`w-full bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors disabled:opacity-70`}
                disabled={loading || !!message} // Disable button also if success message is shown
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </CardContent>
          </form>
          <CardContent className="text-center pb-6">
             <Link
                to="/login"
                className={`text-sm text-[${accentColor}] hover:text-[${accentHoverColor}] underline transition-colors`}
              >
                Back to Login
              </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}