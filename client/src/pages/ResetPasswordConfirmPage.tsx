// src/pages/ResetPasswordConfirmPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Eye, EyeOff, ArrowLeft, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";

// Import Firebase client SDK modules
import { getAuth, verifyPasswordResetCode, confirmPasswordReset as firebaseConfirmPasswordReset } from "firebase/auth";
import { app as firebaseClientApp } from "../config/firebaseClient.config"; // Your client Firebase app instance

// Consistent color scheme
const accentColor = "#C5A467";
const accentHoverColor = "#B08F55";
const primaryTextLight = "text-[#2A0F0F]";
const secondaryTextLight = "text-[#4A1F1F]";
const inputBgLight = "bg-[#FFF8F0]";
const inputBorderLight = "border-[#E0D6C3]";

const primaryTextDark = "dark:text-[#FFF8F0]";
const secondaryTextDark = "dark:text-[#E0D6C3]/90";
const inputBgDark = "dark:bg-gray-800";
const inputBorderDark = "dark:border-gray-700";

const iconColor = `text-gray-500 hover:text-[${accentColor}] dark:hover:text-[${accentColor}]`;
const focusRing = `focus:ring-[${accentColor}]`;
const focusBorder = `focus:border-[${accentColor}] dark:focus:border-[${accentColor}]`;

const buttonPrimaryBg = `bg-[${accentColor}] hover:bg-[${accentHoverColor}]`;
const buttonPrimaryText = `text-[#2A0F0F]`;

export default function ResetPasswordConfirmPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [oobCode, setOobCode] = useState<string | null>(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(true); // For initial code verification
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [emailForReset, setEmailForReset] = useState<string | null>(null); // Store email from verified code

  const [loading, setLoading] = useState(false); // For password reset submission
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const authClient = getAuth(firebaseClientApp);

  // Effect to get and verify oobCode from URL
  const verifyCode = useCallback(async (code: string) => {
    setIsVerifyingCode(true);
    setError(null);
    try {
      const email = await verifyPasswordResetCode(authClient, code);
      setEmailForReset(email); // Store the email associated with the code
      setIsCodeValid(true);
      setMessage(`Enter a new password for ${email}.`); // Inform user
    } catch (err: any) {
      setIsCodeValid(false);
      if (err.code === "auth/invalid-action-code") {
        setError("Invalid or expired password reset link. Please request a new one.");
      } else {
        setError("Failed to verify reset link. Please try again or request a new link.");
      }
      console.error("Error verifying password reset code:", err);
    } finally {
      setIsVerifyingCode(false);
    }
  }, [authClient]);

  useEffect(() => {
    const codeFromUrl = searchParams.get("oobCode");
    if (codeFromUrl) {
      setOobCode(codeFromUrl);
      verifyCode(codeFromUrl);
    } else {
      setError("Password reset link is incomplete. (Missing code). Please use the link from your email.");
      setIsVerifyingCode(false);
      setIsCodeValid(false);
    }
  }, [searchParams, verifyCode]);


  const handleGoBack = () => {
    navigate("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setMessage(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!oobCode || !isCodeValid) {
      setError("Password reset token is invalid or missing. Please use a valid link from your email.");
      return;
    }

    setLoading(true);
    try {
      await firebaseConfirmPasswordReset(authClient, oobCode, newPassword);
      setMessage("Password has been reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login", { state: { passwordResetSuccess: true, email: emailForReset } });
      }, 3000);
    } catch (err: any) {
      console.error("Error confirming password reset:", err);
      if (err.code === "auth/weak-password") {
        setError("The new password is too weak. Please choose a stronger one.");
      } else if (err.code === "auth/invalid-action-code") {
        setError("The reset link is invalid or has expired. Please request a new one.");
        setIsCodeValid(false); // Mark code as invalid now
      } else if (err.code === "auth/user-disabled") {
        setError("This account has been disabled.");
      } else if (err.code === "auth/user-not-found") {
        setError("User not found. The account may have been deleted.");
      } else {
        setError(err.message || "Failed to reset password. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderFeedback = () => {
    if (message) {
      return (
        <div className="flex items-center justify-center text-sm text-green-600 dark:text-green-400 pt-2">
          <ShieldCheck className="h-5 w-5 mr-2" />
          {message}
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center justify-center text-sm text-red-600 dark:text-red-400 pt-2">
          <ShieldAlert className="h-5 w-5 mr-2" />
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
              Set New Password
            </CardTitle>
            {!isVerifyingCode && isCodeValid && (
              <CardDescription className={`${secondaryTextLight} ${secondaryTextDark}`}>
                Create a new password for your account.
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-4 pt-2 pb-6">
            {isVerifyingCode && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className={`h-8 w-8 animate-spin text-[${accentColor}]`} />
                <p className={`mt-3 ${secondaryTextLight} ${secondaryTextDark}`}>Verifying reset link...</p>
              </div>
            )}

            {!isVerifyingCode && isCodeValid && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword" className={`${primaryTextLight} ${primaryTextDark} font-medium`}>New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className={`${inputBgLight} ${inputBorderLight} ${inputBgDark} ${inputBorderDark} ${focusBorder} ${focusRing} ${primaryTextLight} ${primaryTextDark} pr-10 w-full`}
                      aria-describedby="password-constraints"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute inset-y-0 right-0 flex items-center pr-3 ${iconColor}`}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p id="password-constraints" className={`text-xs mt-1 ${secondaryTextLight} ${secondaryTextDark}`}>Must be at least 6 characters long.</p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className={`${primaryTextLight} ${primaryTextDark} font-medium`}>Confirm New Password</Label>
                   <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className={`${inputBgLight} ${inputBorderLight} ${inputBgDark} ${inputBorderDark} ${focusBorder} ${focusRing} ${primaryTextLight} ${primaryTextDark} pr-10 w-full`}
                    />
                     <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute inset-y-0 right-0 flex items-center pr-3 ${iconColor}`}
                      aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {renderFeedback()}

                <div className="pt-2">
                  <Button
                    type="submit"
                    className={`w-full ${buttonPrimaryBg} ${buttonPrimaryText} font-semibold transition-colors disabled:opacity-70`}
                    disabled={loading || !!message || !isCodeValid}
                  >
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {loading ? 'Resetting...' : 'Set New Password'}
                  </Button>
                </div>
              </form>
            )}

            {!isVerifyingCode && !isCodeValid && (
              <div className="text-center py-4">
                {renderFeedback()} {/* Display any error from code verification */}
                <p className={`mt-4 ${secondaryTextLight} ${secondaryTextDark}`}>
                  If the link is invalid or has expired, please request a new one.
                </p>
                <Link
                    to="/forgot-password"
                    className={`mt-4 inline-block text-sm text-[${accentColor}] hover:text-[${accentHoverColor}] underline transition-colors font-medium`}
                >
                    Request New Reset Link
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}