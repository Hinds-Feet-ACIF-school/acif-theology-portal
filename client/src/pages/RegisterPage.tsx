import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.js"; // Assuming .ts or .tsx
import { Input } from "../components/ui/input.js";   // Assuming .ts or .tsx
import { Label } from "../components/ui/label.js";   // Assuming .ts or .tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card.js"; // Assuming .ts or .tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select.js"; // Assuming .ts or .tsx
import { Checkbox } from "../components/ui/checkbox.js"; // Assuming .ts or .tsx
import { useAuth } from "../context/AuthContext.js"; // Assuming .ts or .tsx
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react"; // Added Loader2

// --- Define Country List (Outside Component) ---
const allCountries: string[] = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
].sort(); // Sort alphabetically

// --- Color Constants ---
const accentColor = "#C5A467";
const accentHoverColor = "#B08F55";
const primaryTextLight = "text-[#2A0F0F]";
const secondaryTextLight = "text-[#4A1F1F]";
const primaryTextDark = "dark:text-[#FFF8F0]";
const secondaryTextDark = "dark:text-[#E0D6C3]/90";
const mutedTextLight = "text-gray-500";
const mutedTextDark = "dark:text-gray-400";
const inputBgLight = "bg-[#FFF8F0]";
const inputBgDark = "dark:bg-gray-800";
const contentBgLight = "bg-white";
const contentBgDark = "dark:bg-gray-900";
const inputBorderLight = "border-[#E0D6C3]";
const inputBorderDark = "dark:border-gray-700";
const focusRingAccent = `focus:ring-[${accentColor}]`;
const focusBorderAccent = `focus:border-[${accentColor}] dark:focus:border-[${accentColor}]`;
const cardBgLight = "bg-white";
const cardBgDark = "dark:bg-gray-900";
const cardBorder = `border border-[#C5A467]/20 dark:border-[#C5A467]/30`;

