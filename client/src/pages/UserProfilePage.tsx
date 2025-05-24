// src/pages/UserProfilePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import * as apiService from '../services/api.js';
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card.js";
import { Input } from "../components/ui/input.js";
import { Label } from "../components/ui/label.js";
import { Textarea } from "../components/ui/textarea.js";
import {
  UserCircle2 as UserIcon,
  Edit3,
  Save,
  KeyRound,
  Mail,
  MapPin,
  Home,
  Loader2,
  AlertCircle,
  Camera,
  X,
  Briefcase,
  CalendarDays,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '../lib/utils.js';


const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
const goldAccent = 'text-[#C5A467]';
const goldBg = 'bg-[#C5A467]';
const goldBgHover = 'hover:bg-[#B08F55]';
const goldBorder = 'border-[#C5A467]';
const lightBg = 'bg-[#FFF8F0]';
const darkBg = 'dark:bg-gray-950';
const lightCardBg = 'bg-white';
const darkCardBg = 'dark:bg-gray-900';
const inputBorder = 'border-gray-300 dark:border-gray-700';
const focusRing = 'focus:ring-1 focus:ring-offset-0 focus:ring-[#C5A467]';
const primaryButtonClasses = `${goldBg} ${goldBgHover} text-[#2A0F0F] font-semibold`;
const outlineButtonClasses = `${goldBorder} ${goldAccent} hover:bg-[#C5A467]/10 dark:hover:bg-[#C5A467]/15 hover:text-[#A07F44] dark:hover:text-[#E0D6C3]`;
const inputClasses = `h-9 rounded-md px-3 text-sm ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing} placeholder:text-gray-500 dark:placeholder:text-gray-400 disabled:opacity-70`;
const textAreaClasses = `rounded-md px-3 py-2 text-sm min-h-[80px] ${lightCardBg} ${darkCardBg} ${inputBorder} ${deepBrown} ${focusRing} placeholder:text-gray-500 dark:placeholder:text-gray-400 disabled:opacity-70`;
const labelClasses = `${deepBrown} text-sm font-medium`;

const UserProfilePage: React.FC = () => {
  const { currentUser: user, updateUserContextProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [church, setChurch] = useState('');
  const [bio, setBio] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const resetProfileFormFields = useCallback(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setCountry(user.country || '');
      setChurch(user.church || '');
      setBio(user.bio || '');
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [authLoading, user, navigate, location]);

  useEffect(() => {
    if (user) {
      resetProfileFormFields();
      setPageLoading(false);
    } else if (!authLoading) {
      setPageLoading(false);
    }
  }, [user, authLoading, resetProfileFormFields]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedCountry = country.trim();
    const trimmedChurch = church.trim();
    const trimmedBio = bio.trim();

    if (!trimmedFirstName || !trimmedLastName || !trimmedCountry) {
        setError("First name, last name, and country are required.");
        return;
    }

    setIsSavingProfile(true);

    const profileDataToUpdate: Partial<{firstName: string; lastName: string; country: string; church: string | null; bio: string | null;}> = {};

    if (trimmedFirstName !== (user?.firstName || '')) profileDataToUpdate.firstName = trimmedFirstName;
    if (trimmedLastName !== (user?.lastName || '')) profileDataToUpdate.lastName = trimmedLastName;
    if (trimmedCountry !== (user?.country || '')) profileDataToUpdate.country = trimmedCountry;
    
    if (trimmedChurch !== (user?.church || '')) {
        profileDataToUpdate.church = trimmedChurch === '' ? null : trimmedChurch;
    }
    if (trimmedBio !== (user?.bio || '')) {
        profileDataToUpdate.bio = trimmedBio === '' ? null : trimmedBio;
    }

    if (Object.keys(profileDataToUpdate).length === 0 ) {
        setSuccessMessage("No changes detected in profile information.");
        setIsEditingProfile(false);
        setIsSavingProfile(false);
        return;
    }

    try {
      const response = await apiService.updateUserProfile(profileDataToUpdate);
      if (response && response.user) {
        updateUserContextProfile(response.user);
        setSuccessMessage('Profile updated successfully!');
        setIsEditingProfile(false);
      } else {
        console.error("Profile update response was not in the expected format:", response);
        throw new Error("Profile update response was not in the expected format. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setIsSavingPassword(true);
    try {
      await apiService.changePassword({ newPassword });
      setSuccessMessage('Password changed successfully!');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
      setIsChangingPassword(false);
       setTimeout(() => {
         alert("For security reasons, after a password change, it's recommended to log out and log back in if you experience any issues.");
       }, 1000);
    } catch (err: any) {
        if (err.response?.data?.code === 'auth/requires-recent-login' || err.data?.code === 'auth/requires-recent-login') {
             setError('This operation requires you to have logged in recently. Please log out and log back in to change your password.');
        } else {
            setError(err.response?.data?.message || err.data?.message || err.message || 'Failed to change password.');
        }
    } finally {
      setIsSavingPassword(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    clearMessages();
    resetProfileFormFields();
  };

  const handleCancelChangePassword = () => {
    setIsChangingPassword(false);
    clearMessages();
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  };

  if (authLoading || pageLoading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${lightBg} ${darkBg} p-4`}>
        <Loader2 className={`h-12 w-12 animate-spin ${goldAccent}`} />
        <p className={`${midBrown} mt-4`}>Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
        <div className={`flex flex-col items-center justify-center min-h-screen ${lightBg} ${darkBg} p-4 text-center`}>
            <AlertCircle className={`h-12 w-12 ${goldAccent} mb-4`} />
            <p className={`${midBrown}`}>Could not load user profile.</p>
            <p className={`${midBrown} text-sm`}>You may need to log in again.</p>
            <Button onClick={() => navigate('/login', { replace: true })} className={`mt-6 ${primaryButtonClasses}`}>
                Go to Login
            </Button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${lightBg} ${darkBg} py-8 md:py-12`}>
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <header className="mb-8 md:mb-12 text-center md:text-left">
          <h1 className={`text-3xl md:text-4xl font-bold font-serif ${deepBrown}`}>My Profile</h1>
          <p className={`${midBrown} mt-1`}>Manage your account details and preferences.</p>
        </header>

        {error && (
            <div role="alert" className={cn("mb-6 p-3 rounded-md text-sm flex items-center justify-between gap-2", "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700")}>
                <div className="flex items-center gap-2"> <AlertCircle className="h-5 w-5 shrink-0"/> <span>{error}</span> </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-700 hover:bg-red-200 dark:text-red-300 dark:hover:bg-red-700/50" onClick={clearMessages}> <X className="h-4 w-4" /> </Button>
            </div>
        )}
        {successMessage && (
             <div role="alert" className={cn("mb-6 p-3 rounded-md text-sm flex items-center justify-between gap-2", "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700")}>
                <div className="flex items-center gap-2"> <CheckCircle className="h-5 w-5 shrink-0"/> <span>{successMessage}</span> </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-green-700 hover:bg-green-200 dark:text-green-300 dark:hover:bg-green-700/50" onClick={clearMessages}> <X className="h-4 w-4" /> </Button>
            </div>
        )}

        <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder} shadow-lg mb-8`}>
          <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6 border-b ${inputBorder}">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className={`h-20 w-20 md:h-24 md:w-24 rounded-full object-cover border-2 ${goldBorder}`} />
                ) : (
                  <UserIcon className={`h-20 w-20 md:h-24 md:w-24 ${goldAccent}`} />
                )}
              </div>
              <div>
                <CardTitle className={`${deepBrown} text-2xl font-serif`}>{user.displayName}</CardTitle>
                <CardDescription className={`${midBrown} flex items-center gap-1.5 mt-1`}>
                    <Mail className="h-4 w-4" /> {user.email}
                </CardDescription>
                 {user.role && <p className={`${midBrown} text-sm capitalize mt-0.5 flex items-center gap-1.5`}><Briefcase className="h-4 w-4"/> Role: {user.role}</p>}
              </div>
            </div>
            {!isEditingProfile && !isChangingPassword && (
              <Button variant="outline" onClick={() => { setIsEditingProfile(true); setIsChangingPassword(false); clearMessages(); }} className={`${outlineButtonClasses} mt-4 md:mt-0`}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            )}
          </CardHeader>

          {isEditingProfile ? (
            <form onSubmit={handleProfileUpdate}>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className={labelClasses}>First Name</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClasses} required disabled={isSavingProfile} />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className={labelClasses}>Last Name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClasses} required disabled={isSavingProfile} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country" className={labelClasses}>Country</Label>
                  <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} className={inputClasses} required disabled={isSavingProfile} />
                </div>
                <div>
                  <Label htmlFor="church" className={labelClasses}>Church/Affiliation (Optional)</Label>
                  <Input id="church" value={church} onChange={(e) => setChurch(e.target.value)} placeholder="e.g., Local Assembly Church" className={inputClasses} disabled={isSavingProfile} />
                </div>
                <div>
                    <Label htmlFor="bio" className={labelClasses}>Bio (Optional)</Label>
                    <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us a little about yourself..."
                        className={textAreaClasses}
                        disabled={isSavingProfile}
                        rows={3}
                    />
                </div>
              </CardContent>
              <CardFooter className="p-4 md:p-6 flex justify-end gap-2 border-t ${inputBorder}">
                <Button type="button" variant="outline" onClick={handleCancelEditProfile} className={outlineButtonClasses} disabled={isSavingProfile}>Cancel</Button>
                <Button type="submit" className={primaryButtonClasses} disabled={isSavingProfile}>
                  {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="p-4 md:p-6 space-y-3">
              <InfoItem icon={MapPin} label="Country" value={user.country} />
              <InfoItem icon={Home} label="Church/Affiliation" value={user.church} />
              <InfoItem icon={UserIcon} label="Bio" value={user.bio} isTextarea />
              {user.enrollment?.cohortId && <InfoItem icon={Briefcase} label="Enrollment" value={`Enrolled (Cohort: ${user.enrollment.cohortId})`} />}
              {user.createdAt && <InfoItem icon={CalendarDays} label="Joined" value={user.createdAt instanceof Date ? user.createdAt.toLocaleDateString() : String(user.createdAt)} />}
            </CardContent>
          )}
        </Card>

        <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder} shadow-lg`}>
          <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6 border-b ${inputBorder}">
            <CardTitle className={`${deepBrown} text-xl font-serif flex items-center gap-2`}><KeyRound className="h-5 w-5"/>Security</CardTitle>
            {!isChangingPassword && !isEditingProfile && (
                <Button variant="outline" onClick={() => { setIsChangingPassword(true); setIsEditingProfile(false); clearMessages(); }} className={outlineButtonClasses}>
                    Change Password
                </Button>
            )}
          </CardHeader>
          {isChangingPassword && (
            <form onSubmit={handleChangePassword}>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div>
                  <Label htmlFor="newPassword" className={labelClasses}>New Password</Label>
                  <div className="relative">
                    <Input 
                        id="newPassword" 
                        type={showNewPassword ? "text" : "password"} 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className={cn(inputClasses, "pr-10")} 
                        required 
                        disabled={isSavingPassword} 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn("absolute inset-y-0 right-0 h-full px-3 flex items-center focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0", deepBrown, "hover:bg-transparent dark:hover:bg-transparent")}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      disabled={isSavingPassword}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmNewPassword" className={labelClasses}>Confirm New Password</Label>
                  <div className="relative">
                    <Input 
                        id="confirmNewPassword" 
                        type={showConfirmNewPassword ? "text" : "password"} 
                        value={confirmNewPassword} 
                        onChange={(e) => setConfirmNewPassword(e.target.value)} 
                        className={cn(inputClasses, "pr-10")} 
                        required 
                        disabled={isSavingPassword} 
                    />
                     <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn("absolute inset-y-0 right-0 h-full px-3 flex items-center focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0", deepBrown, "hover:bg-transparent dark:hover:bg-transparent")}
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      aria-label={showConfirmNewPassword ? "Hide confirm new password" : "Show confirm new password"}
                      disabled={isSavingPassword}
                    >
                      {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 md:p-6 flex justify-end gap-2 border-t ${inputBorder}">
                <Button type="button" variant="outline" onClick={handleCancelChangePassword} className={outlineButtonClasses} disabled={isSavingPassword}>Cancel</Button>
                <Button type="submit" className={primaryButtonClasses} disabled={isSavingPassword}>
                  {isSavingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Update Password
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{icon: React.ElementType, label: string, value: string | null | undefined, isTextarea?: boolean}> = ({ icon: Icon, label, value, isTextarea }) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1.5">
        <dt className={`w-full sm:w-1/3 md:w-1/4 font-medium ${midBrown} text-sm flex items-center gap-2 shrink-0`}>
            <Icon className={`h-4 w-4 ${goldAccent}`} />
            {label}:
        </dt>
        {isTextarea ? (
            <dd className={`${deepBrown} text-sm whitespace-pre-wrap flex-1`}>{value || 'Not set'}</dd>
        ) : (
            <dd className={`${deepBrown} text-sm flex-1`}>{value || 'Not set'}</dd>
        )}
    </div>
);

export default UserProfilePage;