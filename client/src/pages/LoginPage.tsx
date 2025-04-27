import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const accentColor = "#C5A467";
const accentHoverColor = "#B08F55";
const primaryTextLight = "text-[#2A0F0F]";
const secondaryTextLight = "text-[#4A1F1F]";
const primaryTextDark = "dark:text-[#FFF8F0]";
const secondaryTextDark = "dark:text-[#E0D6C3]/90";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (loading) return;

    try {
      const loggedInUser = await login(formData.email, formData.password);

      if (loggedInUser?.role === 'admin') {
        console.log('Admin logged in, navigating to /admin');
        navigate("/admin", { replace: true });
      } else {
        console.log(`User role ${loggedInUser?.role || 'unknown'}, navigating to /dashboard`);
        navigate("/dashboard", { replace: true });
      }

    } catch (error: any) {
       let message = "Invalid email or password. Please try again.";
       if (error?.message) {
            message = error.message;
       } else if (error?.response?.data?.message) {
            message = error.response.data.message;
       }
      setFormError(message);
      console.error("Login page error:", error); 
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
            <CardTitle className={`text-2xl font-serif ${primaryTextLight} ${primaryTextDark}`}>
              Welcome Back
            </CardTitle>
            <CardDescription className={`${secondaryTextLight} ${secondaryTextDark}`}>
              Log in to your student account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-2 pb-6"> 
              <div className="space-y-2">
                <Label htmlFor="email" className={`${primaryTextLight} ${primaryTextDark} font-medium`}>Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className={`bg-[#FFF8F0] dark:bg-gray-800 border-[#E0D6C3] dark:border-gray-700 focus:border-[${accentColor}] dark:focus:border-[${accentColor}] focus:ring-[${accentColor}] ${primaryTextLight} ${primaryTextDark}`}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className={`${primaryTextLight} ${primaryTextDark} font-medium`}>Password</Label>
                  <Link
                    to="/forgot-password"
                    className={`text-sm text-[${accentColor}] hover:text-[${accentHoverColor}] underline transition-colors`}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    className={`bg-[#FFF8F0] dark:bg-gray-800 border-[#E0D6C3] dark:border-gray-700 focus:border-[${accentColor}] dark:focus:border-[${accentColor}] focus:ring-[${accentColor}] ${primaryTextLight} ${primaryTextDark} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className={`absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-[${accentColor}] dark:hover:text-[${accentColor}]`}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                 <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className={`h-4 w-4 rounded border-[#B08F55] dark:border-gray-600 text-[${accentColor}] focus:ring-[${accentColor}] focus:ring-offset-0 bg-[#FFF8F0] dark:bg-gray-800`}
                  />
                <label htmlFor="rememberMe" className={`text-sm ${secondaryTextLight} ${secondaryTextDark}`}>
                  Remember me
                </label>
              </div>
               {formError && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center pt-2">{formError}</p>
              )}
            </CardContent>
            <CardFooter className="pt-4 pb-6">
              <Button
                type="submit"
                className={`w-full bg-[${accentColor}] hover:bg-[${accentHoverColor}] text-[#2A0F0F] font-semibold transition-colors disabled:opacity-70`}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log in'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <div className={`mt-6 text-center text-sm ${secondaryTextLight} ${secondaryTextDark}`}>
          Don't have an account?{" "}
          <Link to="/register" className={`text-[${accentColor}] hover:text-[${accentHoverColor}] underline font-medium transition-colors`}>
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}