// --- Component ---
const RegisterPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    church: "",
    intake: "",
    agreeTerms: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
     if (name === "country" && value) {
      setFormError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (step !== 3) return;

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      setStep(1);
      return;
    }
    if (!formData.agreeTerms) {
      setFormError("You must agree to the terms and conditions");
      return;
    }
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || formData.password.length < 6) {
      setFormError("Please complete all required account fields from Step 1.");
      setStep(1);
      return;
    }
     if (!formData.country) {
        setFormError("Please select your country from Step 2.");
        setStep(2);
        return;
     }

    if (loading) return;

    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        church: formData.church || null,
      };
      console.log("Submitting Registration Data:", registrationData);
      await register(registrationData);
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      const message = error.message || "Registration failed. Please check your details.";
      setFormError(message);
      console.error("Registration Submission Error:", error);
    }
  };

  const nextStep = () => {
     if (step === 1) {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setFormError("Please fill all required fields.");
            return;
        }
        if (formData.password.length < 6) {
            setFormError("Password must be at least 6 characters.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setFormError("Passwords do not match.");
            return;
        }
     }
     if (step === 2 && !formData.country) {
        setFormError("Please select your country.");
        return;
     }
     setFormError(null);
     setStep((s) => Math.min(s + 1, 3));
  };

  const prevStep = () => {
    setFormError(null);
    setStep((s) => Math.max(s - 1, 1));
  }

  // --- Class Definitions ---
  const inputClasses = `flex h-10 w-full rounded-md border ${inputBorderLight} ${inputBorderDark} ${inputBgLight} ${inputBgDark} px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}] disabled:cursor-not-allowed disabled:opacity-50 ${primaryTextLight} ${primaryTextDark} shadow-sm transition-colors`;
  const inputWithIconPadding = "pr-10";
  const selectTriggerClasses = `${inputClasses} flex items-center justify-between w-full`;
  const selectContentClasses = `relative z-50 max-h-60 min-w-[8rem] overflow-y-auto rounded-md border ${cardBorder} ${contentBgLight} ${contentBgDark} ${primaryTextLight} ${primaryTextDark} shadow-md animate-in fade-in-80`;
  const selectItemClasses = `relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-[#C5A467]/10 dark:focus:bg-[#C5A467]/20 data-[state=checked]:font-semibold data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-[#C5A467]/5 dark:hover:bg-[#C5A467]/10`;
  const buttonPrimaryClasses = `bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors duration-200 inline-flex items-center justify-center rounded-md text-sm ring-offset-background h-10 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}]`;
  const buttonOutlineClasses = `border border-[#4A1F1F]/50 dark:border-[#E0D6C3]/50 ${secondaryTextLight} ${secondaryTextDark} hover:text-[${accentColor}] hover:border-[${accentColor}] dark:hover:text-[${accentColor}] dark:hover:border-[${accentColor}] hover:bg-transparent dark:hover:bg-transparent transition-colors duration-200 inline-flex items-center justify-center rounded-md text-sm ring-offset-background h-10 px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-[${accentColor}]`;

  return (
    <div className="flex flex-col items-center min-h-screen py-12 bg-[#FFF8F0] dark:bg-gray-950 px-4">
      <div className="container max-w-2xl px-4 md:px-6">

        {/* Back Button */}
        <div className="w-full mb-6 flex justify-start">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`group flex items-center gap-1 ${secondaryTextLight} ${secondaryTextDark} hover:text-[${accentColor}] dark:hover:text-[${accentColor}] transition-colors duration-200 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[${accentColor}] p-1 rounded-md -ml-1`}
            aria-label="Go back"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-transparent group-hover:border-[#C5A467]/60 dark:group-hover:border-[#C5A467]/60 group-hover:bg-[#C5A467]/10 dark:group-hover:bg-[#C5A467]/20 transition-colors duration-150">
              <ArrowLeft size={16} strokeWidth={2.5} />
            </span>
            <span>Back</span>
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col items-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h1 className={`text-3xl font-bold font-serif tracking-tight sm:text-4xl ${primaryTextLight} ${primaryTextDark}`}>
              Register for Certificate Program
            </h1>
            <p className={`mx-auto max-w-[700px] md:text-xl ${secondaryTextLight} ${secondaryTextDark}`}>
              Complete the registration form to join our next cohort
            </p>
          </div>
        </div>

        <div className="mx-auto w-full">
          {/* Stepper */}
          <div className="flex items-start justify-between mb-8 max-w-md mx-auto">
            {[1, 2, 3].map((num, index, arr) => (
              <React.Fragment key={num}>
                <div className={`flex flex-col items-center transition-colors duration-300 ${step >= num ? `text-[${accentColor}]` : `${mutedTextLight} ${mutedTextDark}`}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 font-semibold transition-colors duration-300 ${step >= num ? `bg-[${accentColor}] text-[#2A0F0F]` : `bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400`}`}
                  >
                    {num}
                  </div>
                  <span className="text-xs text-center font-medium">
                    {num === 1 ? "Account" : num === 2 ? "Profile" : "Confirm"}
                  </span>
                </div>
                {index < arr.length - 1 && (
                  <div className="flex-1 px-2 pt-4">
                    <div className={`h-1 w-full rounded transition-colors duration-300 ${step > num ? `bg-[${accentColor}]` : "bg-gray-200 dark:bg-gray-700"}`}></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form Card */}
          <Card className={`${cardBgLight} ${cardBgDark} ${cardBorder} shadow-lg max-w-md mx-auto`}>
            <form onSubmit={handleSubmit} noValidate>

              {/* Step 1: Account */}
              {step === 1 && (
                <>
                  <CardHeader>
                    <CardTitle className={`${primaryTextLight} ${primaryTextDark} font-serif`}>Create Your Account</CardTitle>
                    <CardDescription className={`${secondaryTextLight} ${secondaryTextDark}`}>
                      Enter your details to create your student account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formError && <p role="alert" className="text-red-600 dark:text-red-400 text-sm font-medium">{formError}</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName" className={`${primaryTextLight} ${primaryTextDark} text-sm font-medium`}>First Name</Label>
                        <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required aria-required="true" className={inputClasses} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className={`${primaryTextLight} ${primaryTextDark} text-sm font-medium`}>Last Name</Label>
                        <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required aria-required="true" className={inputClasses} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className={`${primaryTextLight} ${primaryTextDark} text-sm font-medium`}>Email</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required aria-required="true" className={inputClasses} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className={`${primaryTextLight} ${primaryTextDark} text-sm font-medium`}>Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          required
                          aria-required="true"
                          className={`${inputClasses} ${inputWithIconPadding}`}
                          minLength={6}
                          aria-describedby="password-hint"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer focus:outline-none rounded-full"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <p id="password-hint" className="text-xs text-gray-500 dark:text-gray-400">Minimum 6 characters.</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className={`${primaryTextLight} ${primaryTextDark} text-sm font-medium`}>Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          aria-required="true"
                          className={`${inputClasses} ${inputWithIconPadding}`}
                          aria-invalid={!!(formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword)}
                          aria-describedby="confirmPassword-error"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer focus:outline-none rounded-full"
                          aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p id="confirmPassword-error" role="alert" className="text-xs text-red-600 dark:text-red-400 pt-1 font-medium">Passwords do not match.</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end pt-6">
                    <Button
                      type="button"
                      onClick={nextStep}
                      className={buttonPrimaryClasses}
                      disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.password}
                    >
                      Next
                    </Button>
                  </CardFooter>
                </>
              )}

              {/* Step 2: Profile */}
              {step === 2 && (
                <>
                  <CardHeader>
                    <CardTitle className={`${primaryTextLight} ${primaryTextDark} font-serif`}>Your Profile</CardTitle>
                    <CardDescription className={`${secondaryTextLight} ${secondaryTextDark}`}>Tell us more about yourself</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formError && <p role="alert" className="text-red-600 dark:text-red-400 text-sm font-medium">{formError}</p>}
                    <div className="space-y-1.5">
                      <Label htmlFor="country" className={`${primaryTextLight} ${primaryTextDark} text-sm font-medium`}>Country</Label>
                      <Select value={formData.country} onValueChange={(value: string) => handleSelectChange("country", value)} required>
                        <SelectTrigger id="country" className={selectTriggerClasses} aria-required="true">
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent className={selectContentClasses}>
                          {allCountries.map((countryName) => (
                            <SelectItem key={countryName} value={countryName} className={selectItemClasses}>
                              {countryName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="church" className={`${primaryTextLight} ${primaryTextDark} text-sm font-medium`}>Church Affiliation <span className="text-xs text-gray-400">(Optional)</span></Label>
                      <Input id="church" name="church" value={formData.church} onChange={handleChange} placeholder="Your local church or ministry" className={inputClasses} />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-6">
                    <Button variant="outline" type="button" onClick={prevStep} className={buttonOutlineClasses}>
                      Back
                    </Button>
                    <Button
                       type="button"
                       onClick={nextStep}
                       className={buttonPrimaryClasses}
                       disabled={!formData.country}
                    >
                      Next
                    </Button>
                  </CardFooter>
                </>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && (
                <>
                  <CardHeader>
                    <CardTitle className={`${primaryTextLight} ${primaryTextDark} font-serif`}>Confirm & Submit</CardTitle>
                    <CardDescription className={`${secondaryTextLight} ${secondaryTextDark}`}>Review your information before submitting</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className={`text-sm ${primaryTextLight} ${primaryTextDark}`}><strong>Full Name:</strong> {formData.firstName} {formData.lastName}</div>
                    <div className={`text-sm ${primaryTextLight} ${primaryTextDark}`}><strong>Email:</strong> {formData.email}</div>
                    <div className={`text-sm ${primaryTextLight} ${primaryTextDark}`}><strong>Country:</strong> {formData.country}</div>
                    <div className={`text-sm ${primaryTextLight} ${primaryTextDark}`}><strong>Church:</strong> {formData.church || 'N/A'}</div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-2 pt-4">
                      <Checkbox
                        id="agreeTerms"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        // Type the 'checked' parameter explicitly
                        onCheckedChange={(checked: boolean) => handleSelectChange("agreeTerms", !!checked)}
                        required
                        aria-required="true"
                        className={`border-[#C5A467]/50 data-[state=checked]:bg-[${accentColor}] data-[state=checked]:text-[#2A0F0F] focus-visible:ring-[${accentColor}] mt-0.5`}
                      />
                      <Label htmlFor="agreeTerms" className={`text-xs ${mutedTextLight} ${mutedTextDark} leading-snug`}>
                        I agree to the{" "}
                        <Link to="/terms" target="_blank" rel="noopener noreferrer" className={`underline hover:text-[${accentColor}] transition-colors`}>
                          terms and conditions
                        </Link>
                         {" "}and{" "}
                         <Link to="/privacy" target="_blank" rel="noopener noreferrer" className={`underline hover:text-[${accentColor}] transition-colors`}>
                           privacy policy
                         </Link>.
                      </Label>
                    </div>
                    {formError && <p role="alert" className="text-red-600 dark:text-red-400 text-sm font-medium pt-2">{formError}</p>}
                  </CardContent>
                  <CardFooter className="flex justify-between pt-6">
                    <Button variant="outline" type="button" onClick={prevStep} className={buttonOutlineClasses}>
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className={buttonPrimaryClasses}
                      disabled={loading || !formData.agreeTerms}
                    >
                      {loading ? (
                         <span className="flex items-center">
                           {/* Use Loader2 from lucide-react */}
                           <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#2A0F0F]" />
                           Submitting...
                         </span>
                      ) : (
                         "Submit Registration"
                      )}
                    </Button>
                  </CardFooter>
                </>
              )}
            </form>
          </Card>
        </div>

        {/* Login Link */}
        <div className="text-center mt-8">
          <p className={`${mutedTextLight} ${mutedTextDark} text-sm`}>
            Already have an account?{" "}
            <Link to="/login" className={`${secondaryTextLight} ${secondaryTextDark} hover:text-[${accentColor}] dark:hover:text-[${accentColor}] font-medium transition-colors`}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;