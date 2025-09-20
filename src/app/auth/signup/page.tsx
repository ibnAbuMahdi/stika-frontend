"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "client" as "client" | "agency",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validation
    const newErrors: {[key: string]: string} = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.username) newErrors.username = "Company name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.userType) newErrors.userType = "Please select account type";
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to terms & conditions";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // Check if user selected "client" - redirect to client signup flow
    if (formData.userType === "client") {
      // Pass form data to client signup via URL parameters
      const clientData = {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        agreeToTerms: formData.agreeToTerms
      };
      
      const params = new URLSearchParams({
        formData: JSON.stringify(clientData)
      });
      
      router.push(`/client-signup?${params.toString()}`);
      setIsLoading(false);
      return;
    }

    // Continue with agency signup flow
    try {
      // Import API service
      const { apiService } = await import('@/lib/api');
      
      const response = await apiService.signup(formData);
      
      if (response.success) {
        // Show success message and redirect to email verification notice
        alert(`Account created successfully! Please check your email (${formData.email}) to activate your account.`);
        
        // Redirect to login page with email parameter
        window.location.href = `/auth/login?email=${encodeURIComponent(formData.email)}&verification_sent=true`;
      } else {
        // Handle validation errors from backend
        if (response.errors && Object.keys(response.errors).length > 0) {
          // Display field-specific errors
          setErrors(response.errors);
        } else {
          // Display general error message if no specific field errors
          setErrors({ general: response.message || "Signup failed. Please try again." });
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setErrors({ general: error.message || "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative"
        style={{
          backgroundImage: "url('/keke-bg.png')",
          backgroundSize: "90%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-purple-800/80"></div>
        
        {/* Top content */}
        <div className="text-center text-white relative z-10">
          <h1 className="text-4xl font-bold mb-4">Welcome to Stika</h1>
          <p className="text-lg opacity-90">
            Turning tricycles into mobile billboards
          </p>
        </div>

        {/* Bottom content */}
        <div className="text-center text-white relative z-10">
          <h2 className="text-3xl font-bold mb-4">
            Where Ads Meet the Road.
          </h2>
          <p className="text-base opacity-90">
            Transform everyday commutes into dynamic advertising opportunities with Stika.
          </p>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Button 
            variant="ghost" 
            className="mb-8 p-0 h-auto font-normal text-gray-600"
            asChild
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>

          <Card className="p-8 border-0 shadow-lg">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign up</h1>
              <p className="text-gray-600">
                Have an account already?{" "}
                <Link href="/auth/login" className="text-purple-600 font-medium hover:underline">
                  Login
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Nnaji Musa Tunde"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Example Company"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Example@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={errors.email ? "border-red-500 pr-10" : "pr-10"}
                  />
                  {formData.email && !errors.email && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-600" />
                  )}
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Create password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Must contain 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Must contain 8 characters"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.userType === "client"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, userType: "client" }))}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🏢</div>
                      <h3 className="font-medium text-gray-900">Client</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        I want to advertise my business
                      </p>
                    </div>
                  </div>

                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.userType === "agency"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, userType: "agency" }))}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🚗</div>
                      <h3 className="font-medium text-gray-900">Agency</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        I manage advertising campaigns
                      </p>
                    </div>
                  </div>
                </div>
                {errors.userType && (
                  <p className="text-red-500 text-sm mt-2">{errors.userType}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                  I agree to{" "}
                  <a 
                    href="/terms-and-conditions.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline"
                  >
                    terms & conditions
                  </a>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>
              )}

              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-sm text-center font-medium">{errors.general}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}