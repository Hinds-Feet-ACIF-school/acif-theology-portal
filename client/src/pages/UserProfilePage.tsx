// src/pages/UserProfilePage.tsx
import React, { useState, useEffect } from 'react'; // Removed useCallback as it wasn't strictly necessary here
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation for redirect state
import { useAuth } from '../context/AuthContext.js';
import * as apiService from '../services/api.js';
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card.js";
import { Input } from "../components/ui/input.js";
import { Label } from "../components/ui/label.js";
// import { Textarea } from "../components/ui/textarea.js"; // For bio - commented out for now
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
  // Camera, // Commented out as profile picture upload isn't implemented yet
  X // Added X icon
} from 'lucide-react';

// Color Constants
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
const labelClasses = `${deepBrown} text-sm font-medium`;

const UserProfilePage: React.FC = () => { // Added React.FC for typing
  const { currentUser: user, fetchCurrentUser, updateUserContextProfile, loading: authLoading } = useAuth(); // Use currentUser and alias to user
  const navigate = useNavigate();
  const location = useLocation(); // For redirect state

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // Separate loading state for page data
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [church, setChurch] = useState('');
  // const [bio, setBio] = useState(''); // Commented out bio for now

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      // If auth is done loading and still no user, redirect.
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [authLoading, user, navigate, location]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setCountry(user.country || '');
      setChurch(user.church || '');
      // setBio(user.bio || ''); // Commented out bio for now
      setPageLoading(false); // Page data is loaded
    } else if (!authLoading) { // If auth is done and no user, page loading might also be considered done (leading to redirect)
      setPageLoading(false);
    }
  }, [user, authLoading]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSavingProfile(true);

    const profileData = {
      firstName,
      lastName,
      country,
      church: church || null,
    };

    try {
      const response = await apiService.updateUserProfile(profileData);
      if (response && response.user) { // Check if response.user exists
        updateUserContextProfile(response.user);
        setSuccessMessage('Profile updated successfully!');
        setIsEditingProfile(false);
      } else {
        throw new Error("Profile update response was not in the expected format.");
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
      setSuccessMessage('Password changed successfully! You might need to log in again if your session was invalidated.');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsChangingPassword(false);
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

  if (authLoading || pageLoading) { // Check both authLoading from context and pageLoading
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${lightBg} ${darkBg} p-4`}>
        <Loader2 className={`h-12 w-12 animate-spin ${goldAccent}`} />
        <p className={`${midBrown} mt-4`}>Loading your profile...</p>
      </div>
    );
  }

  if (!user) { // Should be caught by useEffect redirect, but good as a safeguard
    return (
        <div className={`flex flex-col items-center justify-center min-h-screen ${lightBg} ${darkBg} p-4`}>
            <p className={`${midBrown} mt-4`}>Redirecting to login...</p>
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
            <div role="alert" className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-md text-sm flex items-center justify-between gap-2">
                <div className="flex items-center gap-2"> <AlertCircle className="h-5 w-5 shrink-0"/> <span>{error}</span> </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-700 hover:bg-red-200 dark:text-red-300 dark:hover:bg-red-700/50" onClick={clearMessages}> <X className="h-4 w-4" /> </Button>
            </div>
        )}
        {successMessage && (
             <div role="alert" className="mb-6 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 rounded-md text-sm flex items-center justify-between gap-2">
                <div className="flex items-center gap-2"> <AlertCircle className="h-5 w-5 shrink-0"/> <span>{successMessage}</span> </div> {/* Assuming AlertCircle is still desired for success */}
                <Button variant="ghost" size="icon" className="h-6 w-6 text-green-700 hover:bg-green-200 dark:text-green-300 dark:hover:bg-green-700/50" onClick={clearMessages}> <X className="h-4 w-4" /> </Button>
            </div>
        )}

        <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder} shadow-lg mb-8`}>
          <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6 border-b ${inputBorder}">
            <div className="flex items-center gap-4">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className={`h-20 w-20 md:h-24 md:w-24 rounded-full object-cover border-2 ${goldBorder}`} />
              ) : (
                <UserIcon className={`h-20 w-20 md:h-24 md:w-24 ${goldAccent}`} />
              )}
              <div>
                <CardTitle className={`${deepBrown} text-2xl font-serif`}>{user.displayName}</CardTitle>
                <CardDescription className={`${midBrown} flex items-center gap-1.5 mt-1`}>
                    <Mail className="h-4 w-4" /> {user.email}
                </CardDescription>
                 {/* {user.role && <p className={`${midBrown} text-sm capitalize mt-0.5`}>Role: {user.role}</p>} */}
              </div>
            </div>
            {!isEditingProfile && (
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
              </CardContent>
              <CardFooter className="p-4 md:p-6 flex justify-end gap-2 border-t ${inputBorder}">
                <Button type="button" variant="outline" onClick={() => { setIsEditingProfile(false); clearMessages(); }} className={outlineButtonClasses} disabled={isSavingProfile}>Cancel</Button>
                <Button type="submit" className={primaryButtonClasses} disabled={isSavingProfile}>
                  {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="p-4 md:p-6 space-y-3">
              <InfoItem icon={MapPin} label="Country" value={user.country || 'Not set'} />
              <InfoItem icon={Home} label="Church/Affiliation" value={user.church || 'Not set'} />
              {user.enrollment?.cohortId && <InfoItem icon={UserIcon} label="Enrollment" value={`Enrolled (Cohort: ${user.enrollment.cohortId})`} />}
              {user.createdAt && <InfoItem icon={UserIcon} label="Joined" value={typeof user.createdAt === 'string' ? new Date(user.createdAt).toLocaleDateString() : user.createdAt?.toLocaleDateString() || 'N/A'} />}
            </CardContent>
          )}
        </Card>

        <Card className={`${lightCardBg} ${darkCardBg} border ${inputBorder} shadow-lg`}>
          <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6 border-b ${inputBorder}">
            <CardTitle className={`${deepBrown} text-xl font-serif flex items-center gap-2`}><KeyRound className="h-5 w-5"/>Security</CardTitle>
            {!isChangingPassword && (
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
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClasses} required disabled={isSavingPassword} />
                </div>
                <div>
                  <Label htmlFor="confirmNewPassword" className={labelClasses}>Confirm New Password</Label>
                  <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={inputClasses} required disabled={isSavingPassword} />
                </div>
              </CardContent>
              <CardFooter className="p-4 md:p-6 flex justify-end gap-2 border-t ${inputBorder}">
                <Button type="button" variant="outline" onClick={() => { setIsChangingPassword(false); clearMessages();}} className={outlineButtonClasses} disabled={isSavingPassword}>Cancel</Button>
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

const InfoItem: React.FC<{icon: React.ElementType, label: string, value: string, isTextarea?: boolean}> = ({ icon: Icon, label, value, isTextarea }) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1.5">
        <dt className={`w-full sm:w-1/3 md:w-1/4 font-medium ${midBrown} text-sm flex items-center gap-2 shrink-0`}>
            <Icon className={`h-4 w-4 ${goldAccent}`} />
            {label}:
        </dt>
        {isTextarea ? (
            <dd className={`${deepBrown} text-sm whitespace-pre-wrap flex-1`}>{value}</dd>
        ) : (
            <dd className={`${deepBrown} text-sm flex-1`}>{value}</dd>
        )}
    </div>
);

export default UserProfilePage;