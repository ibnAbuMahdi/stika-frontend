"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [autoLogoutMessage, setAutoLogoutMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if user was auto-logged out
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auto_logout') === 'true') {
      setAutoLogoutMessage('Your session expired and you were automatically logged out. Please login again.');
      
      // Clean up URL parameters
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Basic validation
    const newErrors: {[key: string]: string} = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Import API service
      const { apiService } = await import('@/lib/api');
      
      const response = await apiService.login(formData);
      
      if (response.success && response.access_token) {
        // Store authentication tokens
        apiService.setAuthTokens(response.access_token, response.refresh_token);
        
        // Store user data
        localStorage.setItem("user", JSON.stringify(response.user));
        
        // Redirect based on user type - only allow valid user types
        if (response.user.user_type === "agency" || response.user.user_type === "agency_admin") {
          window.location.href = "/dashboard";
        } else if (response.user.user_type === "client") {
          window.location.href = "/client-dashboard";
        } else {
          // Invalid user type - don't log them in
          apiService.clearAuthTokens();
          localStorage.removeItem("user");
          setErrors({ general: "Invalid user type. This account cannot access the web portal." });
        }
      } else {
        // Handle specific error cases
        if (response.requires_verification) {
          setErrors({ 
            general: response.message || "Please verify your email address before logging in.",
            verification: "true"
          });
        } else {
          setErrors({ general: response.message || "Login failed. Please check your credentials." });
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle different types of errors with user-friendly messages
      let errorMessage = "Something went wrong. Please try again.";
      
      if (error.message) {
        if (error.message.includes("Server connection failed") || 
            error.message.includes("backend service")) {
          errorMessage = "Unable to connect to server. Please contact support.";
        } else if (error.message.includes("Network error") || 
                   error.message.includes("internet connection")) {
          errorMessage = "Network connection failed. Please check your internet connection.";
        } else if (error.message.includes("Service not found") || 
                   error.message.includes("404")) {
          errorMessage = "Login service unavailable. Please contact support.";
        } else if (error.message.includes("Server error") || 
                   error.message.includes("500")) {
          errorMessage = "Server temporarily unavailable. Please try again later.";
        } else if (error.message.includes("verify") || 
                   error.message.includes("activation")) {
          errorMessage = error.message; // Keep verification messages as-is
        } else if (error.message.includes("Invalid credentials") || 
                   error.message.includes("email") || 
                   error.message.includes("password")) {
          errorMessage = error.message; // Keep credential error messages
        } else {
          // Use the API error message if it's user-friendly
          errorMessage = error.message;
        }
      }
      
      if (errorMessage.includes("verify") || errorMessage.includes("activation")) {
        setErrors({ 
          general: errorMessage,
          verification: "true"
        });
      } else {
        setErrors({ general: errorMessage });
      }
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

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="p-8 border-0 shadow-lg">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
              <p className="text-gray-600">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="text-purple-600 font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

            {/* Auto-logout notification */}
            {autoLogoutMessage && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    i
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-800 text-sm font-medium">
                      {autoLogoutMessage}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoLogoutMessage(null)}
                    className="text-blue-400 hover:text-blue-600 text-lg leading-none ml-2"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Example@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
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
                {errors.general && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        !
                      </div>
                      <div className="flex-1">
                        <p className="text-red-700 text-sm font-medium">
                          {errors.general}
                        </p>
                        {errors.verification && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const { apiService } = await import('@/lib/api');
                                await apiService.resendActivation(formData.email);
                                alert('Activation email sent! Please check your inbox.');
                              } catch (error) {
                                alert('Failed to send activation email. Please try again.');
                              }
                            }}
                            className="text-purple-600 text-sm underline mt-2 hover:text-purple-700 font-medium"
                          >
                            Resend activation email
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-right">
                <Link href="/auth/forgot-password" className="text-purple-600 text-sm hover:underline">
                  Forget password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}